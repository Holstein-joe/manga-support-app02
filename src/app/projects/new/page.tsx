"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useProjects } from "@/hooks/useProjects";

export default function NewProjectPage() {
    const router = useRouter();
    const { addProject } = useProjects();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addProject({
            title,
            description,
        });

        router.push("/");
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-zinc-500">
                            <ChevronLeft className="h-4 w-4" />
                            戻る
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">新規プロジェクト作成</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        新しい漫画のアイデアを形にしましょう。
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            タイトル <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例: 魔法使いの弟子"
                            required
                            className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:text-zinc-50 dark:focus:ring-zinc-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            あらすじ・メモ
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="物語の概要やアイデアを自由に入力してください..."
                            rows={5}
                            className="flex w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:text-zinc-50 dark:focus:ring-zinc-300 resize-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <Link href="/">
                            <Button type="button" variant="ghost">キャンセル</Button>
                        </Link>
                        <Button type="submit" disabled={!title.trim()}>
                            作成する
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
