"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProjectGrid } from "@/components/Dashboard/ProjectGrid";
import { useProjects } from "@/hooks/useProjects";
import { UserMenu } from "@/components/UserMenu";

export default function Dashboard() {
  const { projects, loading, deleteProject } = useProjects();

  const handleEdit = (id: string) => {
    console.log("Edit project:", id);
  };

  const handleDelete = (id: string) => {
    if (confirm("本当にこのプロジェクトを削除しますか？")) {
      deleteProject(id);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#0077be] rounded flex items-center justify-center text-[10px] text-white">A</span>
            AOZU
          </h1>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">プロジェクト一覧</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              漫画のストーリーやアイデアを管理します。
            </p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500">読み込み中...</div>
        ) : (
          <ProjectGrid
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
