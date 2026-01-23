import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ArrowDown } from 'lucide-react';

interface Step4StartEndProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const Step4StartEnd: React.FC<Step4StartEndProps> = ({ project, onUpdate }) => {
    const [data, setData] = useState({
        startScene: project.structure?.startScene || '',
        endScene: project.structure?.endScene || '',
        goal: project.structure?.goal || '',
    });

    useEffect(() => {
        setData({
            startScene: project.structure?.startScene || '',
            endScene: project.structure?.endScene || '',
            goal: project.structure?.goal || '',
        });
    }, [project.structure]);

    const handleChange = (field: keyof typeof data, value: string) => {
        const newData = { ...data, [field]: value };
        setData(newData);
    };

    const handleBlur = () => {
        onUpdate({ structure: data });
    };

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">4</span>
                    始点と終点を決める
                </h2>

                <div className="flex flex-col gap-4">
                    <div className="space-y-2 p-4 bg-zinc-50 rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50">START（最初のシーン）</label>
                        <p className="text-xs text-zinc-500">物語はどこから始まる？ 読者を引き込む「ツカミ」は何か。</p>
                        <textarea
                            value={data.startScene}
                            onChange={(e) => handleChange('startScene', e.target.value)}
                            onBlur={handleBlur}
                            rows={4}
                            placeholder="例：主人公が崖っぷちに立たされているシーン..."
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900 resize-none"
                        />
                    </div>

                    <div className="flex justify-center text-zinc-300">
                        <ArrowDown className="h-6 w-6" />
                    </div>

                    <div className="space-y-2 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30">
                        <label className="text-sm font-bold text-indigo-900 dark:text-indigo-200">GOAL（具体的な目標）</label>
                        <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70">主人公は何を達成すれば物語が終わるのか。</p>
                        <input
                            type="text"
                            value={data.goal}
                            onChange={(e) => handleChange('goal', e.target.value)}
                            onBlur={handleBlur}
                            className="w-full p-3 rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-950 dark:border-indigo-800 dark:text-zinc-50 dark:focus:ring-indigo-400"
                        />
                    </div>

                    <div className="flex justify-center text-zinc-300">
                        <ArrowDown className="h-6 w-6" />
                    </div>

                    <div className="space-y-2 p-4 bg-zinc-50 rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50">END（最後のシーン）</label>
                        <p className="text-xs text-zinc-500">どんなラストシーンで終わるか。STARTとの対比。</p>
                        <textarea
                            value={data.endScene}
                            onChange={(e) => handleChange('endScene', e.target.value)}
                            onBlur={handleBlur}
                            rows={4}
                            placeholder="例：主人公が笑顔で空を見上げるシーン..."
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900 resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
