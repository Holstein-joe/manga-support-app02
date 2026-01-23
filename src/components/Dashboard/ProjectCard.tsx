import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Project } from '@/types/project';

interface ProjectCardProps {
    project: Project;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
    const gradients = [
        "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
        "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500",
        "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500",
        "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500",
    ];
    // Use a simple hash for consistent gradient assigning
    const gradientIndex = project.id ? (project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length) : 0;
    const gradientClass = gradients[gradientIndex];

    return (
        <div className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden h-full">
            <Link href={`/projects/${project.id}`} className="block flex-1 cursor-pointer">
                <div className={`h-24 w-full ${gradientClass} opacity-80 transition-opacity group-hover:opacity-100`} />
                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
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
                        最終更新: {project.lastEdited}
                    </p>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onEdit?.(project.id)
                            }}
                        >
                            <Edit className="h-4 w-4 text-zinc-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDelete?.(project.id)
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
