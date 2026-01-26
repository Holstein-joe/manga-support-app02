import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Plus, X, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Step3StructureProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

type TagType = 'vs' | 'wakuwaku' | 'dokidoki' | 'bikkuri';

interface CardData {
    id: string;
    content: string;
    act: '1' | '2' | '3';
    tags?: TagType[];
}

const TAG_LABELS: Record<TagType, { label: string; color: string; bg: string }> = {
    vs: { label: 'VS', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
    wakuwaku: { label: 'ワクワク', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' },
    dokidoki: { label: 'ドキドキ', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
    bikkuri: { label: 'ビックリ', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
};

const SortableCard = ({ card, onDelete, onUpdate, isOverlay = false }: {
    card: CardData;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<CardData>) => void;
    isOverlay?: boolean;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id, data: { act: card.act } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const toggleTag = (tag: TagType) => {
        if (!onUpdate) return;
        const currentTags = card.tags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        onUpdate(card.id, { tags: newTags });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-lg border border-zinc-200 p-3 shadow-sm group hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 ${isOverlay ? 'shadow-xl cursor-grabbing' : ''}`}
        >
            <div className="flex items-start gap-2">
                <div {...attributes} {...listeners} className="mt-1 text-zinc-300 hover:text-zinc-600 cursor-grab active:cursor-grabbing dark:text-zinc-700 dark:hover:text-zinc-400">
                    <GripVertical size={16} />
                </div>
                <div className="flex-1 space-y-2">
                    <textarea
                        value={card.content}
                        onChange={(e) => onUpdate && onUpdate(card.id, { content: e.target.value })}
                        placeholder="イベント等の内容"
                        rows={2}
                        className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-50"
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag start from textarea
                    />
                    <div className="flex flex-wrap gap-1">
                        {(Object.keys(TAG_LABELS) as TagType[]).map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${card.tags?.includes(tag)
                                    ? `${TAG_LABELS[tag].bg} ${TAG_LABELS[tag].color} border-transparent font-bold`
                                    : 'bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {TAG_LABELS[tag].label}
                            </button>
                        ))}
                    </div>
                </div>
                {onDelete && (
                    <button
                        onClick={() => onDelete(card.id)}
                        className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export const Step3Structure: React.FC<Step3StructureProps> = ({ project, onUpdate }) => {
    const [items, setItems] = useState<CardData[]>(project.structureBoard || []);
    const [beats, setBeats] = useState(project.structureBeats || { tp1: '', midpoint: '', tp2: '' });
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        setItems(project.structureBoard || []);
        if (project.structureBeats) {
            setBeats(project.structureBeats);
        }
    }, [project.structureBoard, project.structureBeats]);

    const handleBeatChange = (field: keyof typeof beats, value: string) => {
        const newBeats = { ...beats, [field]: value };
        setBeats(newBeats);
        onUpdate({ structureBeats: newBeats });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8, delay: 100 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // If dropped over a container (column), move to that column
        const overContainerAct = (over.data.current?.sortable?.containerId || over.id) as string;

        let newItems = [...items];
        const activeIndex = newItems.findIndex(i => i.id === activeId);

        // If sorting within same act or moving between acts via sortable items
        if (activeId !== overId) {
            const overIndex = newItems.findIndex(i => i.id === overId);
            if (overIndex !== -1) {
                // Moved over another item
                newItems = arrayMove(newItems, activeIndex, overIndex);
                // Update the act to match the target
                newItems[activeIndex].act = newItems[overIndex].act;
            }
        }

        // Ensure act property is updated if dropped directly on column or empty space area handled by column logic
        // But SortableContext usually handles ordering. We need to check if the act changed.

        // Simple strategy: Update state, then sync.
        // Wait, dnd-kit logic for multiple containers needs to handle `act` property changes.
        // We will do a simplified version: Just simple reorder if local.
        // If complex cross-column logic is needed, we often use `onDragOver` to update state optimistically.
        // For MVP, assume we rely on simple `arrayMove`.

        // Actually, dnd-kit multi-container guide suggests updating state in onDragOver.
        // Let's implement a simpler version first: The user drags, we find where it landed.

        // However, for simplicity given the code block limit, I'll rely on SortableContext's id strategy.
        // I will group items by Act.

        onUpdate({ structureBoard: newItems });
        setItems(newItems); // Optimistic update
    };

    // Custom onDragOver to handle moving between columns
    const handleDragOver = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the containers
        const activeItem = items.find(i => i.id === activeId);
        const overItem = items.find(i => i.id === overId);

        if (!activeItem) return;

        // If over a column (we will make columns droppable)
        if (['1', '2', '3'].includes(overId)) {
            if (activeItem.act !== overId) {
                setItems(prev => {
                    const newItems = [...prev];
                    const index = newItems.findIndex(i => i.id === activeId);
                    newItems[index].act = overId as any;
                    return newItems;
                });
            }
            return;
        }

        // If over another item
        if (overItem && activeItem.act !== overItem.act) {
            setItems(prev => {
                const newItems = [...prev];
                const index = newItems.findIndex(i => i.id === activeId);
                newItems[index].act = overItem.act;
                // Move visually to correct index handled by subsequent dragEnd or arrayMove
                return arrayMove(newItems, index, newItems.indexOf(overItem));
            });
        }
    };

    const addItem = (act: '1' | '2' | '3') => {
        const newItem: CardData = {
            id: crypto.randomUUID(),
            content: '',
            act,
            tags: []
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        onUpdate({ structureBoard: newItems });
    };

    const updateItem = (id: string, updates: Partial<CardData>) => {
        const newItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
        setItems(newItems);
        onUpdate({ structureBoard: newItems });
    };

    const deleteItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        onUpdate({ structureBoard: newItems });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">3</span>
                        構造設計 (三幕構成)
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[calc(100vh-200px)] min-h-[500px]">
                    {['1', '2', '3'].map((act) => (
                        <div key={act} className="flex flex-col h-full bg-zinc-50 rounded-xl border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
                            {/* Header */}
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900 rounded-t-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                                        {act === '1' ? '第一幕: 状況設定・問題提起' : act === '2' ? '第二幕: 対立・葛藤' : '第三幕: 解決'}
                                    </h3>
                                    <span className="text-[10px] font-black font-mono text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded dark:bg-zinc-800">
                                        {act === '1' ? 'SETUP' : act === '2' ? 'CONFRONTATION' : 'RESOLUTION'}
                                    </span>
                                </div>
                                <div className="text-[11px] leading-relaxed text-zinc-600 font-medium">
                                    {act === '1' && (
                                        <>
                                            <p className="mb-0.5">物語の舞台は？</p>
                                            <p>主人公が解決しなければいけない問題は？</p>
                                        </>
                                    )}
                                    {act === '2' && (
                                        <>
                                            <p className="mb-0.5">主人公が挑戦・失敗・悩む姿は？</p>
                                            <p>どんな敵や障害が現れる？</p>
                                        </>
                                    )}
                                    {act === '3' && (
                                        <>
                                            <p className="mb-0.5">第一幕で提示した問題の答えは？</p>
                                            <p>主人公はどう変わった？</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Droppable Area */}
                            <SortableContext
                                id={act} // This container ID is used for dragOver detection
                                items={items.filter(i => i.act === act).map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[100px]">
                                    {items.filter(i => i.act === act).map((item) => (
                                        <SortableCard
                                            key={item.id}
                                            card={item}
                                            onDelete={deleteItem}
                                            onUpdate={updateItem}
                                        />
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed text-zinc-400 hover:text-zinc-600 dark:border-zinc-800 dark:hover:text-zinc-300"
                                        onClick={() => addItem(act as any)}
                                    >
                                        <Plus size={14} className="mr-1" /> カード追加
                                    </Button>
                                </div>
                            </SortableContext>

                            {/* Plot Point Fields */}
                            <div className="p-4 pt-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-b-xl space-y-3">
                                {act === '1' && (
                                    <div className="mt-3">
                                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 block">ターニングポイント 1 (TP1)</label>
                                        <textarea
                                            value={beats.tp1}
                                            onChange={(e) => handleBeatChange('tp1', e.target.value)}
                                            placeholder="物語が大きく動き出す瞬間..."
                                            rows={2}
                                            className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-rose-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                                        />
                                    </div>
                                )}
                                {act === '2' && (
                                    <div className="mt-3 space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5 block">中間点 (MP)</label>
                                            <textarea
                                                value={beats.midpoint}
                                                onChange={(e) => handleBeatChange('midpoint', e.target.value)}
                                                placeholder="物語の折り返し地点..."
                                                rows={2}
                                                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1.5 block">ターニングポイント 2 (TP2)</label>
                                            <textarea
                                                value={beats.tp2}
                                                onChange={(e) => handleBeatChange('tp2', e.target.value)}
                                                placeholder="クライマックスへの突入..."
                                                rows={2}
                                                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-rose-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                                {act === '3' && (
                                    <div className="py-2 text-center">
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fin.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                    {activeId ? (
                        <SortableCard
                            card={items.find(i => i.id === activeId)!}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};
