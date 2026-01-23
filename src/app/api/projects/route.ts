import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
        where: { userId: (session.user as any).id },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, data } = await req.json();

    const project = await prisma.project.create({
        data: {
            title: title || "New Project",
            description: description || "",
            data: data || {},
            userId: (session.user as any).id,
        },
    });

    return NextResponse.json(project);
}
