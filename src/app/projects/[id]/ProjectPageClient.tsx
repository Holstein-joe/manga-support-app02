"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { Step1Concept } from "@/components/Steps/Step1Concept";
import { Step2Outline } from "@/components/Steps/Step2Outline";
import { Step3Structure } from "@/components/Steps/Step3Structure";
import { StepCharacterList } from "@/components/Steps/StepCharacterList";
import { Step6Scenes } from "@/components/Steps/Step6Scenes";
import { Step7Export } from "@/components/Steps/Step7Export";
import { UserMenu } from "@/components/UserMenu";

// Sanada Method Steps
const steps = [
    { id: '1', label: '1. コンセプト設定', component: Step1Concept },
    { id: '2', label: '2. あらすじ作成', component: Step2Outline },
    { id: '3', label: '3. 構造設計', component: Step3Structure },
    { id: '4', label: '4. 登場キャラの選択', component: StepCharacterList },
    { id: '6', label: '5. ネーム制作・下書き', component: Step6Scenes },
    { id: '7', label: '6. 企画書出力', component: Step7Export },
] as const;

export function ProjectPageClient({ id }: { id: string }) {
    const { projects, loading, updateProject } = useProjects();
    const [currentStep, setCurrentStep] = useState<string>('1');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const CurrentComponent = steps.find((s) => s.id === currentStep)?.component || Step1Concept;

    // Reset sidebar on step change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [currentStep]);

    if (loading) {
        return <div className="p-8 text-center text-zinc-500">Loading...</div>;
    }

    const project = projects.find((p) => p.id === id);

    if (!project) {
        return <div className="p-8 text-center text-zinc-500">Project not found</div>;
    }

    const handleUpdate = (updates: Partial<Project>) => {
        updateProject(project.id, updates);
    };

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors dark:text-zinc-400 dark:hover:text-zinc-50">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    ダッシュボード
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="font-bold text-lg truncate text-zinc-900 dark:text-zinc-50 mr-2">{project.title}</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        <X size={20} />
                    </button>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4 mb-2">制作ステップ</div>
                {steps.map((step) => (
                    <Button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        variant={currentStep === step.id ? "default" : "ghost"}
                        className={`w-full justify-start text-left ${currentStep === step.id ? "font-bold" : "text-zinc-500 dark:text-zinc-400"}`}
                    >
                        <span className="flex-1">{step.label}</span>
                        {currentStep === step.id && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </Button>
                ))}

                <div className="pt-8 pb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4">共通設定</div>
                <Link href="/characters">
                    <Button variant="ghost" className="w-full justify-start text-left text-zinc-500 dark:text-zinc-400 hover:text-white">
                        <User className="w-4 h-4 mr-2" />
                        キャラクター名簿
                    </Button>
                </Link>
            </nav>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 mt-auto pb-10">
                <UserMenu showName={true} />
            </div>
        </>
    );

    return (
        <div className="flex bg-zinc-50 min-h-screen dark:bg-zinc-950">
            {/* Desktop Sidebar */}
            <aside className="w-64 fixed h-full bg-white border-r border-zinc-200 z-30 hidden md:flex flex-col dark:bg-zinc-925 dark:border-zinc-800">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
            )}
            <aside className={`md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out dark:bg-zinc-925 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800">
                    <SidebarContent />
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full bg-white border-b border-zinc-200 z-20 px-4 h-14 flex items-center justify-between dark:bg-zinc-950 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        <Menu size={20} />
                    </button>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[200px]">{project.title}</span>
                </div>
                <UserMenu />
            </header>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
                <div className="max-w-5xl mx-auto">
                    <CurrentComponent project={project} onUpdate={handleUpdate} />
                </div>
            </main>
        </div>
    );
}
