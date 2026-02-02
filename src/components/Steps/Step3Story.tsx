import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';

interface Step3StoryProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const Step3Story: React.FC<Step3StoryProps> = ({ project, onUpdate }) => {
    const [data, setData] = useState({
        genre: project.story?.genre || '',
        type: project.story?.type || '',
        ending: project.story?.ending || '',
        note: project.story?.note || '',
    });

    useEffect(() => {
        setData({
            genre: project.story?.genre || '',
            type: project.story?.type || '',
            ending: project.story?.ending || '',
            note: project.story?.note || '',
        });
    }, [project.story]);

    const handleChange = (field: keyof typeof data, value: string) => {
        const newData = { ...data, [field]: value };
        setData(newData);
    };

    const handleBlur = () => {
        onUpdate({ story: data });
    };

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">3</span>
                    物語を設計する
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ジャンル</label>
                        <select
                            value={data.genre}
                            onChange={(e) => {
                                handleChange('genre', e.target.value);
                                // For select, handle update immediately as onBlur might not fire reliably on change
                                onUpdate({ story: { ...data, genre: e.target.value } });
                            }}
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                        >
                            <option value="">選択してください</option>
                            <option value="battle">バトル・アクション</option>
                            <option value="romance">恋愛・ラブコメ</option>
                            <option value="mystery">ミステリー・サスペンス</option>
                            <option value="fantasy">ファンタジー</option>
                            <option value="scifi">SF</option>
                            <option value="horror">ホラー</option>
                            <option value="daily">日常・コメディ</option>
                            <option value="sports">スポーツ</option>
                            <option value="history">歴史・時代劇</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">話のタイプ（構造）</label>
                        <p className="text-sm text-zinc-500">主人公がどう変化するか、どんな結末を迎えるか。</p>
                        <input
                            type="text"
                            value={data.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            onBlur={handleBlur}
                            placeholder="例：成長譚、復讐劇、謎解き..."
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900 text-base"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">想定エンディング</label>
                        <div className="flex gap-4">
                            {['ハッピーエンド', 'バッドエンド', 'ビターエンド', 'オープンエンド'].map((end) => (
                                <label key={end} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="ending"
                                        value={end}
                                        checked={data.ending === end}
                                        onChange={(e) => {
                                            handleChange('ending', e.target.value);
                                            onUpdate({ story: { ...data, ending: e.target.value } });
                                        }}
                                        className="text-zinc-900 focus:ring-zinc-900"
                                    />
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{end}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            メモ
                        </label>
                        <textarea
                            value={data.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                            onBlur={handleBlur}
                            rows={4}
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900 resize-none text-base"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
