"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Undo2, Redo2 } from 'lucide-react';

interface DrawingCanvasProps {
    initialData?: string;
    onChange: (dataUrl: string) => void;
    className?: string;
    showTools?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    initialData,
    onChange,
    className = '',
    showTools = true
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [brushSize, setBrushSize] = useState<number>(1); // Default to 'Extra Fine'
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    // History stacks
    const [drawHistory, setDrawHistory] = useState<string[]>([]);
    const [redoHistory, setRedoHistory] = useState<string[]>([]);

    // Points for smoothing
    const pointsRef = useRef<{ x: number, y: number }[]>([]);
    const requestRef = useRef<number | undefined>(undefined);

    // Initial setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use desynchronized for lower latency if possible
        const ctx = canvas.getContext('2d', {
            alpha: true
        });
        if (!ctx) return;

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = '#000000'; // 黒ペンに変更
        setContext(ctx);

        if (initialData) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // Initialize history with initial data if present
                setDrawHistory([initialData]);
            };
            img.src = initialData;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setDrawHistory(['']); // Empty canvas as first state
        }
    }, [initialData]);

    // Sync initialData prop if it changes from outside
    useEffect(() => {
        if (initialData && !drawHistory.includes(initialData)) {
            const img = new Image();
            img.onload = () => {
                context?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                context?.drawImage(img, 0, 0);
                setDrawHistory(prev => [...prev, initialData]);
                setRedoHistory([]);
            };
            img.src = initialData;
        }
    }, [initialData, drawHistory, context]);

    // Brush size and Tool sync
    useEffect(() => {
        if (context) {
            context.lineWidth = brushSize;
            context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
            // ツール切り替え時にも色を黒に維持
            if (tool === 'pen') {
                context.strokeStyle = '#000000';
            }
        }
    }, [brushSize, tool, context]);

    const saveToHistory = useCallback(() => {
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL();
            setDrawHistory(prev => [...prev, dataUrl]);
            setRedoHistory([]);
            onChange(dataUrl);
        }
    }, [onChange]);

    const undo = useCallback(() => {
        if (drawHistory.length <= 1) return;

        const newHistory = [...drawHistory];
        const currentState = newHistory.pop()!;
        setRedoHistory(prev => [...prev, currentState]);
        setDrawHistory(newHistory);

        const prevState = newHistory[newHistory.length - 1];
        const canvas = canvasRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (prevState) {
                const img = new Image();
                img.onload = () => context.drawImage(img, 0, 0);
                img.src = prevState;
            }
            onChange(prevState);
        }
    }, [drawHistory, context, onChange]);

    const redo = useCallback(() => {
        if (redoHistory.length === 0) return;

        const newRedoStack = [...redoHistory];
        const nextState = newRedoStack.pop()!;
        setDrawHistory(prev => [...prev, nextState]);
        setRedoHistory(newRedoStack);

        const canvas = canvasRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            const img = new Image();
            img.onload = () => context.drawImage(img, 0, 0);
            img.src = nextState;
            onChange(nextState);
        }
    }, [redoHistory, context, onChange]);

    // Keyboard Shortcuts
    useEffect(() => {
        if (!showTools) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            if (isMod && !isShift && e.key === 'z') {
                e.preventDefault();
                undo();
            } else if ((isMod && isShift && e.key === 'z') || (isMod && e.key === 'y')) {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, showTools]);

    const getCoordinates = (e: PointerEvent | React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const drawBatch = useCallback(() => {
        if (!context || pointsRef.current.length < 2) return;

        const pts = pointsRef.current;
        context.beginPath();

        // Start point
        context.moveTo(pts[0].x, pts[0].y);

        // Smooth drawing algorithm using midpoints for curves
        for (let i = 1; i < pts.length - 2; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            context.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }

        // For the last 2 points
        if (pts.length > 2) {
            const lastIdx = pts.length - 2;
            context.quadraticCurveTo(
                pts[lastIdx].x,
                pts[lastIdx].y,
                pts[lastIdx + 1].x,
                pts[lastIdx + 1].y
            );
        } else if (pts.length === 2) {
            context.lineTo(pts[1].x, pts[1].y);
        }

        context.stroke();
    }, [context]);

    const startDrawing = (e: React.PointerEvent) => {
        if (!context) return;
        setIsDrawing(true);
        const coords = getCoordinates(e);
        pointsRef.current = [coords];

        context.beginPath();
        context.moveTo(coords.x, coords.y);
    };

    const draw = (e: React.PointerEvent) => {
        if (!isDrawing || !context) return;

        // Use coalesced events for higher precision if available
        const events = (e.nativeEvent as any).getCoalescedEvents?.() || [e.nativeEvent];

        for (const event of events) {
            const coords = getCoordinates(event);
            pointsRef.current.push(coords);
        }

        // Optimization: Use requestAnimationFrame for smoother rendering
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(() => {
            drawBatch();
        });
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        pointsRef.current = [];
        saveToHistory();
    };

    const clearCanvas = () => {
        if (!context || !canvasRef.current) return;
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        saveToHistory();
    };

    const brushSizes = [
        { id: 'extra-fine', label: '極細', value: 1, dotSize: 'w-0.5 h-0.5' },
        { id: 'fine', label: '細', value: 3, dotSize: 'w-1.5 h-1.5' },
        { id: 'medium', label: '中', value: 6, dotSize: 'w-2.5 h-2.5' },
    ];

    return (
        <div className={`flex flex-col bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden w-full ${className}`}>
            {/* Canvas Render Area: 白背景に変更 */}
            <div
                className="relative w-full aspect-video bg-white overflow-hidden touch-none"
            >
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={180}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onPointerCancel={stopDrawing}
                    className="w-full h-full block cursor-crosshair touch-none relative z-10"
                />
            </div>

            {/* Tool UI */}
            {showTools && (
                <div className="bg-zinc-950 border-t border-zinc-800 p-3 md:p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Tool Switcher */}
                        <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setTool('pen')}
                                className={`w-12 h-10 flex flex-col items-center justify-center rounded-lg transition-all ${tool === 'pen' ? 'bg-primary text-white font-bold' : 'text-zinc-500 hover:text-white'
                                    }`}
                                title="ペン"
                            >
                                <span className="text-[14px]">✎</span>
                                <span className="text-[8px] font-black leading-tight">ペン</span>
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`w-12 h-10 flex flex-col items-center justify-center rounded-lg transition-all ${tool === 'eraser' ? 'bg-primary text-white font-bold' : 'text-zinc-500 hover:text-white'
                                    }`}
                                title="消しゴム"
                            >
                                <Eraser size={14} />
                                <span className="text-[8px] font-black leading-tight">消しゴム</span>
                            </button>
                        </div>

                        {/* History Controls */}
                        <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={undo}
                                disabled={drawHistory.length <= 1}
                                className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-20 transition-all"
                                title="元に戻す (Ctrl+Z)"
                            >
                                <Undo2 size={18} />
                            </button>
                            <button
                                onClick={redo}
                                disabled={redoHistory.length === 0}
                                className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-20 transition-all"
                                title="やり直し (Ctrl+Y / Ctrl+Shift+Z)"
                            >
                                <Redo2 size={18} />
                            </button>
                        </div>

                        {/* Brush Sizes */}
                        <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5">
                            {brushSizes.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => setBrushSize(size.value)}
                                    className={`flex flex-col items-center justify-center min-w-[48px] h-10 rounded-lg transition-all ${brushSize === size.value
                                        ? 'bg-primary text-white font-bold shadow-lg'
                                        : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                >
                                    <div className={`rounded-full mb-0.5 ${size.dotSize} ${brushSize === size.value ? 'bg-white' : 'bg-current'}`} />
                                    <span className="text-[9px] font-black">{size.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-2 px-4 h-10 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:bg-red-500 hover:text-white hover:border-red-600 transition-all font-bold"
                    >
                        <Eraser size={14} />
                        <span className="text-sm">クリア</span>
                    </button>
                </div>
            )}
        </div>
    );
};