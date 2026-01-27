"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Settings, Users, BookOpen, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useProjects } from "@/hooks/useProjects";
import { Project, Episode } from "@/types/project";
import { UserMenu } from "@/components/UserMenu";

export function ProjectPageClient({ id }: { id: string }) {
    const router = useRouter();
    const { projects, loading, updateProject } = useProjects();
    const [activeTab, setActiveTab] = useState<'episodes' | 'settings'>('episodes');

    if (loading) return <div className="p-8 text-center text-zinc-500">読み込み中...</div>;

    const project = projects.find((p) => p.id === id);

    if (!project) {
        return <div className="p-8 text-center text-zinc-500">プロジェクトが見つかりません</div>;
    }

    const episodes = project.episodes || [];

    const handleCreateEpisode = () => {
        const newEpisodeId = crypto.randomUUID();
        const newEpisode: Episode = {
            id: newEpisodeId,
            projectId: project.id,
            title: `第${episodes.length + 1}話`,
            order: episodes.length + 1,
            lastEdited: new Date().toISOString(),
        };

        const updatedEpisodes = [...episodes, newEpisode];
        updateProject(project.id, { episodes: updatedEpisodes });

        // Redirect to the new episode workspace
        router.push(`/projects/${project.id}/episodes/${newEpisodeId}`);
    };

    const handleDeleteEpisode = (episodeId: string) => {
        if (!confirm("エピソードを削除しますか？")) return;
        const updatedEpisodes = episodes.filter(e => e.id !== episodeId);
        updateProject(project.id, { episodes: updatedEpisodes });
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
                            <p className="text-xs text-zinc-500">シリーズ設定・管理</p>
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
                    <Link href="/characters">
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
                                episodes.sort((a, b) => a.order - b.order).map((episode) => (
                                    <div key={episode.id} className="group bg-[#111] border border-zinc-900 hover:border-zinc-700 rounded-xl p-5 flex items-center justify-between transition-all">
                                        <Link href={`/projects/${project.id}/episodes/${episode.id}`} className="flex-1 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 font-bold border border-zinc-800">
                                                {episode.order}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg group-hover:text-amber-400 transition-colors">{episode.title}</h3>
                                                <p className="text-xs text-zinc-500">Last edited: {new Date(episode.lastEdited).toLocaleString()}</p>
                                            </div>
                                        </Link>
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
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">作品タイトル</label>
                            <input
                                value={project.title}
                                onChange={(e) => updateProject(project.id, { title: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">あらすじ (Synopsis)</label>
                            <textarea
                                value={project.description || ''}
                                onChange={(e) => updateProject(project.id, { description: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-zinc-600 h-32 resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">世界観・設定資料 (World View)</label>
                            <textarea
                                value={project.worldView || ''}
                                onChange={(e) => updateProject(project.id, { worldView: e.target.value })}
                                placeholder="魔法のルール、国の歴史、技術レベルなど..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-zinc-600 h-64 resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
