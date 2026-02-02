"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Settings, Users, BookOpen, Edit, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useProject } from "@/hooks/useProjects";
import { Project, Episode } from "@/types/project";
import { UserMenu } from "@/components/UserMenu";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
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

function SortableEpisodeItem({ episode, project, handleDeleteEpisode }: { episode: Episode, project: Project, handleDeleteEpisode: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: episode.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="group bg-[#111] border border-zinc-900 hover:border-zinc-700 rounded-xl p-5 flex items-center justify-between transition-all">
            <div className="flex-1 flex items-center gap-4">
                <div {...attributes} {...listeners} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing p-2">
                    <GripVertical size={20} />
                </div>
                <Link href={`/projects/${project.id}/episodes/${episode.id}`} className="flex-1 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 font-bold border border-zinc-800">
                        {episode.order}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg group-hover:text-amber-400 transition-colors">{episode.title}</h3>
                        {episode.concept?.theme && (
                            <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{episode.concept.theme}</p>
                        )}
                        <p className="text-sm text-zinc-500 mt-1">Last edited: {new Date(episode.lastEdited).toLocaleString()}</p>
                    </div>
                </Link>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/projects/${project.id}/episodes/${episode.id}`}>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Edit size={16} />
                    </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteEpisode(episode.id)} className="text-zinc-400 hover:text-red-400">
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}

export function ProjectPageClient({ id }: { id: string }) {
    const router = useRouter();
    const { project, loading, updateProject, mutate } = useProject(id);
    const [activeTab, setActiveTab] = useState<'episodes' | 'settings'>('episodes');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (loading) return <div className="p-8 text-center text-zinc-500">読み込み中...</div>;

    if (!project) {
        return <div className="p-8 text-center text-zinc-500">プロジェクトが見つかりません</div>;
    }

    const episodes = project.episodes || [];

    const handleCreateEpisode = async () => {
        const newEpisodeId = crypto.randomUUID();

        // Calculate next order safely
        const maxOrder = episodes.length > 0 ? Math.max(...episodes.map(e => e.order)) : 0;
        const nextOrder = maxOrder + 1;

        const newEpisode: Episode = {
            id: newEpisodeId,
            projectId: project.id,
            title: `第${nextOrder}話`,
            order: nextOrder,
            lastEdited: new Date().toISOString(),
        };

        const updatedEpisodes = [...episodes, newEpisode];

        // Optimistically update local state to avoid flicker? 
        // We are navigating away anyway, but good practice.
        mutate({ ...project, episodes: updatedEpisodes });

        try {
            // Wait for Server Save
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodes: updatedEpisodes })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server Save Error:", errorData);
                throw new Error(errorData.details || "Failed to save episode");
            }

            // Redirect to the new episode workspace
            router.push(`/projects/${project.id}/episodes/${newEpisodeId}`);
        } catch (err: any) {
            console.error(err);
            alert(`エピソードの作成に失敗しました。\n${(err as Error).message}`);
            // Revert optimistic update if needed, but we are just showing an alert.
        }
    };

    const handleDeleteEpisode = (episodeId: string) => {
        if (!confirm("エピソードを削除しますか？")) return;
        const updatedEpisodes = episodes.filter(e => e.id !== episodeId);
        updateProject({ episodes: updatedEpisodes });
    };



    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = episodes.findIndex((e) => e.id === active.id);
            const newIndex = episodes.findIndex((e) => e.id === over?.id);

            const newEpisodes = arrayMove(episodes, oldIndex, newIndex).map((ep, index) => ({
                ...ep,
                order: index + 1 // Auto-renumbering
            }));

            // Optimistic update
            mutate({ ...project, episodes: newEpisodes });

            // Persist
            updateProject({ episodes: newEpisodes });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">{project.title}</h1>
                            <p className="text-sm text-zinc-500">シリーズ設定・管理</p>
                        </div>
                    </div>
                    <UserMenu />
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
                {/* Tabs */}
                <div className="flex gap-8 border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('episodes')}
                        className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'episodes' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <BookOpen size={16} />
                        エピソード一覧
                    </button>
                    <Link href={`/projects/${id}/characters`}>
                        <button
                            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 transition-colors`}
                        >
                            <Users size={16} />
                            キャラクター名簿
                        </button>
                    </Link>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'settings' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Settings size={16} />
                        作品設定 (World)
                    </button>
                </div>

                {/* Episodes Tab */}
                {activeTab === 'episodes' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">エピソード</h2>
                            <Button onClick={handleCreateEpisode} className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-6">
                                <Plus size={16} className="mr-2" />
                                新しいエピソードを作成
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {episodes.length === 0 ? (
                                <div className="p-10 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
                                    まだエピソードがありません。
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={episodes.map(e => e.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {episodes.sort((a, b) => a.order - b.order).map((episode) => (
                                            <SortableEpisodeItem
                                                key={episode.id}
                                                episode={episode}
                                                project={project}
                                                handleDeleteEpisode={handleDeleteEpisode}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 block">作品タイトル</label>
                            <input
                                value={project.title}
                                onChange={(e) => updateProject({ title: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-zinc-600"
                            />
                        </div>

                        {/* World Settings Section (New) */}
                        <div className="pt-8 border-t border-zinc-800 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">世界観の設定項目</h3>
                                <p className="text-sm text-zinc-500 mb-6">
                                    物語の舞台や背景となる設定を定義します。
                                </p>

                                <div className="space-y-6">
                                    {[
                                        { key: 'era', label: '時代' },
                                        { key: 'worldView', label: '世界観' },
                                        { key: 'stage', label: '舞台' },
                                        { key: 'originalElements', label: '舞台の王道な要素以外に追加したあなたのオリジナル要素' },
                                        { key: 'gimmicks', label: '（もしある場合は）舞台にしかけられている仕掛け' },
                                        { key: 'pastIncidents', label: '過去に起きた重要な事件の概要' },
                                        { key: 'terminology', label: '設定の用語' }
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{field.label}</label>
                                            <textarea
                                                // @ts-ignore
                                                value={project.worldStructure?.[field.key] || ''}
                                                onChange={(e) => {
                                                    const newWorld = { ...project.worldStructure, [field.key]: e.target.value };
                                                    updateProject({ worldStructure: newWorld });
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-zinc-600 min-h-[80px] resize-y"
                                            />
                                        </div>
                                    ))}

                                    {/* Custom Items for World Structure */}
                                    <div className="pt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider block">カスタム設定項目</label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const customItems = project.worldStructure?.customItems || [];
                                                    const newItems = [...customItems, { id: crypto.randomUUID(), label: '', value: '' }];
                                                    updateProject({ worldStructure: { ...project.worldStructure, customItems: newItems } });
                                                }}
                                                className="text-zinc-400 hover:text-white"
                                            >
                                                <Plus size={14} className="mr-1" /> 追加
                                            </Button>
                                        </div>

                                        {project.worldStructure?.customItems?.map((item, index) => (
                                            <div key={item.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3 relative group">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        placeholder="項目名 (例: 通貨単位)"
                                                        value={item.label}
                                                        onChange={(e) => {
                                                            const newItems = [...(project.worldStructure?.customItems || [])];
                                                            newItems[index] = { ...item, label: e.target.value };
                                                            updateProject({ worldStructure: { ...project.worldStructure, customItems: newItems } });
                                                        }}
                                                        className="bg-transparent border-b border-zinc-700 focus:border-zinc-500 py-1 text-base font-bold text-zinc-300 w-full focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newItems = (project.worldStructure?.customItems || []).filter(i => i.id !== item.id);
                                                            updateProject({ worldStructure: { ...project.worldStructure, customItems: newItems } });
                                                        }}
                                                        className="text-zinc-600 hover:text-red-400 p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    placeholder="内容を入力..."
                                                    value={item.value}
                                                    onChange={(e) => {
                                                        const newItems = [...(project.worldStructure?.customItems || [])];
                                                        newItems[index] = { ...item, value: e.target.value };
                                                        updateProject({ worldStructure: { ...project.worldStructure, customItems: newItems } });
                                                    }}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base text-zinc-300 focus:outline-none focus:border-zinc-600 min-h-[60px] resize-y"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Theme and Story Structure Section */}
                        <div className="pt-8 border-t border-zinc-800 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">テーマと物語の構成</h3>
                                <p className="text-sm text-zinc-500 mb-6">
                                    物語の核となるテーマや、構造的な要素を言語化します。
                                </p>

                                <div className="space-y-6">
                                    {[
                                        { key: 'topic', label: 'テーマとなる議題' },
                                        { key: 'symbol', label: 'テーマの象徴となるアイテム' },
                                        { key: 'interestPoint', label: 'このテーマの面白いポイント・興味を持った理由' },
                                        { key: 'message', label: '主張したいこと・読者に伝えたいこと' },
                                        { key: 'opposingView', label: '反対となる意見' },
                                        { key: 'thirdView', label: '第3の意見 (肯定的だが否定的側面も理解)' },
                                        { key: 'fourthView', label: '第4の意見 (否定的だが肯定的側面も理解)' },
                                        { key: 'strengths', label: '好きなもの・得意なもの・深い知識' },
                                        { key: 'concept', label: '物語のコンセプト' },
                                        { key: 'expression', label: 'テーマをどう表現して伝えるか' },
                                        { key: 'mainProblem', label: 'メインストーリーで解決すべきこと' },
                                        { key: 'subProblem', label: 'サポートストーリーで解決すべきこと' },
                                        { key: 'solution', label: 'どうやって解決するのか' },
                                        { key: 'protagonistChange', label: '物語を通した主人公の変化' },
                                        { key: 'surroundingChange', label: '周囲のキャラクターの変化' },
                                        { key: 'readerInterest', label: '読者が興味を持つポイント' },
                                        { key: 'emotionalPoint', label: '感動する要素' }
                                    ].map((field) => (
                                        <div key={field.key}>
                                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{field.label}</label>
                                            <textarea
                                                // @ts-ignore
                                                value={project.themeStructure?.[field.key] || ''}
                                                onChange={(e) => {
                                                    const newTheme = { ...project.themeStructure, [field.key]: e.target.value };
                                                    updateProject({ themeStructure: newTheme });
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-zinc-600 min-h-[80px] resize-y"
                                            />
                                        </div>
                                    ))}

                                    {/* Custom Items */}
                                    <div className="pt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider block">カスタム項目</label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const customItems = project.themeStructure?.customItems || [];
                                                    const newItems = [...customItems, { id: crypto.randomUUID(), label: '', value: '' }];
                                                    updateProject({ themeStructure: { ...project.themeStructure, customItems: newItems } });
                                                }}
                                                className="text-zinc-400 hover:text-white"
                                            >
                                                <Plus size={14} className="mr-1" /> 追加
                                            </Button>
                                        </div>

                                        {project.themeStructure?.customItems?.map((item, index) => (
                                            <div key={item.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3 relative group">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        placeholder="項目名 (例: 裏テーマ)"
                                                        value={item.label}
                                                        onChange={(e) => {
                                                            const newItems = [...(project.themeStructure?.customItems || [])];
                                                            newItems[index] = { ...item, label: e.target.value };
                                                            updateProject({ themeStructure: { ...project.themeStructure, customItems: newItems } });
                                                        }}
                                                        className="bg-transparent border-b border-zinc-700 focus:border-zinc-500 py-1 text-base font-bold text-zinc-300 w-full focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newItems = (project.themeStructure?.customItems || []).filter(i => i.id !== item.id);
                                                            updateProject({ themeStructure: { ...project.themeStructure, customItems: newItems } });
                                                        }}
                                                        className="text-zinc-600 hover:text-red-400 p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    placeholder="内容を入力..."
                                                    value={item.value}
                                                    onChange={(e) => {
                                                        const newItems = [...(project.themeStructure?.customItems || [])];
                                                        newItems[index] = { ...item, value: e.target.value };
                                                        updateProject({ themeStructure: { ...project.themeStructure, customItems: newItems } });
                                                    }}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base text-zinc-300 focus:outline-none focus:border-zinc-600 min-h-[60px] resize-y"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
