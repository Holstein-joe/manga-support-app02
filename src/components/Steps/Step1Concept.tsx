import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';

interface Step1ConceptProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const Step1Concept: React.FC<Step1ConceptProps> = ({ project, onUpdate }) => {
    // Local state for immediate input feedback
    const [data, setData] = useState({
        theme: project.concept?.theme || '',
        emotions: project.concept?.emotions || '',
        keywords: project.concept?.keywords || '',
        note: project.concept?.note || '',
    });

    // Update local state if project data changes externally (e.g. reload)
    useEffect(() => {
        setData({
            theme: project.concept?.theme || '',
            emotions: project.concept?.emotions || '',
            keywords: project.concept?.keywords || '',
            note: project.concept?.note || '',
        });
    }, [project.concept]);

    // Handle change and auto-save (propagating to parent onBlur or with debounce logic could be added)
    // For simplicity, we update parent immediately onBlur for now to persist.

    const handleChange = (field: keyof typeof data, value: string) => {
        const newData = { ...data, [field]: value };
        setData(newData);
    };

    const handleBlur = () => {
        onUpdate({ concept: data });
    };

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">1</span>
                    企画コンセプト
                </h2>

                <div className="space-y-6">
                    {/* Theme */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            テーマ（一言で言うと？）
                        </label>
                        <p className="text-xs text-zinc-500">例：「友情と犠牲」「AIと人間の共存」など、作品の核となる概念。</p>
                        <input
                            type="text"
                            value={data.theme}
                            onChange={(e) => handleChange('theme', e.target.value)}
                            onBlur={handleBlur}
                            placeholder="テーマを入力..."
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                        />
                    </div>

                    {/* Emotions */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            読後感（読者にどう感じてほしい？）
                        </label>
                        <p className="text-xs text-zinc-500">例：「スカッとする」「ほっこりする」「考えさせられる」</p>
                        <input
                            type="text"
                            value={data.emotions}
                            onChange={(e) => handleChange('emotions', e.target.value)}
                            onBlur={handleBlur}
                            placeholder="読後感を入力..."
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                        />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            キーワード（要素・モチーフ）
                        </label>
                        <p className="text-xs text-zinc-500">例：「魔法学園」「タイムリープ」「猫」「ピアノ」</p>
                        <textarea
                            value={data.keywords}
                            onChange={(e) => handleChange('keywords', e.target.value)}
                            onBlur={handleBlur}
                            rows={2}
                            placeholder="キーワードを列挙..."
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 resize-none"
                        />
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            イメージメモ
                        </label>
                        <p className="text-xs text-zinc-500">思いついたアイデアやシーン、セリフなどを自由に書き留めてください。</p>
                        <textarea
                            value={data.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                            onBlur={handleBlur}
                            rows={6}
                            placeholder="自由にメモ..."
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
