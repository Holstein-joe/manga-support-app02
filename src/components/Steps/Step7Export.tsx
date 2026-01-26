"use client";

import React, { useRef } from 'react';
import { Project, CharacterItem } from '@/types/project';
import { useCharacters } from '@/hooks/useCharacters';
import { Button } from '@/components/ui/Button';
import { Printer, FileText, User, BookOpen, Film } from 'lucide-react';

interface Step7ExportProps {
    project: Project;
    onUpdate: (updatedProject: Project) => void;
}

export const Step7Export: React.FC<Step7ExportProps> = ({ project }) => {
    const { characters: allCharacters, groups } = useCharacters();

    // プロジェクトに関連付けられたキャラを復元
    const projectCharacters = (project.linkedCharacterIds || [])
        .map(id => allCharacters.find(c => c.id === id))
        .filter((c): c is CharacterItem => !!c);

    // 救済措置: 古いデータ形式のキャラも表示
    const displayCharacters = projectCharacters.length > 0
        ? projectCharacters
        : (project.characters || []);

    const handlePrint = () => {
        window.print();
    };

    // シーンデータをフラット化して取得
    const allScenes = (project.structureBoard || []).flatMap(group =>
        (group.scenes || []).map(scene => ({
            ...scene,
            groupTitle: group.content
        }))
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- ツールバー (印刷時には消える) --- */}
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">6</span>
                        企画書出力
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                        下のボタンを押すと、このページを印刷またはPDFとして保存できます。
                    </p>
                </div>
                <Button onClick={handlePrint} className="font-bold px-6 rounded-full shadow-lg">
                    <Printer size={18} className="mr-2" />
                    印刷 / PDF保存
                </Button>
            </div>

            {/* --- 企画書本体 (A4風レイアウト) --- */}
            <div className="print-container bg-white text-black p-8 md:p-16 rounded-sm shadow-2xl min-h-[297mm] relative overflow-hidden">
                {/* 印刷用スタイル (このコンポーネント内限定) */}
                <style jsx global>{`
                    @media print {
                        @page { size: A4; margin: 0; }
                        body { background: white; }
                        /* アプリのサイドバーやヘッダーを隠す */
                        aside, header, nav, .print\:hidden { display: none !important; }
                        /* メインコンテンツをリセット */
                        main { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
                        /* 企画書エリアを表示 */
                        .print-container {
                            width: 100%;
                            margin: 0;
                            padding: 20mm;
                            box-shadow: none;
                            border: none;
                            position: absolute;
                            top: 0;
                            left: 0;
                            visibility: visible;
                        }
                        /* 改ページ制御 */
                        .page-break { page-break-before: always; }
                        .keep-together { break-inside: avoid; }
                    }
                `}</style>

                {/* --- 1. 表紙・基本情報 --- */}
                <section className="mb-16 border-b-4 border-black pb-8">
                    <div className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-2">Project Proposal</div>
                    <h1 className="text-5xl font-black mb-6 leading-tight">{project.title || '無題のプロジェクト'}</h1>
                    <p className="text-xl font-medium leading-relaxed text-zinc-700 whitespace-pre-wrap">
                        {project.description || 'ログライン（一行あらすじ）が入力されていません。'}
                    </p>
                    <div className="mt-8 flex gap-4 text-sm text-zinc-500">
                        <span>最終更新: {new Date(project.lastEdited).toLocaleDateString()}</span>
                    </div>
                </section>

                {/* --- 2. コンセプト --- */}
                <section className="mb-12 keep-together">
                    <h3 className="text-2xl font-bold border-l-8 border-black pl-4 mb-6 flex items-center gap-2">
                        <BookOpen size={24} /> 企画コンセプト
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-100">
                            <h4 className="font-bold text-zinc-400 text-xs uppercase mb-2">テーマ (Theme)</h4>
                            <p className="text-lg font-serif font-bold">{project.concept?.theme || '-'}</p>
                        </div>
                        <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-100">
                            <h4 className="font-bold text-zinc-400 text-xs uppercase mb-2">読後感 (Emotion)</h4>
                            <p className="text-lg">{project.concept?.emotions || '-'}</p>
                        </div>

                    </div>
                </section>

                {/* --- 3. キャラクター --- */}
                <section className="mb-12">
                    <h3 className="text-2xl font-bold border-l-8 border-black pl-4 mb-6 flex items-center gap-2">
                        <User size={24} /> 主要キャラクター
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        {displayCharacters.length > 0 ? (
                            displayCharacters.map((char) => (
                                <div key={char.id} className="flex gap-6 p-4 border border-zinc-200 rounded-xl items-start keep-together">
                                    <div className="w-20 h-20 bg-zinc-100 rounded-full shrink-0 overflow-hidden border border-zinc-200">
                                        {char.icon ? (
                                            <img src={char.icon} alt={char.name} className="w-full h-full object-cover grayscale" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                <User size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-lg font-bold">{char.name}</h4>

                                        </div>
                                        <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                            {char.description || '詳細設定なし'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-400 italic">キャラクターが登録されていません。</p>
                        )}
                    </div>
                </section>

                <div className="page-break" />

                {/* --- 4. ストーリー構成 --- */}
                <section className="mb-12 mt-8">
                    <h3 className="text-2xl font-bold border-l-8 border-black pl-4 mb-6 flex items-center gap-2">
                        <Film size={24} /> ストーリーライン
                    </h3>

                    {/* Outline */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-zinc-50 border-l-4 border-zinc-300">
                            <span className="block text-xs font-bold text-zinc-400 mb-1">START</span>
                            <p className="font-medium text-sm">{project.outline?.start || '-'}</p>
                        </div>
                        <div className="p-4 bg-zinc-50 border-l-4 border-zinc-300">
                            <span className="block text-xs font-bold text-zinc-400 mb-1">GOAL</span>
                            <p className="font-medium text-sm">{project.outline?.end || '-'}</p>
                        </div>
                    </div>

                    {/* Plot / Scenes */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-lg mb-4 border-b border-zinc-200 pb-2">シーン構成 (ネーム)</h4>
                        {allScenes.length > 0 ? (
                            allScenes.map((scene, index) => (
                                <div key={scene.id} className="flex gap-4 items-baseline border-b border-zinc-100 pb-3 keep-together">
                                    <span className="font-mono text-zinc-400 w-8 shrink-0 text-right">#{index + 1}</span>
                                    <div className="flex-1">
                                        <div className="mb-1 font-bold text-xs text-zinc-500 uppercase">{scene.groupTitle}</div>

                                        {/* 画像がある場合 */}
                                        {scene.drawing && (
                                            <div className="mb-2 w-32 h-20 border border-zinc-200 bg-zinc-50 overflow-hidden">
                                                <img src={scene.drawing} className="w-full h-full object-contain" />
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            {scene.dialogues?.map((d: any, i: number) => {
                                                const char = displayCharacters.find(c => c.id === d.characterId);
                                                return (
                                                    <div key={i} className="text-sm flex gap-2">
                                                        <span className="font-bold text-zinc-600 shrink-0 text-xs w-16 truncate">
                                                            {char?.name || d.character || '???'}
                                                        </span>
                                                        <span className="text-zinc-800">「{d.text}」</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-400 italic">シーンが作成されていません。</p>
                        )}
                    </div>
                </section>

                {/* フッター */}
                <div className="mt-20 pt-8 border-t border-zinc-200 text-center text-zinc-400 text-xs flex justify-between items-center">
                    <span>Generated by Manga Support App</span>
                    <span>{new Date().toLocaleDateString()} 出力</span>
                </div>
            </div>
        </div>
    );
};