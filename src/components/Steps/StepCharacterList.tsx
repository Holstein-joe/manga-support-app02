import React, { useState } from 'react';
import { Project, CharacterItem } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { useCharacters } from '@/hooks/useCharacters';
import { Plus, X, User, Trash2, Search, Check, Link as LinkIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface StepCharacterListProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const StepCharacterList: React.FC<StepCharacterListProps> = ({ project, onUpdate }) => {
    const { characters: globalCharacters, addCharacter } = useCharacters();
    const [isSelecting, setIsSelecting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const linkedIds = project.linkedCharacterIds || [];
    const linkedCharacters = globalCharacters.filter(c => linkedIds.includes(c.id));

    // Support legacy local characters if any
    const localCharacters = project.characters || [];

    const handleToggleLink = (id: string) => {
        const newIds = linkedIds.includes(id)
            ? linkedIds.filter(i => i !== id)
            : [...linkedIds, id];
        onUpdate({ linkedCharacterIds: newIds });
    };

    const handleQuickAdd = () => {
        const newChar = addCharacter({
            name: searchQuery || '新しいキャラクター',
            description: '',
        });
        handleToggleLink(newChar.id);
        setSearchQuery('');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-zinc-900 text-sm">4</span>
                        キャラクター選択
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        この作品に登場させるキャラクターを名簿から選択します。
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/characters">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white font-bold border border-zinc-800">
                            <ExternalLink className="w-4 h-4 mr-2" /> 名簿の編集
                        </Button>
                    </Link>
                    <Button onClick={() => setIsSelecting(!isSelecting)} className="font-bold bg-white text-zinc-900 hover:bg-zinc-200">
                        <Plus className="w-4 h-4 mr-2" /> キャラクターを参戦させる
                    </Button>
                </div>
            </div>

            {/* Selection UI */}
            {isSelecting && (
                <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-widest">グローバル名簿から選択</h3>
                        <button onClick={() => setIsSelecting(false)} className="text-zinc-600 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="名前で検索、または新規作成して追加..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 h-12 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                        {globalCharacters
                            .filter(gc => gc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => handleToggleLink(char.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${linkedIds.includes(char.id)
                                        ? 'bg-white border-white text-black'
                                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-black/20 border border-zinc-700/30 overflow-hidden shrink-0">
                                        {char.icon ? (
                                            <img src={char.icon} alt={char.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{char.name}</div>
                                        <div className="text-[10px] opacity-60 truncate">
                                            {linkedIds.includes(char.id) ? '参戦中' : '待機中'}
                                        </div>
                                    </div>
                                    <div className={`p-1 rounded-full ${linkedIds.includes(char.id) ? 'bg-black text-white' : 'bg-transparent text-transparent group-hover:bg-zinc-800'}`}>
                                        <Check size={12} />
                                    </div>
                                </button>
                            ))}

                        {searchQuery && !globalCharacters.find(c => c.name.toLowerCase() === searchQuery.toLowerCase()) && (
                            <button
                                onClick={handleQuickAdd}
                                className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white transition-all text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-700">
                                    <Plus size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate text-zinc-300">「{searchQuery}」を登録</div>
                                    <div className="text-[10px]">名簿へ追加してこの作品にリンク</div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Linked Characters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {linkedCharacters.map((char) => (
                    <div key={char.id} className="bg-[#1a1a1a] rounded-2xl border border-zinc-800 p-6 flex gap-6 relative group transform transition-all hover:scale-[1.01] hover:border-zinc-600 shadow-xl">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-full bg-black border-2 border-zinc-800 overflow-hidden">
                                {char.icon ? (
                                    <img src={char.icon} alt={char.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center border-4 border-[#1a1a1a]">
                                <LinkIcon size={12} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="text-xl font-bold text-white">{char.name}</div>
                            <div className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{char.description || '（説明なし）'}</div>
                            <span key={char.id + '-link'} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">リンク中</span>
                        </div>

                        <button
                            onClick={() => handleToggleLink(char.id)}
                            className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs flex items-center gap-1"
                        >
                            <Trash2 size={14} /> 除外
                        </button>
                    </div>
                ))}

                {/* Legacy Characters support */}
                {localCharacters.map((char) => (
                    <div key={char.id} className="bg-[#1a1a1a]/50 border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex gap-6 relative group opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center text-zinc-700">
                            {char.icon ? <img src={char.icon} alt={char.name} className="w-full h-full object-cover" /> : <User size={32} />}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-white">{char.name}</div>
                            <div className="text-xs text-zinc-600">プロジェクト固有（レガシー）</div>
                        </div>
                    </div>
                ))}

                {linkedCharacters.length === 0 && localCharacters.length === 0 && (
                    <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#1a1a1a] bg-[#1a1a1a]/40 rounded-3xl">
                        <User className="w-12 h-12 text-zinc-800 mb-4" />
                        <p className="text-zinc-700 font-bold uppercase tracking-widest text-xs">登場キャラクターが未選択です</p>
                        <Button onClick={() => setIsSelecting(true)} variant="ghost" className="mt-4 text-zinc-500 hover:text-white">
                            名簿から選択する
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
