import React, { useState, useEffect } from 'react';
import { Project, SceneItem, DialogueUnit, CharacterItem, CharacterGroup } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, GripVertical, MessageSquare, ChevronRight, User } from 'lucide-react';
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
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-black/20 backdrop-blur-sm border ${isDragging ? 'border-white' : 'border-white/5'} rounded-xl p-4 group/dialogue transition-all hover:bg-black/30 hover:border-white/10`}
        >
            <div className="flex items-center gap-3 mb-2">
                <div {...attributes} {...listeners} className="text-zinc-600 hover:text-white cursor-grab active:cursor-grabbing">
                    <GripVertical size={12} />
                </div>

                <div className="flex items-center gap-2">
                    {/* キャラクターアイコン */}
                    <div className="w-6 h-6 rounded-full bg-zinc-700/50 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {selectedChar?.icon ? (
                            <img src={selectedChar.icon} alt={selectedChar.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={12} className="text-zinc-500" />
                        )}
                    </div>

                    {/* Character Selection */}
                    {characters && characters.length > 0 ? (
                        <select
                            value={dialogue.characterId || ''}
                            onChange={(e) => onUpdate(groupId, panelId, dialogue.id, {
                                characterId: e.target.value,
                                character: characters.find((c: CharacterItem) => c.id === e.target.value)?.name || ''
                            })}
                            className="bg-zinc-900 border-none text-[10px] font-black uppercase tracking-wider text-white/40 focus:outline-none focus:text-white cursor-pointer hover:text-white transition-colors py-0.5 rounded"
                        >
                            <option value="" className="bg-zinc-900 text-zinc-500">配役を選択</option>
                            {groups && groups.length > 0 ? (
                                groups.map(group => {
                                    const groupChars = characters.filter(c => c.groupIds?.includes(group.id));
                                    if (groupChars.length === 0) return null;
                                    return (
                                        <optgroup key={group.id} label={group.name} className="bg-zinc-900 text-zinc-500 font-bold">
                                            {groupChars.map(c => (
                                                <option key={c.id} value={c.id} className="bg-zinc-900 text-white font-normal">
                                                    {c.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    );
                                })
                            ) : (
                                characters.map((c: CharacterItem) => (
                                    <option key={c.id} value={c.id} className="bg-zinc-900 text-white">
                                        {c.name}
                                    </option>
                                ))
                            )}
                            {/* Characters with no group */}
                            {groups && groups.length > 0 && characters.filter(c => !c.groupIds || c.groupIds.length === 0).length > 0 && (
                                <optgroup label="その他" className="bg-zinc-900 text-zinc-500 font-bold">
                                    {characters.filter(c => !c.groupIds || c.groupIds.length === 0).map(c => (
                                        <option key={c.id} value={c.id} className="bg-zinc-900 text-white font-normal">
                                            {c.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    ) : (
                        <input
                            value={dialogue.character}
                            onChange={(e) => onUpdate(groupId, panelId, dialogue.id, { character: e.target.value })}
                            placeholder="キャラクター名"
                            className="bg-transparent text-[9px] font-black uppercase tracking-[0.2em] text-white/50 placeholder:text-zinc-700 focus:outline-none w-24"
                        />
                    )}
                </div>

                <div className="h-px flex-1 bg-zinc-700/20"></div>
                <button
                    onClick={() => onDelete(groupId, panelId, dialogue.id)}
                    className="opacity-0 group-hover/dialogue:opacity-100 p-1 text-zinc-600 hover:text-white transition-opacity"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            <textarea
                value={dialogue.text}
                onChange={(e) => onUpdate(groupId, panelId, dialogue.id, { text: e.target.value })}
                placeholder="セリフの内容..."
                rows={1}
                className="w-full bg-transparent text-base text-zinc-100 placeholder:text-zinc-800 focus:outline-none resize-none mb-1 font-medium leading-relaxed"
            />

            <input
                value={dialogue.memo}
                onChange={(e) => onUpdate(groupId, panelId, dialogue.id, { memo: e.target.value })}
                placeholder="演出メモ / コンテキスト..."
                className="w-full bg-transparent text-[10px] font-bold text-zinc-600 placeholder:text-zinc-800 focus:outline-none focus:text-zinc-400 transition-colors"
            />
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

    // Special droppable zone for dialogues to accept items from other panels
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
                ${isDragging ? 'border-white shadow-[0_0_40px_rgba(255,255,255,0.15)]' : 'border-zinc-800'}
                ${isActiveDialogueOver ? 'ring-2 ring-white ring-inset bg-zinc-800/60 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : ''}
                group`}
        >
            <button
                onClick={() => onDeleteItem(parentId, item.id)}
                className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 rounded-lg text-zinc-500 hover:text-red-400 hover:border-red-400/50 transition-all z-40 opacity-0 group-hover:opacity-100"
                title="パネルを削除"
            >
                <Trash2 size={18} />
            </button>

            <div
                className="relative w-[320px] flex-shrink-0 flex flex-col items-stretch max-h-fit overflow-hidden cursor-pointer group/canvas"
                onClick={() => onOpenModal(item, parentId)}
            >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/canvas:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20">タップして全画面で描画</span>
                </div>
                <DrawingCanvas
                    initialData={item.drawing}
                    onChange={(dataUrl) => onUpdateItem(parentId, item.id, { drawing: dataUrl })}
                    className="w-full h-full pointer-events-none"
                    showTools={false}
                />

                <div {...attributes} {...listeners} className="absolute top-3 left-3 p-1.5 bg-black/60 border border-white/20 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white z-20" onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={16} />
                </div>
            </div>

            <div
                ref={setDialogueDroppableRef}
                className={`flex-1 p-6 flex flex-col min-w-0 self-stretch transition-colors ${isActiveDialogueOver ? 'bg-white/5' : 'bg-zinc-900/40'}`}
            >
                <div className="flex items-center justify-between mb-4 pr-12">
                    <div className="flex items-center gap-2 text-white/30">
                        <MessageSquare size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">セリフ・演出</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddDialogue(parentId, item.id)}
                        className="h-7 text-[9px] font-black text-white/40 hover:text-white border border-white/5 hover:border-white/20 px-2"
                    >
                        <Plus size={12} className="mr-1" /> ユニット追加
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
                        <div className={`h-full min-h-[100px] flex items-center justify-center border border-dashed rounded-lg transition-colors ${isActiveDialogueOver ? 'border-white bg-white/5' : 'border-zinc-800'}`}>
                            <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.1em]">
                                {isActiveDialogueOver ? 'ドロップして割り当て' : 'セリフなし'}
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
            <div className="flex items-center gap-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <ChevronRight size={16} className="text-zinc-600" />
                    {group.content || '名称未定のエピソード'}
                </h3>
                <div className="h-px bg-zinc-800 flex-1"></div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddItem(group.id)}
                    className="h-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white border border-transparent hover:border-white/10 px-3"
                >
                    <Plus size={14} className="mr-1" /> コマ追加
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
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-3xl opacity-50">
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">パネルがありません</p>
                    </div>
                ) : (
                    <div className="flex justify-center pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAddItem(group.id)}
                            className="h-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white border border-dashed border-zinc-800 hover:border-white/20 px-8 rounded-xl"
                        >
                            <Plus size={14} className="mr-2" /> コマを追加
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Step6Scenes: React.FC<Step6ScenesProps> = ({ project, onUpdate }) => {
    const { characters: globalCharacters, groups: globalGroups } = useCharacters();

    // Resolve characters to use: project-linked ones + legacy ones
    const linkedIds = project.linkedCharacterIds || [];
    const linkedCharacters = globalCharacters.filter(c => linkedIds.includes(c.id));
    const legacyCharacters = project.characters || [];
    const availableCharacters = [...linkedCharacters, ...legacyCharacters];

    const [structure, setStructure] = useState(project.structureBoard || []);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<'panel' | 'dialogue' | null>(null);

    const [modalState, setModalState] = useState<{ isOpen: boolean, panel: SceneItem | null, groupId: string }>({
        isOpen: false,
        panel: null,
        groupId: ''
    });

    useEffect(() => {
        setStructure(project.structureBoard || []);
    }, [project.structureBoard]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8, delay: 100 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleOpenModal = (panel: SceneItem, groupId: string) => {
        setModalState({ isOpen: true, panel, groupId });
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
        await onUpdate({ structureBoard: newStructure });
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
            // Target can be another dialogue or a dialogue container (panel)
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

                    // Remove from source panel
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

                    // Add to target panel
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
                                    // Update metadata logic (via ref or state side-effect)
                                    // dnd-kit uses the data at start, so we must manually track current state
                                }
                            });
                        });
                    }
                    return newStructure;
                });
                // In dnd-kit, handleDragOver is for optimistic visual move
                // We update active context data manually to track the current panel
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
                // Determine CURRENT panel of both active and over items (as they might have moved in Over)
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
    const activeDialogue = allPanels.flatMap(p => p.dialogues || []).find(d => d.id === activeId);

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
                            characters={availableCharacters}
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
                                characters={availableCharacters}
                                groups={globalGroups}
                                onUpdateItem={handleUpdateItem}
                                onDeleteItem={handleDeleteItem}
                                onAddDialogue={handleAddDialogue}
                                onUpdateDialogue={handleUpdateDialogue}
                                onDeleteDialogue={handleDeleteDialogue}
                                onOpenModal={handleOpenModal}
                            />
                        </div>
                    ) : activeId && activeType === 'dialogue' && activeDialogue ? (
                        <div className="w-[300px] shadow-2xl">
                            <div className="bg-zinc-800 border border-white/40 rounded-lg p-3">
                                <span className="text-[10px] text-white/40 block mb-1">{activeDialogue.character || 'キャラクター名'}</span>
                                <p className="text-sm text-white">{activeDialogue.text || 'セリフの内容...'}</p>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Drawing Modal */}
            {modalState.isOpen && modalState.panel && (
                <DrawingModal
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ ...modalState, isOpen: false })}
                    initialData={modalState.panel.drawing}
                    onSave={(dataUrl) => handleUpdateItem(modalState.groupId, modalState.panel!.id, { drawing: dataUrl })}
                    title="下書きの編集"
                />
            )}
        </div>
    );
};