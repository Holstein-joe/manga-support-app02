"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCharacters } from '@/hooks/useCharacters';
import { Button } from '@/components/ui/Button';
import { Plus, User, ArrowLeft, Search, X } from 'lucide-react';

export default function GlobalCharacterPage() {
    const router = useRouter();
    const { characters, groups, addCharacter, deleteCharacter, addGroup } = useCharacters();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const filteredCharacters = characters.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = selectedGroupId ? c.groupIds?.includes(selectedGroupId) : true;
        return matchesSearch && matchesGroup;
    });

    const handleCreate = () => {
        const newChar = addCharacter({
            name: '新しいキャラクター',
            description: '',
            groupIds: selectedGroupId ? [selectedGroupId] : []
        });
        // Immediately redirect to the new detail page
        router.push(`/characters/${newChar.id}`);
    };

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            addGroup(newGroupName.trim());
            setNewGroupName('');
            setIsCreatingGroup(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            ダッシュボードへ戻る
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">グローバルキャラクター名簿</h1>
                        <p className="text-zinc-500 text-sm mt-1">すべての作品で使用できる共通のキャラクターデータベースです。</p>
                    </div>
                    <Button onClick={handleCreate} className="bg-white text-black hover:bg-zinc-200 font-bold h-12 px-6 rounded-xl">
                        <Plus className="w-5 h-5 mr-2" />
                        新キャラを登録
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-900">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="キャラクターを検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 h-11 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setSelectedGroupId(null)}
                            className={`px-4 h-11 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${!selectedGroupId ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                        >
                            すべて
                        </button>
                        {groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroupId(group.id)}
                                className={`px-4 h-11 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedGroupId === group.id ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                            >
                                {group.name}
                            </button>
                        ))}

                        {isCreatingGroup ? (
                            <form onSubmit={handleCreateGroup} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="グループ名..."
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 h-11 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-500 w-32"
                                />
                                <Button type="submit" size="sm" className="bg-white text-black h-11 px-4 rounded-xl font-bold text-xs">作成</Button>
                                <button type="button" onClick={() => setIsCreatingGroup(false)} className="text-zinc-500 hover:text-white px-2">
                                    <X size={16} />
                                </button>
                            </form>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreatingGroup(true)}
                                className="text-zinc-400 hover:text-white h-11 px-4 border border-zinc-800 hover:border-zinc-700 rounded-xl"
                            >
                                <Plus size={14} className="mr-2" /> グループを新規作成
                            </Button>
                        )}
                    </div>
                </div>

                {/* Character Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCharacters.map(char => (
                        <Link
                            key={char.id}
                            href={`/characters/${char.id}`}
                            className="group block bg-[#1a1a1a] rounded-2xl border border-zinc-900 p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-all hover:shadow-2xl hover:-translate-y-1 relative"
                        >
                            <div className="flex gap-4 items-start">
                                <div className="w-16 h-16 rounded-full bg-black border border-zinc-800 overflow-hidden shrink-0">
                                    {char.icon ? (
                                        <img src={char.icon} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-800 group-hover:text-zinc-600 transition-colors">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-white group-hover:text-white truncate pr-6">
                                        {char.name}
                                    </h3>

                                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                                        {char.groupIds?.map(gid => {
                                            const g = groups.find(gr => gr.id === gid);
                                            return g ? (
                                                <span
                                                    key={gid}
                                                    className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:border-zinc-700 transition-colors"
                                                >
                                                    {g.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>

                                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2.5em]">
                                        {char.description || (
                                            <span className="text-zinc-700 italic">No description</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredCharacters.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 select-none">
                            <User size={64} className="mb-4" />
                            <p className="font-bold">該当するキャラクターがいません</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
