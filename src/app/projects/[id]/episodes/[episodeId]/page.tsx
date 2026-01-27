
import { EpisodePageClient } from './EpisodePageClient';

export default async function EpisodePage({ params }: { params: Promise<{ id: string, episodeId: string }> }) {
    const { id, episodeId } = await params;
    return <EpisodePageClient projectId={id} episodeId={episodeId} />;
}
