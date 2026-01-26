import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';

interface Step2OutlineProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const Step2Outline: React.FC<Step2OutlineProps> = ({ project, onUpdate }) => {
    const [data, setData] = useState({
        start: '',
        midpoint: '',
        decision: '',
        end: ''
    });

    useEffect(() => {
        if (project.outline) {
            setData(project.outline);
        }
    }, [project.outline]);

    const handleChange = (field: keyof typeof data, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = () => {
        onUpdate({ outline: data });
    };

    const items = [
        { key: 'start', label: '1. 開始（Start）', desc: '主人公の初期状態。ゴールの正反対の状態を描く。', placeholder: '例：魔法が使えず、誰からも期待されていない落ちこぼれ。' },
        { key: 'midpoint', label: '2. 中間点（Midpoint）', desc: '物語の転換点。主人公が変化せざるを得ない出来事。', placeholder: '例：師匠が敵に捕まり、自分一人で戦うしかない状況になる。' },
        { key: 'decision', label: '3. 決断（Decision）', desc: '変化の証明。過去の自分と決別し、リスクを取る決断。', placeholder: '例：逃げることをやめ、禁忌とされていた機械技術を使うことを決意する。' },
        { key: 'end', label: '4. 終了（End）', desc: 'ゴール。主人公が得た新しい日常や成長の結果。', placeholder: '例：魔法と科学を融合させた英雄として認められ、新しい時代を作る。' },
    ] as const;

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">2</span>
                    あらすじ作成
                </h2>
                <p className="text-sm text-zinc-500 mb-8 dark:text-zinc-400">
                    物語の骨組みとなる4つのポイントを決めましょう。「開始」と「終了」が変化していることが重要です。
                </p>

                <div className="grid grid-cols-1 gap-8 relative">
                    {/* Connector Line */}
                    <div className="hidden md:block absolute left-[19px] top-6 bottom-6 w-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10"></div>

                    {items.map((item) => (
                        <div key={item.key} className="relative pl-0 md:pl-12">
                            {/* Number Badge */}
                            <div className="hidden md:flex absolute left-0 top-0 w-10 h-10 rounded-full bg-zinc-100 border-4 border-white items-center justify-center text-zinc-500 font-bold dark:bg-zinc-800 dark:border-zinc-950 dark:text-zinc-400">
                                {item.label.split('.')[0]}
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    {item.label}
                                    <span className="text-xs font-normal text-zinc-500 bg-zinc-50 px-2 py-1 rounded dark:bg-zinc-900">{item.desc}</span>
                                </label>
                                <textarea
                                    value={data[item.key as keyof typeof data]}
                                    onChange={(e) => handleChange(item.key as keyof typeof data, e.target.value)}
                                    onBlur={handleBlur}
                                    rows={4}
                                    placeholder={item.placeholder}
                                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900 resize-none hover:border-zinc-300 dark:hover:border-zinc-700"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
