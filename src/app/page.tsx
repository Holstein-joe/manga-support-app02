"use client";

import Link from "next/link";
import { Plus, Loader2, LogIn, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProjectGrid } from "@/components/Dashboard/ProjectGrid";
import { useProjects } from "@/hooks/useProjects";
import { UserMenu } from "@/components/UserMenu";
import { useSession, signIn } from "next-auth/react";

// --- Sub-Components ---

function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[50%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 bg-[#0077be] rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-900/50">
            A
          </div>
          <h1 className="text-6xl font-black tracking-tighter">AOZU</h1>
        </div>

        {/* Hero Text */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            漫画制作を、もっと自由に。
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-lg mx-auto">
            ストーリー構想からキャラクター設定、ネーム作成まで。<br />
            あなたの創作活動を強力にサポートする<br className="hidden md:block" />オールインワン・プラットフォーム。
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-8">
          <Button
            size="lg"
            onClick={() => signIn("google")}
            className="h-14 px-8 text-lg font-bold bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all shadow-xl shadow-white/10"
          >
            <LogIn className="mr-3 h-5 w-5" />
            Googleでログインして始める
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => signIn("credentials", { callbackUrl: "/" })}
            className="h-14 px-8 text-lg font-bold bg-zinc-800 text-white hover:bg-zinc-700 mt-4 w-full"
          >
            <LogIn className="mr-3 h-5 w-5" />
            Dev Login (開発用)
          </Button>
          <p className="text-zinc-600 text-xs mt-4">
            登録は無料です。クレジットカードは不要です。
          </p>
        </div>
      </div>
    </div>
  );
}

function UserDashboard() {
  const { projects, loading } = useProjects();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sticky top-0 z-50">
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
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight">プロジェクト一覧</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              漫画のストーリーやアイデアを管理します。
            </p>
          </div>
          <Link href="/projects/new" className="w-full md:w-auto">
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center">
            <Loader2 className="animate-spin mb-2 h-6 w-6" />
            読み込み中...
          </div>
        ) : (
          <ProjectGrid
            projects={projects}
          />
        )}
      </main>
    </div>
  );
}

// --- Main Container ---

export default function DashboardPage() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin h-8 w-8 text-zinc-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  return <UserDashboard />;
}
