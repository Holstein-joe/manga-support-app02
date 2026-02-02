"use client";

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { DrawingCanvas } from './DrawingCanvas';
import { Button } from '@/components/ui/Button';

interface DrawingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: string;
    onSave: (dataUrl: string) => void;
    title?: string;
}

export const DrawingModal: React.FC<DrawingModalProps> = ({
    isOpen,
    onClose,
    initialData,
    onSave,
    title = "ネームの下書き"
}) => {
    const [currentData, setCurrentData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Reset internal state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentData(initialData);
            setIsSaving(false);
            setShowToast(false);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onSave(currentData);
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                onClose();
            }, 800);
        } catch (error) {
            console.error("Save failed:", error);
            setIsSaving(false);
        }
    };

    return (
        <div
            id="modal-overlay"
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-0 m-0 animate-in fade-in duration-300"
            onClick={(e) => {
                // Save and close when clicking outside the content area
                if ((e.target as HTMLElement).id === "modal-overlay") {
                    handleSave();
                }
            }}
        >
            {/* Save Status Toast */}
            {showToast && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[150] bg-white text-black px-8 py-3 rounded-full font-black shadow-[0_10px_40px_rgba(255,255,255,0.2)] flex items-center gap-3 animate-in slide-in-from-top-8">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    保存しました
                </div>
            )}

            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 bg-zinc-950 border-b border-white/5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all disabled:opacity-30"
                        title="変更を破棄して閉じる"
                    >
                        <X size={28} />
                    </button>
                    <div>
                        <h2 className="text-white font-black text-xl tracking-tight">{title}</h2>
                        <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Focus Mode / Full Screen</p>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="bg-white text-black hover:bg-zinc-200 font-black px-8 h-12 rounded-xl disabled:bg-zinc-700"
                >
                    <Save size={20} className="mr-2" />
                    {isSaving ? '保存中...' : '保存して閉じる'}
                </Button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-6 md:p-12" onClick={(e) => {
                if ((e.target as HTMLElement).id === "editor-container") {
                    handleSave();
                }
            }} id="editor-container">
                <div
                    className="w-full max-w-5xl bg-zinc-950 rounded-2xl shadow-[0_0_100px_rgba(255,255,255,0.03)] border border-white/10 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <DrawingCanvas
                        initialData={initialData}
                        onChange={setCurrentData}
                        className="w-full border-0"
                        showTools={true}
                    />
                </div>

                <div className="mt-8 text-zinc-600 text-xs font-bold tracking-widest uppercase opacity-40">
                    画面の外側をタップしてクイック保存
                </div>
            </div>
        </div>
    );
};
