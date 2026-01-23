import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';

interface Step5PlotProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const Step5Plot: React.FC<Step5PlotProps> = ({ project, onUpdate }) => {
    const [data, setData] = useState({
        intro: project.plot?.intro || '',
        development: project.plot?.development || '',
        twist: project.plot?.twist || '',
        conclusion: project.plot?.conclusion || '',
    });

    useEffect(() => {
        setData({
            intro: project.plot?.intro || '',
            development: project.plot?.development || '',
            twist: project.plot?.twist || '',
            conclusion: project.plot?.conclusion || '',
        });
    }, [project.plot]);

    const handleChange = (field: keyof typeof data, value: string) => {
        const newData = { ...data, [field]: value };
        setData(newData);
    };

    const handleBlur = () => {
        onUpdate({ plot: data });
    };

    const sections = [
        { key: 'intro', label: '起（導入）', desc: '世界観の提示、事件の発生、日常の崩壊' },
        { key: 'development', label: '承（展開）', desc: '苦難、修行、仲間との出会い、試練' },
        { key: 'twist', label: '転（クライマックス）', desc: '最大のピンチ、大逆転、真相の解明' },
        { key: 'conclusion', label: '結（結末）', desc: 'エピローグ、新しい日常、テーマの回収' },
    ] as const;

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">5</span>
                    プロット（起承転結）
                </h2>

                <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                    {sections.map(({ key, label, desc }, index) => (
                        <div key={key} className="relative">
                            <div className="absolute -left-[34px] w-7 h-7 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center z-10 text-xs font-bold dark:bg-zinc-950 dark:border-zinc-50">
                                {index + 1}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                    {label}
                                    <span className="text-xs font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full dark:bg-zinc-900">{desc}</span>
                                </label>
                                <textarea
                                    value={data[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    onBlur={handleBlur}
                                    rows={5}
                                    placeholder={`${label}の内容を入力...`}
                                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900 resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
