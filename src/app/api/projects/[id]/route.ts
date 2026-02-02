import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: RouteParams) {
    const { id } = await params;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                episodes: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Unpack content JSON to top-level properties
        const transformedProject = {
            ...project,
            episodes: project.episodes.map((ep: any) => ({
                ...ep,
                ...(ep.content as object || {}),
                content: undefined // Cleanup
            }))
        };

        return NextResponse.json(transformedProject);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching project' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // 必要なデータを取り出し (古い 'data' プロパティは無視)
        const { title, description, worldView, themeStructure, worldStructure, episodes } = body;

        // 1. プロジェクト本体の更新
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (worldView !== undefined) updateData.worldView = worldView;
        if (themeStructure !== undefined) updateData.themeStructure = themeStructure;
        if (worldStructure !== undefined) updateData.worldStructure = worldStructure;

        // まずプロジェクト基本情報を更新 (内容はあれば)
        if (Object.keys(updateData).length > 0) {
            await prisma.project.update({
                where: { id },
                data: updateData,
            });
        }

        if (episodes && Array.isArray(episodes)) {
            const incomingEpisodeIds = episodes.map((ep: any) => ep.id).filter(Boolean);

            console.log(`[PUT] Project ${id}: Updating episodes.`);
            console.log(`[PUT] Incoming IDs: ${incomingEpisodeIds.join(', ')}`);

            const deleteResult = await prisma.episode.deleteMany({
                where: {
                    projectId: id,
                    id: { notIn: incomingEpisodeIds }
                }
            });
            console.log(`[PUT] Deleted ${deleteResult.count} episodes not in list.`);

            await prisma.$transaction([
                // Upsert incoming episodes (Delete is done above safely)
                ...episodes.map((ep: any) => {
                    const { concept, outline, structureBoard, plot, ...baseFields } = ep;

                    // Pack story data into content JSON
                    const contentJson = {
                        concept,
                        outline,
                        structureBoard,
                        plot
                    };

                    return prisma.episode.upsert({
                        where: { id: ep.id },
                        update: {
                            title: ep.title,
                            order: ep.order,
                            content: contentJson, // Store packed data
                            lastEdited: new Date(),
                        },
                        create: {
                            id: ep.id,
                            projectId: id,
                            title: ep.title,
                            order: ep.order,
                            content: contentJson, // Store packed data
                        }
                    });
                })
            ]);
        }

        // ★重要: 更新後の完全なデータ（エピソード込み）を再取得して返す
        const updatedProject = await prisma.project.findUnique({
            where: { id },
            include: {
                episodes: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!updatedProject) throw new Error("Updated project not found");

        const transformedProject = {
            ...updatedProject,
            episodes: updatedProject.episodes.map((ep: any) => ({
                ...ep,
                ...(ep.content as object || {}),
                content: undefined
            }))
        };

        return NextResponse.json(transformedProject);

    } catch (error: any) {
        console.error("Update Error:", error);
        return NextResponse.json({
            error: 'Error updating project',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 関連するエピソードも消える設定(Cascade)になっていればこれだけでOK
        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting project' }, { status: 500 });
    }
}