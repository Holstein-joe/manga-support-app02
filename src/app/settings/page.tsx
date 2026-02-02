"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Download, LogOut, User, Database, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
    const { data: session } = useSession();

    const handleBackup = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch('/api/backup');

            if (!response.ok) throw new Error('Backup failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aozu-backup-${today}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('バックアップのダウンロードに失敗しました。');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        <SettingsIcon size={20} />
                        設定 (Settings)
                    </h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4">

                {/* User Profile Section */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-zinc-800 pb-2">アカウント情報</h2>

                    <div className="flex flex-col md:flex-row md:items-center gap-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-6 flex-1 w-full">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-zinc-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-lg truncate">{session?.user?.name || "No Name"}</p>
                                <p className="text-zinc-500 text-sm truncate">{session?.user?.email}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            variant="destructive"
                            className="w-full md:w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 whitespace-nowrap"
                        >
                            <LogOut size={16} className="mr-2" />
                            ログアウト
                        </Button>
                    </div>
                </section>

                {/* Data Management Section */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-zinc-800 pb-2">データ管理</h2>

                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">データのエクスポート</h3>
                                <p className="text-sm text-zinc-500">作成したすべてのプロジェクトとエピソードをJSON形式でダウンロードします。</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleBackup}
                                className="w-full bg-zinc-100 text-zinc-900 hover:bg-white font-bold h-12"
                            >
                                <Download size={18} className="mr-2" />
                                すべてのデータをバックアップ
                            </Button>
                        </div>
                    </div>
                </section>

                {/* App Info (Optional) */}
                <div className="text-center text-zinc-600 text-xs pt-10">
                    <p>AOZU Manga Support App v1.0.0</p>
                </div>

            </main>
        </div>
    );
}
