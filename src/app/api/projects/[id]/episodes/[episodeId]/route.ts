import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
    params: Promise<{ id: string; episodeId: string }>;
}

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: RouteParams) {
    const { id, episodeId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Ensure we are only updating the specific episode
        // and only fields that are actually passed.
        // Prisma's update will ignore undefined values if we construct the object carefully,
        // but explicit checks are safer for partial updates.

        const { title, content, concept, outline, structureBoard, structureBeats, plot, lastEdited } = body;

        // Construct the content JSON if individual fields are passed
        // This merges with existing content if we were doing a fetch-first, 
        // but for efficiency we might just want to overwrite the specific keys in the JSON.
        // Prisma doesn't support deep merge of JSON columns easily out of the box without raw queries or fetching first.
        // However, usually the client sends the *complete* structureBoard or *complete* outline.

        // Strategy: We expect the client to pass the specific fields they want to update.
        // We will fetch the current episode first to merge the JSON content safely.

        const currentEpisode = await prisma.episode.findUnique({
            where: { id: episodeId, projectId: id }
        });

        if (!currentEpisode) {
            return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
        }

        const currentContent = (currentEpisode.content as any) || {};

        // Update content object
        const newContent = {
            ...currentContent,
            ...(concept ? { concept } : {}),
            ...(outline ? { outline } : {}),
            ...(structureBoard ? { structureBoard } : {}),
            ...(structureBeats ? { structureBeats } : {}),
            ...(plot ? { plot } : {}),
        };

        const updateData: any = {
            lastEdited: new Date(), // Always update timestamp
        };

        if (title !== undefined) updateData.title = title;
        if (Object.keys(newContent).length > 0) updateData.content = newContent;

        const updatedEpisode = await prisma.episode.update({
            where: { id: episodeId },
            data: updateData
        });

        // Unpack for response
        const transformedEpisode = {
            ...updatedEpisode,
            ...(updatedEpisode.content as object || {}),
            content: undefined
        };

        return NextResponse.json(transformedEpisode);

    } catch (error: any) {
        console.error("Episode Update Error:", error);
        return NextResponse.json({
            error: 'Error updating episode',
            details: error.message
        }, { status: 500 });
    }
}
