'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { LogOut, LogIn, User } from "lucide-react"

interface UserMenuProps {
    showName?: boolean;
    showLogoutLabel?: boolean;
}

export function UserMenu({ showName = true, showLogoutLabel = false }: UserMenuProps) {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div className="h-9 w-24 rounded-lg bg-zinc-800 animate-pulse" />
    }



    if (session && session.user) {
        return (
            <div className={`flex items-center gap-3 ${showLogoutLabel ? 'w-full justify-between' : ''}`}>
                <Link href="/settings" className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                        {session.user.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User size={16} className="text-zinc-400" />
                        )}
                    </div>
                    {showName && (
                        <div className="text-left hidden sm:block truncate">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-none truncate max-w-[120px]">
                                {session.user.name || session.user.email}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-none">
                                設定を開く
                            </p>
                        </div>
                    )}
                </Link>
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => signIn("google")}
            className="gap-2 text-[10px] font-bold uppercase tracking-wide h-9 px-4 bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-white"
        >
            <LogIn size={14} />
            Googleでログイン
        </Button>
        {
        process.env.NODE_ENV === 'development' && (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => signIn("credentials")}
                className="gap-2 text-[10px] font-bold uppercase tracking-wide h-9 px-4 text-zinc-400 hover:text-white"
            >
                Dev
            </Button>
        )
    }
    )
}
