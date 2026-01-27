import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
    params: Promise<{ id: string }>;
}

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

        return NextResponse.json(project);
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
        const { title, description, worldView, episodes } = body;

        // 1. プロジェクト本体の更新
        const updateData: any = {
            lastEdited: new Date(),
        };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (worldView !== undefined) updateData.worldView = worldView;

        // まずプロジェクト基本情報を更新
        await prisma.project.update({
            where: { id },
            data: updateData,
        });

        // 2. エピソードの更新 (トランザクションで一括処理)
        if (episodes && Array.isArray(episodes)) {
            await prisma.$transaction(
                episodes.map((ep: any) =>
                    prisma.episode.upsert({
                        where: { id: ep.id },
                        update: {
                            title: ep.title,
                            order: ep.order,
                            concept: ep.concept ?? undefined,
                            outline: ep.outline ?? undefined,
                            structureBoard: ep.structureBoard ?? undefined,
                            plot: ep.plot ?? undefined,
                            lastEdited: new Date(),
                        },
                        create: {
                            id: ep.id,
                            projectId: id,
                            title: ep.title,
                            order: ep.order,
                            concept: ep.concept ?? undefined,
                            outline: ep.outline ?? undefined,
                            structureBoard: ep.structureBoard ?? undefined,
                            plot: ep.plot ?? undefined,
                        }
                    })
                )
            );
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

        return NextResponse.json(updatedProject);

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: 'Error updating project' }, { status: 500 });
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