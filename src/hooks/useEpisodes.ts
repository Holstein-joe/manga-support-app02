import { useState, useEffect, useRef } from 'react';
import { Project, Episode } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';

export const useEpisode = (projectId: string, episodeId: string) => {
    const { projects, updateProject, loading: projectsLoading } = useProjects();
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectsLoading) return;

        const foundProject = projects.find(p => p.id === projectId);
        if (foundProject) {
            setProject(foundProject);
            const foundEpisode = foundProject.episodes?.find(e => e.id === episodeId);
            if (foundEpisode) {
                setEpisode(foundEpisode);
            } else {
                setEpisode(null);
            }
        } else {
            setProject(null);
            setEpisode(null);
        }
        setLoading(false);
    }, [projects, projectId, episodeId, projectsLoading]);

    const updateEpisode = (updates: Partial<Episode>) => {
        if (!project || !episode) return;

        const updatedEpisode = { ...episode, ...updates, lastEdited: new Date().toISOString() };
        setEpisode(updatedEpisode);

        // Update within Project
        const updatedEpisodes = project.episodes?.map(e => e.id === episodeId ? updatedEpisode : e) || [];
        updateProject(projectId, { episodes: updatedEpisodes });
    };

    return {
        project,
        episode,
        loading,
        updateEpisode
    };
};
