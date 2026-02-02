"use client";

import { CharacterDetailClient } from "@/app/characters/[id]/CharacterDetailClient";
import { useParams } from "next/navigation";

export default function ProjectCharacterDetailWrapper() {
    const params = useParams();
    const projectId = params?.id as string;
    const charId = params?.charId as string;

    return (
        <CharacterDetailClient
            characterId={charId}
            backLink={`/projects/${projectId}/characters`}
        />
    );
}
