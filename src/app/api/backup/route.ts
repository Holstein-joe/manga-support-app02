import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all projects for the user with their episodes
        const projects = await prisma.project.findMany({
            where: {
                // @ts-ignore
                userId: session.user.id
            },
            include: {
                episodes: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Transform data: Unpack 'content' JSON in episodes
        const exportData = projects.map(project => ({
            ...project,
            episodes: project.episodes.map((ep: any) => ({
                ...ep,
                ...(ep.content as object || {}),
                content: undefined // Remove raw JSON field
            }))
        }));

        const date = new Date().toISOString().split('T')[0];
        const filename = `aozu-backup-${date}.json`;

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error("Backup Error:", error);
        return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
    }
}
