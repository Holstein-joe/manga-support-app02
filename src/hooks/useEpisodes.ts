import { useState, useEffect, useRef } from 'react';
import { Project, Episode } from '@/types/project';
import { useProject } from '@/hooks/useProjects';

export const useEpisode = (projectId: string, episodeId: string) => {
    // Switch to useProject (singular) to fetch full details including episodes
    const { project, loading: projectLoading, updateProject } = useProject(projectId);
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (projectLoading) return;

        if (project) {
            const foundEpisode = project.episodes?.find(e => e.id === episodeId);
            setEpisode(foundEpisode || null);
        } else {
            setEpisode(null);
        }
        setLoading(false);
    }, [project, episodeId, projectLoading]);

    const updateEpisode = (updates: Partial<Episode>) => {
        if (!project || !episode) return;

        const updatedEpisode = { ...episode, ...updates, lastEdited: new Date().toISOString() };
        setEpisode(updatedEpisode);

        // 1. Update LOCAL state immediately (Skip Project Cloud Save)
        const updatedEpisodes = project.episodes?.map(e => e.id === episodeId ? updatedEpisode : e) || [];
        updateProject({ episodes: updatedEpisodes }, { localOnly: true });

        // 2. Persist ONLY this Episode to Cloud (Debounced)
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        const timeoutId = setTimeout(async () => {
            try {
                // Determine what to send - only send fields that are present in updates to match our API logic
                // Or simply send the updated fields.
                // For simplicity and robustness, we send the specific known large fields if they are in 'updates',
                // plus standard fields. 
                // However, the API we built merges whatever we send.
                // Let's send the specific updates + IDs.

                await fetch(`/api/projects/${projectId}/episodes/${episodeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
            } catch (err) {
                console.error("Episode auto-save failed", err);
            }
        }, 1000);
        syncTimeoutRef.current = timeoutId;
    };

    return {
        project,
        episode,
        loading: loading || projectLoading,
        updateEpisode
    };
};
