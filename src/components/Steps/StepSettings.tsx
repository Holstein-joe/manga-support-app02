import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Project } from "@/types/project";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { Save, Trash2, AlertTriangle } from "lucide-react";

interface StepSettingsProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const StepSettings: React.FC<StepSettingsProps> = ({ project, onUpdate }) => {
    const router = useRouter();
    const { deleteProject } = useProjects();
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description || "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(project.title);
        setDescription(project.description || "");
    }, [project]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate a small delay for better UX (optional, but feels better)
            await new Promise(resolve => setTimeout(resolve, 500));
            onUpdate({ title, description });
            alert("設定を保存しました。");
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("保存に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (confirm("本当にこのプロジェクトを削除しますか？\nこの操作は取り消せません。")) {
            deleteProject(project.id);
            router.push("/");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 pb-2 dark:border-zinc-800">
                    プロジェクト設定
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                    プロジェクトの基本情報や管理設定を行います。
                </p>
            </div>

            <div className="space-y-6 bg-white p-6 rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        プロジェクトタイトル
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                        placeholder="タイトルを入力"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        あらすじ・ログライン
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                        placeholder="プロジェクトの概要やログラインを入力"
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "保存中..." : "変更を保存"}
                    </Button>
                </div>
            </div>

            <div className="space-y-4 pt-8">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    危険なエリア
                </h3>
                <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-center justify-between dark:bg-red-900/10 dark:border-red-900/30">
                    <div>
                        <h4 className="font-bold text-red-700 dark:text-red-400">プロジェクトを削除する</h4>
                        <p className="text-sm text-red-600/80 mt-1 dark:text-red-400/70">
                            一度削除すると復元できません。ご注意ください。
                        </p>
                    </div>
                    <Button
                        variant="default"
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white border-none shadow-none"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除する
                    </Button>
                </div>
            </div>
        </div>
    );
};
