import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
export type { Project };

interface ProjectCardProps {
    project: Project;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const formattedDate = new Date(project.lastEdited).toLocaleDateString('ja-JP');

    return (
        <div className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden h-full">
            <Link href={`/projects/${project.id}`} className="block flex-1 cursor-pointer">
                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 truncate">
                            {project.title}
                        </h3>
                        <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed dark:text-zinc-400">
                            {project.description || "説明なし"}
                        </p>
                    </div>
                </div>
            </Link>

            <div className="px-5 pb-5 mt-auto">
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <p className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                        最終更新: {formattedDate}
                    </p>
                </div>
            </div>
        </div>
    );
};
