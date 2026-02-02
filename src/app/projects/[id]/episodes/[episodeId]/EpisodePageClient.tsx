"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEpisode } from "@/hooks/useEpisodes";
import { Step1Concept } from "@/components/Steps/Step1Concept";
import { Step2Outline } from "@/components/Steps/Step2Outline";
import { Step3Structure } from "@/components/Steps/Step3Structure";
import { StepCharacterList } from "@/components/Steps/StepCharacterList";
import { Step6Scenes } from "@/components/Steps/Step6Scenes";
import { Step7Export } from "@/components/Steps/Step7Export";
import { UserMenu } from "@/components/UserMenu";

// Steps for specific Episode
const steps = [
    { id: '1', label: '1. 企画コンセプト', component: Step1Concept },
    { id: '2', label: '2. あらすじ作成', component: Step2Outline },
    { id: '3', label: '3. 構造設計', component: Step3Structure },
    { id: '4', label: '4. キャラクター選択', component: StepCharacterList },
    { id: '5', label: '5. ネーム制作', component: Step6Scenes },
    { id: '6', label: '6. 企画書出力', component: Step7Export },
] as const;

export function EpisodePageClient({ projectId, episodeId }: { projectId: string, episodeId: string }) {
    const { project, episode, loading, updateEpisode } = useEpisode(projectId, episodeId);
    const [currentStep, setCurrentStep] = useState<string>('1');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) return <div className="p-10 text-center text-zinc-500">Loading...</div>;
    if (!project) return <div className="p-10 text-center text-zinc-500">Project Not Found</div>;
    if (!episode) return <div className="p-10 text-center text-zinc-500">Episode Not Found</div>;

    const CurrentComponent = steps.find((s) => s.id === currentStep)?.component || Step1Concept;

    // --- MOCK PROJECT DATA FOR REUSABILITY ---
    // The existing components expect a "Project" object that contains the story data (concept, outline, etc.)
    // We create a temporary object that merges the Parent Project (for global chars) with the Episode (for story data)
    // allowing us to reuse the Step components without rewriting them all.
    const mockProjectData = {
        ...project, // Global settings (characters, etc.)
        ...episode, // Overwrite with Episode data (concept, outline, structure, etc.)
        id: project.id, // Keep Project ID for consistency in some checks, or use episode.id if needed. 
        // But usually components use ID for keys. Let's keep Project ID for global refs, 
        // but actually Step6Scenes uses 'episode' prop now.
        // For other steps (1, 2, 3), they likely rely on properties being present on the passed object.
    };

    // Wrapper for update to translate "Project updates" back to "Episode updates"
    const handleStepUpdate = (updates: any) => {
        // We only want to save the fields that belong to Episode
        const episodeFields = ['title', 'concept', 'outline', 'structureBoard', 'structureBeats', 'linkedCharacterIds'];
        const cleanUpdates: any = {};

        Object.keys(updates).forEach(key => {
            if (episodeFields.includes(key)) {
                cleanUpdates[key] = updates[key];
            }
        });

        if (Object.keys(cleanUpdates).length > 0) {
            updateEpisode(cleanUpdates);
        }
    };

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-zinc-800">
                <Link href={`/projects/${projectId}`} className="flex items-center text-xs text-zinc-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    シリーズ詳細へ戻る
                </Link>
                <h1 className="font-bold text-sm text-zinc-400 mb-1 truncate">{project.title}</h1>
                <h2 className="font-bold text-xl text-white truncate">{episode.title}</h2>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4 mb-2">制作ステップ</div>
                {steps.map((step) => (
                    <Button
                        key={step.id}
                        onClick={() => {
                            setCurrentStep(step.id);
                            setIsSidebarOpen(false);
                        }}
                        variant={currentStep === step.id ? "default" : "ghost"}
                        className={`w-full justify-start text-left overflow-hidden ${currentStep === step.id ? "font-bold bg-[#0077BE] text-white hover:bg-[#0077BE]/90" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                    >
                        <span className="flex-1 truncate">{step.label}</span>
                        {currentStep === step.id && <ChevronRight className="w-4 h-4 opacity-100 flex-shrink-0 ml-2" />}
                    </Button>
                ))}
            </nav>
            <div className="p-4 border-t border-zinc-800 mt-auto">
                <UserMenu showName={true} />
            </div>
        </>
    );

    return (
        <div className="flex bg-zinc-50 min-h-screen dark:bg-zinc-950">
            {/* Desktop Sidebar */}
            <aside className="w-64 fixed h-full bg-[#253341] border-r border-zinc-800 z-30 hidden md:flex flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
            )}
            <aside className={`md:hidden fixed inset-y-0 left-0 w-72 bg-[#253341] z-50 transform transition-transform duration-300 ease-in-out border-r border-zinc-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full border-r border-transparent">
                    <SidebarContent />
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full bg-white border-b border-zinc-200 z-20 px-4 h-14 flex items-center justify-between dark:bg-zinc-950 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        <Menu size={20} />
                    </button>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[200px]">{episode.title}</span>
                </div>
                <UserMenu />
            </header>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
                <div className="max-w-5xl mx-auto">
                    {/* 
                        We pass 'mockProjectData' as 'project' to trick the components into working 
                        with Episode data. For Step6Scenes, we explicitly pass 'episode'.
                    */}
                    <CurrentComponent
                        project={mockProjectData}
                        episode={episode}
                        onUpdate={handleStepUpdate}
                    />
                </div>
            </main>
        </div>
    );
}
