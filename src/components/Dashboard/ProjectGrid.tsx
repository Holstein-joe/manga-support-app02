import React from 'react';
import { Project, ProjectCard } from './ProjectCard';

interface ProjectGridProps {
    projects: Project[];
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onEdit, onDelete }) => {
    if (projects.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 border-dashed">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">プロジェクトがありません</h3>
                <p className="text-zinc-500 mt-2">新しい漫画プロジェクトを作成して始めましょう。</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
