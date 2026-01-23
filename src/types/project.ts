export interface DialogueUnit {
    id: string;
    text: string;
    character: string; // Deprecated but kept for fallback
    characterId?: string; // Link to Project.characters
    memo: string;
}

export interface CharacterItem {
    id: string;
    name: string;
    description: string;
    icon?: string; // DataURL
    groupIds?: string[]; // IDs of CharacterGroup
}

export interface CharacterGroup {
    id: string;
    name: string;
    color?: string;
}

export interface SceneItem {
    id: string;
    drawing: string; // Sketch DataURL
    dialogues: DialogueUnit[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    lastEdited: string;

    // STEP 1: Concept
    concept: {
        theme: string;
        emotions: string;
        keywords: string;
        note: string;
    };

    // New: Global Character Pool & Project Links
    characters?: CharacterItem[]; // Deprecated: Moving to global
    linkedCharacterIds?: string[]; // IDs of characters from global pool

    // STEP 2: Outline (Sanada Method)
    outline?: {
        start: string; // Reverse of Goal
        end: string;   // Goal
        midpoint: string; // Change Trigger
        decision: string; // Proof of Change
    };

    // STEP 3: Structure Board (Sanada Method / User Step 5)
    structureBeats?: {
        tp1: string;
        midpoint: string;
        tp2: string;
    };
    structureBoard?: {
        id: string;
        content: string; // Episode Title
        act: '1' | '2' | '3';
        tags?: ('vs' | 'wakuwaku' | 'dokidoki' | 'bikkuri')[];
        scenes?: SceneItem[]; // Hierarchical Scenes (User Step 6)
    }[];

    // Old fields for reference
    character?: any;
    story?: any;
    structure?: any;
    plot?: any;
    scenes?: any; // Deprecated
}
