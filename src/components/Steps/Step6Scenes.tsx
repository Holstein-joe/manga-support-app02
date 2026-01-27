"use client";

import React, { useState, useEffect } from 'react';
import { Project, Episode, SceneItem, DialogueUnit, CharacterItem, CharacterGroup } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, GripVertical, MessageSquare, ChevronRight, User, StickyNote } from 'lucide-react';
import { DrawingCanvas } from './DrawingCanvas';
import { DrawingModal } from './DrawingModal';
import { useCharacters } from '@/hooks/useCharacters';
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
    DragOverEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Step6ScenesProps {
    project: Project; // Kept for global characters if needed
    episode: Episode; // New: Structure data comes from here
    onUpdate: (updates: Partial<Episode>) => void; // Update Episode data
}

const SortableDialogueUnit = (props: {
    dialogue: DialogueUnit;
    panelId: string;
    groupId: string;
    characters?: CharacterItem[];
    groups?: CharacterGroup[];
    onUpdate: (groupId: string, panelId: string, dialogueId: string, updates: Partial<DialogueUnit>) => void;
    onDelete: (groupId: string, panelId: string, dialogueId: string) => void;
}) => {
    const {
        dialogue,
        panelId,
        groupId,
        characters,
        groups,
        onUpdate,
        onDelete
    } = props;
    const selectedChar = characters?.find((c: CharacterItem) => c.id === dialogue.characterId);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: dialogue.id,
        data: {
            type: 'dialogue',
            panelId,
            groupId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 0,
    };

    const [showMemo, setShowMemo] = useState(!!dialogue.memo);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-[#0a0a0a]/50 backdrop-blur-sm border ${isDragging ? 'border-zinc-400' : 'border-zinc-700'} rounded-lg p-3 group/dialogue transition-all hover:bg-zinc-800 hover:border-zinc-600`}
        >
            <div className="flex items-start gap-3">
                <div {...attributes} {...listeners} className="text-zinc-400 hover:text-white cursor-grab active:cursor-grabbing mt-2 shrink-0">
                    <GripVertical size={16} />
                </div>

                <div className="relative w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 overflow-hidden flex items-center justify-center shrink-0 mt-0.5 group/icon cursor-pointer">
                    {selectedChar?.icon ? (
                        <img src={selectedChar.icon} alt={selectedChar.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={16} className="text-zinc-400" />
                    )}

                    {/* Hidden Select Overlay */}
                    {characters && characters.length > 0 && (
                        <select
                            value={dialogue.characterId || ''}
                            onChange={(e) => {
                                const newId = e.target.value;
                                const charName = characters.find((c: CharacterItem) => c.id === newId)?.name || '';
                                onUpdate(groupId, panelId, dialogue.id, {
                                    characterId: newId,
                                    character: charName // Auto-fill name on selection
                                });
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer text-[16px] w-full h-full"
                            title="キャラクターを選択"
                        >
                            <option value="">キャラクター選択解除</option>
                            {groups && groups.length > 0 ? (
                                groups.map(group => {
                                    const groupChars = characters.filter(c => c.groupIds?.includes(group.id));
                                    if (groupChars.length === 0) return null;
                                    return (
                                        <optgroup key={group.id} label={group.name}>
                                            {groupChars.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    );
                                })
                            ) : (
                                characters.map((c: CharacterItem) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))
                            )}
                            {groups && groups.length > 0 && characters.filter(c => !c.groupIds || c.groupIds.length === 0).length > 0 && (
                                <optgroup label="その他">
                                    {characters.filter(c => !c.groupIds || c.groupIds.length === 0).map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    )}
                </div>

                <div className="w-28 shrink-0 mt-1">
                    <input
                        value={dialogue.character}
                        onChange={(e) => onUpdate(groupId, panelId, dialogue.id, { character: e.target.value })}
                        placeholder="名前"
                        className="bg-transparent text-sm font-bold text-zinc-300 placeholder:text-zinc-500 focus:outline-none w-full border-b border-transparent focus:border-zinc-600 pb-0.5"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <textarea
                        value={dialogue.text}
                        onChange={(e) => onUpdate(groupId, panelId, dialogue.id, { text: e.target.value })}
                        placeholder="セリフを入力..."
                        rows={1}
                        className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed py-1.5 min-h-[32px]"
                    />

                    {showMemo && (
                        <div className="relative mt-1">
                            <input
                                value={dialogue.memo}
                                onChange={(e) => onUpdate(groupId, panelId, dialogue.id, { memo: e.target.value })}
                                placeholder="演出メモを入力..."
                                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded px-2 py-1 text-sm text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-colors"
                            />
                            <button
                                onClick={() => {
                                    onUpdate(groupId, panelId, dialogue.id, { memo: '' });
                                    setShowMemo(false);
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 p-1"
                                title="メモを削除して閉じる"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 mt-0.5 shrink-0 opacity-0 group-hover/dialogue:opacity-100 transition-opacity">
                    {!showMemo && (
                        <button
                            onClick={() => setShowMemo(true)}
                            className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="演出メモを追加"
                        >
                            <StickyNote size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(groupId, panelId, dialogue.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                        title="削除"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const SortablePanelCard = ({ item, parentId, activeId, activeType, characters, groups, onUpdateItem, onDeleteItem, onAddDialogue, onUpdateDialogue, onDeleteDialogue, onOpenModal }: {
    item: SceneItem;
    parentId: string;
    activeId: string | null;
    activeType: 'panel' | 'dialogue' | null;
    characters?: CharacterItem[];
    groups?: CharacterGroup[];
    onUpdateItem: (groupId: string, panelId: string, updates: Partial<SceneItem>) => void;
    onDeleteItem: (groupId: string, itemId: string) => void;
    onAddDialogue: (groupId: string, panelId: string) => void;
    onUpdateDialogue: (groupId: string, panelId: string, dialogueId: string, updates: Partial<DialogueUnit>) => void;
    onDeleteDialogue: (groupId: string, panelId: string, dialogueId: string) => void;
    onOpenModal: (panel: SceneItem, groupId: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: 'panel',
            parentId
        }
    });

    const { setNodeRef: setDialogueDroppableRef, isOver } = useDroppable({
        id: `droppable-dialogue-${item.id}`,
        data: {
            type: 'dialogue-container',
            panelId: item.id,
            parentId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const isActiveDialogueOver = isOver && activeType === 'dialogue';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-zinc-900 rounded-xl border transition-all duration-200 overflow-hidden flex flex-row items-start w-full relative min-h-[220px] 
                ${isDragging ? 'border-zinc-400 shadow-xl' : 'border-zinc-800'}
                ${isActiveDialogueOver ? 'ring-2 ring-zinc-400 ring-inset bg-zinc-800' : ''}
                group`}
        >
            <button
                onClick={() => onDeleteItem(parentId, item.id)}
                className="absolute top-4 right-4 p-2 bg-[#0a0a0a]/80 border border-zinc-700 rounded-lg text-zinc-400 hover:text-red-400 hover:border-red-400 transition-all z-40 opacity-0 group-hover:opacity-100"
                title="パネルを削除"
            >
                <Trash2 size={18} />
            </button>

            {/* Canvas Wrapper */}
            <div
                className="relative w-[320px] flex-shrink-0 flex flex-col items-stretch max-h-fit overflow-hidden cursor-pointer group/canvas bg-[#0a0a0a] rounded-lg"
                onClick={() => onOpenModal(item, parentId)}
            >
                <div className="absolute inset-0 bg-[#0a0a0a]/60 opacity-0 group-hover/canvas:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <span className="bg-zinc-900 text-white text-sm font-bold px-4 py-2 rounded-full border border-zinc-600 shadow-lg">タップして全画面で描画</span>
                </div>
                <DrawingCanvas
                    initialData={item.drawing}
                    onChange={(dataUrl) => onUpdateItem(parentId, item.id, { drawing: dataUrl })}
                    className="w-full h-full pointer-events-none"
                    showTools={false}
                />

                <div {...attributes} {...listeners} className="absolute top-3 left-3 p-2 bg-zinc-900/80 border border-zinc-600 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white z-20" onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={18} />
                </div>
            </div>

            <div
                ref={setDialogueDroppableRef}
                className={`flex-1 p-6 flex flex-col min-w-0 self-stretch transition-colors ${isActiveDialogueOver ? 'bg-zinc-800' : 'bg-zinc-900/40'}`}
            >
                <div className="flex items-center justify-between mb-4 pr-12">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <MessageSquare size={16} />
                        <span className="text-sm font-bold">セリフ・演出</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddDialogue(parentId, item.id)}
                        className="text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 px-3"
                    >
                        <Plus size={14} className="mr-1.5" /> 追加
                    </Button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                    <SortableContext
                        items={item.dialogues?.map(d => d.id) || []}
                        strategy={verticalListSortingStrategy}
                    >
                        {item.dialogues?.map((d) => (
                            <SortableDialogueUnit
                                key={d.id}
                                dialogue={d}
                                panelId={item.id}
                                groupId={parentId}
                                characters={characters}
                                groups={groups}
                                onUpdate={onUpdateDialogue}
                                onDelete={onDeleteDialogue}
                            />
                        ))}
                    </SortableContext>

                    {(!item.dialogues || item.dialogues.length === 0) && (
                        <div className={`h-full min-h-[100px] flex items-center justify-center border border-dashed rounded-lg transition-colors ${isActiveDialogueOver ? 'border-zinc-500 bg-zinc-800' : 'border-zinc-800'}`}>
                            <span className="text-sm text-zinc-500 font-bold">
                                {isActiveDialogueOver ? 'ここにドロップ' : 'セリフがありません'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GroupSection = ({ group, activeId, activeType, characters, groups, onAddItem, onUpdateItem, onDeleteItem, onAddDialogue, onUpdateDialogue, onDeleteDialogue, onOpenModal }: {
    group: any;
    activeId: string | null;
    activeType: 'panel' | 'dialogue' | null;
    characters?: CharacterItem[];
    groups?: CharacterGroup[];
    onAddItem: (groupId: string) => void;
    onUpdateItem: (groupId: string, itemId: string, updates: Partial<SceneItem>) => void;
    onDeleteItem: (groupId: string, itemId: string) => void;
    onAddDialogue: (groupId: string, panelId: string) => void;
    onUpdateDialogue: (groupId: string, panelId: string, dialogueId: string, updates: Partial<DialogueUnit>) => void;
    onDeleteDialogue: (groupId: string, panelId: string, dialogueId: string) => void;
    onOpenModal: (panel: SceneItem, groupId: string) => void;
}) => {
    const { setNodeRef } = useDroppable({
        id: group.id,
        data: {
            type: 'group'
        }
    });

    return (
        <div ref={setNodeRef} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-zinc-800 pb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ChevronRight size={20} className="text-zinc-500" />
                    {group.content || '名称未定のエピソード'}
                </h3>
                <div className="flex-1"></div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddItem(group.id)}
                    className="text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 px-4"
                >
                    <Plus size={16} className="mr-1.5" /> パネル追加
                </Button>
            </div>

            <div
                className="flex flex-col gap-10 p-4 max-w-5xl mx-auto"
            >
                <SortableContext
                    items={group.scenes?.map((s: any) => s.id) || []}
                    strategy={verticalListSortingStrategy}
                >
                    {group.scenes?.map((item: any) => (
                        <SortablePanelCard
                            key={item.id}
                            item={item}
                            activeId={activeId}
                            activeType={activeType}
                            parentId={group.id}
                            characters={characters}
                            groups={groups}
                            onUpdateItem={onUpdateItem}
                            onDeleteItem={onDeleteItem}
                            onAddDialogue={onAddDialogue}
                            onUpdateDialogue={onUpdateDialogue}
                            onDeleteDialogue={onDeleteDialogue}
                            onOpenModal={onOpenModal}
                        />
                    ))}
                </SortableContext>

                {group.scenes?.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-zinc-500 text-sm font-bold mb-4">パネルがありません</p>
                        <Button
                            onClick={() => onAddItem(group.id)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2 rounded-full"
                        >
                            <Plus size={16} className="mr-2" /> 最初の一枚を追加
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-center pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => onAddItem(group.id)}
                            className="text-sm font-bold text-zinc-500 hover:text-white border border-dashed border-zinc-700 hover:border-zinc-500 px-8 py-6 rounded-xl w-full"
                        >
                            <Plus size={16} className="mr-2" /> ここにパネルを追加
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Step6Scenes: React.FC<Step6ScenesProps> = ({ project, episode, onUpdate }) => {
    const { characters: globalCharacters, groups: globalGroups } = useCharacters();

    const linkedIds = episode.linkedCharacterIds || [];
    const linkedCharacters = globalCharacters.filter(c => linkedIds.includes(c.id));
    // Fallback/Legacy
    const legacyCharacters = project.characters || [];
    const availableCharacters = [...linkedCharacters, ...legacyCharacters];
    // De-duplicate just in case
    const uniqueChars = Array.from(new Map(availableCharacters.map(c => [c.id, c])).values());

    const [structure, setStructure] = useState(episode.structureBoard || []);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<'panel' | 'dialogue' | null>(null);

    const [modalState, setModalState] = useState<{ isOpen: boolean, panel: SceneItem | null, groupId: string }>({
        isOpen: false,
        panel: null,
        groupId: ''
    });

    useEffect(() => {
        setStructure(episode.structureBoard || []);
    }, [episode.structureBoard]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8, delay: 100 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleOpenModal = (panel: SceneItem, groupId: string) => {
        setModalState({ isOpen: true, panel, groupId });
    };

    const handleUpdatePanelInModal = (dataUrl: string) => {
        if (modalState.panel) {
            handleUpdateItem(modalState.groupId, modalState.panel.id, { drawing: dataUrl });
            setModalState(prev => ({ ...prev, panel: { ...prev.panel!, drawing: dataUrl } }));
        }
    };

    const handleAddItem = (groupId: string) => {
        const newItem: SceneItem = {
            id: crypto.randomUUID(),
            drawing: '',
            dialogues: []
        };
        const newStructure = structure.map(g => {
            if (g.id === groupId) {
                return { ...g, scenes: [...(g.scenes || []), newItem] };
            }
            return g;
        });
        setStructure(newStructure);
        onUpdate({ structureBoard: newStructure });
    };

    const handleUpdateItem = async (groupId: string, panelId: string, updates: Partial<SceneItem>) => {
        const newStructure = structure.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    scenes: (g.scenes || []).map(s => s.id === panelId ? { ...s, ...updates } : s)
                };
            }
            return g;
        });
        setStructure(newStructure);
        // await onUpdate({ structureBoard: newStructure }); // Removed await to prevent lag
        onUpdate({ structureBoard: newStructure });
    };

    const handleDeleteItem = (groupId: string, panelId: string) => {
        const newStructure = structure.map(g => {
            if (g.id === groupId) {
                return { ...g, scenes: (g.scenes || []).filter(s => s.id !== panelId) };
            }
            return g;
        });
        setStructure(newStructure);
        onUpdate({ structureBoard: newStructure });
    };

    const handleAddDialogue = (groupId: string, panelId: string) => {
        const newDialogue: DialogueUnit = {
            id: crypto.randomUUID(),
            character: '',
            text: '',
            memo: ''
        };
        const newStructure = structure.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    scenes: (g.scenes || []).map(s => {
                        if (s.id === panelId) {
                            return { ...s, dialogues: [...(s.dialogues || []), newDialogue] };
                        }
                        return s;
                    })
                };
            }
            return g;
        });
        setStructure(newStructure);
        onUpdate({ structureBoard: newStructure });
    };

    const handleUpdateDialogue = (groupId: string, panelId: string, dialogueId: string, updates: Partial<DialogueUnit>) => {
        const newStructure = structure.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    scenes: (g.scenes || []).map(s => {
                        if (s.id === panelId) {
                            return {
                                ...s,
                                dialogues: (s.dialogues || []).map(d => d.id === dialogueId ? { ...d, ...updates } : d)
                            };
                        }
                        return s;
                    })
                };
            }
            return g;
        });
        setStructure(newStructure);
        onUpdate({ structureBoard: newStructure });
    };

    const handleDeleteDialogue = (groupId: string, panelId: string, dialogueId: string) => {
        const newStructure = structure.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    scenes: (g.scenes || []).map(s => {
                        if (s.id === panelId) {
                            return { ...s, dialogues: (s.dialogues || []).filter(d => d.id !== dialogueId) };
                        }
                        return s;
                    })
                };
            }
            return g;
        });
        setStructure(newStructure);
        onUpdate({ structureBoard: newStructure });
    };

    const findGroup = (id: string, type: 'panel' | 'dialogue') => {
        if (type === 'panel') {
            return structure.find(g => g.id === id || g.scenes?.some(s => s.id === id))?.id;
        } else {
            for (const group of structure) {
                for (const panel of group.scenes || []) {
                    if (panel.dialogues?.some(d => d.id === id)) return group.id;
                }
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setActiveType(active.data.current?.type as 'panel' | 'dialogue');
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeData?.type === 'dialogue') {
            const activePanelId = activeData.panelId;
            let overPanelId = '';
            if (overData?.type === 'dialogue') {
                overPanelId = overData.panelId;
            } else if (overData?.type === 'dialogue-container') {
                overPanelId = overData.panelId;
            } else if (overData?.type === 'panel') {
                overPanelId = over.id as string;
            }

            if (overPanelId && activePanelId !== overPanelId) {
                setStructure(prev => {
                    const newStructure = JSON.parse(JSON.stringify(prev));
                    let draggedItem: DialogueUnit | undefined;

                    newStructure.forEach((g: any) => {
                        g.scenes?.forEach((s: any) => {
                            if (s.id === activePanelId) {
                                const dialogueIndex = s.dialogues?.findIndex((d: any) => d.id === active.id);
                                if (dialogueIndex !== -1) {
                                    draggedItem = s.dialogues[dialogueIndex];
                                    s.dialogues.splice(dialogueIndex, 1);
                                }
                            }
                        });
                    });

                    if (draggedItem) {
                        newStructure.forEach((g: any) => {
                            g.scenes?.forEach((s: any) => {
                                if (s.id === overPanelId) {
                                    s.dialogues = s.dialogues || [];
                                    const overIndex = s.dialogues.findIndex((d: any) => d.id === over.id);
                                    if (overIndex >= 0) {
                                        s.dialogues.splice(overIndex, 0, draggedItem);
                                    } else {
                                        s.dialogues.push(draggedItem);
                                    }
                                }
                            });
                        });
                    }
                    return newStructure;
                });
                active.data.current!.panelId = overPanelId;
            }
        } else if (activeData?.type === 'panel') {
            const activeGroupId = activeData.parentId;
            const overGroupId = overData?.type === 'panel' ? overData.parentId : over.id;

            if (activeGroupId !== overGroupId) {
                setStructure(prev => {
                    const newStructure = JSON.parse(JSON.stringify(prev));
                    let draggedItem: SceneItem | undefined;

                    newStructure.forEach((g: any) => {
                        if (g.id === activeGroupId) {
                            draggedItem = g.scenes?.find((s: any) => s.id === active.id);
                            g.scenes = g.scenes?.filter((s: any) => s.id !== active.id);
                        }
                    });

                    if (draggedItem) {
                        newStructure.forEach((g: any) => {
                            if (g.id === overGroupId) {
                                const scenes = [...(g.scenes || [])];
                                const overIndex = scenes.findIndex(s => s.id === over.id);
                                if (overIndex >= 0) {
                                    scenes.splice(overIndex, 0, draggedItem!);
                                } else {
                                    scenes.push(draggedItem!);
                                }
                                g.scenes = scenes;
                            }
                        });
                    }
                    return newStructure;
                });
                active.data.current!.parentId = overGroupId;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveType(null);

        if (!over) return;

        if (active.id !== over.id) {
            const activeData = active.data.current;
            const overData = over.data.current;

            if (activeData?.type === 'dialogue') {
                let activePanelId = '';
                structure.forEach(g => g.scenes?.forEach(s => {
                    if (s.dialogues?.some(d => d.id === active.id)) activePanelId = s.id;
                }));

                const overPanelId = overData?.panelId || (overData?.type === 'panel' ? over.id : null);

                if (activePanelId && activePanelId === overPanelId) {
                    setStructure(prev => prev.map(g => ({
                        ...g,
                        scenes: (g.scenes || []).map(s => {
                            if (s.id === activePanelId) {
                                const oldIndex = s.dialogues?.findIndex(d => d.id === active.id) ?? -1;
                                const newIndex = s.dialogues?.findIndex(d => d.id === over.id) ?? -1;
                                if (oldIndex !== -1 && newIndex !== -1) {
                                    return { ...s, dialogues: arrayMove(s.dialogues, oldIndex, newIndex) };
                                }
                            }
                            return s;
                        })
                    })));
                }
            } else if (activeData?.type === 'panel') {
                let activeGroupId = '';
                structure.forEach(g => {
                    if (g.scenes?.some(s => s.id === active.id)) activeGroupId = g.id;
                });

                const overGroupId = overData?.parentId || (overData?.type === 'container' ? over.id : null);

                if (activeGroupId && activeGroupId === overGroupId) {
                    setStructure(prev => prev.map(g => {
                        if (g.id === activeGroupId) {
                            const scenes = g.scenes || [];
                            const oldIndex = scenes.findIndex((s: SceneItem) => s.id === active.id) ?? -1;
                            const newIndex = scenes.findIndex((s: SceneItem) => s.id === over.id) ?? -1;
                            if (oldIndex !== -1 && newIndex !== -1) {
                                return { ...g, scenes: arrayMove(scenes, oldIndex, newIndex) };
                            }
                        }
                        return g;
                    }));
                }
            }
        }
        onUpdate({ structureBoard: structure });
    };

    const allPanels = structure.flatMap(g => g.scenes || []);
    const activePanel = allPanels.find(p => p.id === activeId);
    // const activeDialogue = allPanels.flatMap(p => p.dialogues || []).find(d => d.id === activeId);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div>
                <h2 className="text-2xl font-black flex items-center gap-3 text-white">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-zinc-900 text-sm">5</span>
                    ネーム制作 (下書き)
                </h2>
                <p className="text-zinc-500 text-sm mt-2 font-medium tracking-wide">
                    エピソードをコマ（パネル）に落とし込み、セリフや演出を細かく構築します。
                </p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-20">
                    {structure.map((group) => (
                        <GroupSection
                            key={group.id}
                            group={group}
                            activeId={activeId}
                            activeType={activeType}
                            characters={uniqueChars}
                            groups={globalGroups}
                            onAddItem={handleAddItem}
                            onUpdateItem={handleUpdateItem}
                            onDeleteItem={handleDeleteItem}
                            onAddDialogue={handleAddDialogue}
                            onUpdateDialogue={handleUpdateDialogue}
                            onDeleteDialogue={handleDeleteDialogue}
                            onOpenModal={handleOpenModal}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                    {activeId && activeType === 'panel' && activePanel ? (
                        <div className="w-[800px] shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                            <SortablePanelCard
                                item={activePanel}
                                parentId={findGroup(activeId, 'panel')!}
                                activeId={null}
                                activeType={null}
                                characters={uniqueChars}
                                groups={globalGroups}
                                onUpdateItem={handleUpdateItem}
                                onDeleteItem={handleDeleteItem}
                                onAddDialogue={handleAddDialogue}
                                onUpdateDialogue={handleUpdateDialogue}
                                onDeleteDialogue={handleDeleteDialogue}
                                onOpenModal={handleOpenModal}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {modalState.isOpen && modalState.panel && (
                <DrawingModal
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                    initialData={modalState.panel.drawing}
                    onSave={handleUpdatePanelInModal}
                />
            )}
        </div>
    );
};