'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { LogOut, LogIn } from "lucide-react"

export function UserMenu({ showName = true }: { showName?: boolean }) {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div className="h-8 w-8 rounded-full bg-zinc-200 animate-pulse" />
    }

    if (session && session.user) {
        return (
            <div className="flex items-center gap-3">
                {showName && (
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                            {session.user.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-none">
                            Pro 会員
                        </p>
                    </div>
                )}
                <div className="relative group">
                    <img
                        src={session.user.image || ""}
                        alt={session.user.name || "ユーザー"}
                        className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800"
                    />
                    <button
                        onClick={() => signOut()}
                        className="absolute top-0 right-0 h-full w-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white"
                        title="ログアウト"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => signIn("google")}
            className="gap-2 text-[10px] font-black uppercase tracking-widest h-9 px-4"
        >
            <LogIn size={14} />
            Googleでログイン
        </Button>
    )
}
