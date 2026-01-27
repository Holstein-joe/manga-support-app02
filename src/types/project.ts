export interface DialogueUnit {
    id: string;
    text: string;
    character: string; // Deprecated but kept for fallback
    characterId?: string; // Link to Project.characters
    memo: string;
}

export interface CharacterProfile {
    // --- 1. Basic & Personality (基本・性格) ---
    // Core
    name?: string;
    memo?: string;
    role?: string;
    gender?: string;
    age?: string;
    speechHabit?: string;       // 口癖
    firstPerson?: string;       // 一人称
    nickname?: string;          // あだ名
    gestures?: string;          // よくする仕草

    // Personality Deep Dive
    personality?: string;       // 性格
    personalityCause?: string;  // 原因
    charm?: string;             // 魅力
    currentSituation?: string;  // 現在の境遇
    currentSituationCause?: string;
    backstory?: string;         // 生い立ち
    backstoryCause?: string;
    reputation?: string;        // 周囲からの評判
    reputationCause?: string;
    habit?: string;             // 癖
    habitCause?: string;
    principles?: string;        // 倫理・法律より大事なもの
    principlesCause?: string;

    // Hardships & Inner Self
    hardestEvent?: string;      // 最も困難だった出来事
    hardestEventResolution?: string; // どう乗り越えたか
    strengths?: string;
    strengthsCause?: string;
    strengthsEpisode?: string;
    weaknesses?: string;
    weaknessesCause?: string;
    weaknessesEpisode?: string;
    complex?: string;
    complexCause?: string;
    empathyPoint?: string;      // 共感できるところ
    empathyEpisode?: string;
    duality?: string;           // 二面性・葛藤
    dualityCause?: string;
    philosophy?: string;        // 独自の考え
    philosophyCause?: string;

    // --- 2. Story Settings (物語の設定) ---
    birthDate?: string;
    deathDate?: string;         // 命日
    motivation?: string;        // 動機・目的
    obstacles?: string;         // 障害
    obstacleAction?: string;    // 解決行動
    growthArc?: string;         // 物語を通した変化
    pastIncidentInvolvement?: string; // 過去の事件との関わり
    firstAppearance?: string;   // 初登場シーン
    exitScene?: string;         // 退場シーン

    // Stage Progression (Situation, Mindset, Standing)
    stageEarly?: string;
    stageMiddle?: string;
    stageLate?: string;

    // Collections
    representativeLines?: string[]; // 印象的なセリフ (1-4)
    charmEpisodes?: string[];       // 魅力がわかるエピソード (1-4)

    // --- 3. Appearance (外見) ---
    race?: string;
    skinColor?: string;
    eyes?: string;              // 形・色
    hair?: string;              // 色・髪型
    body?: string;              // 体型・身長・体重
    physicalFeatures?: string;  // 身体的特徴
    firstImpression?: string;
    charmPoint?: string;
    fashionCasual?: string;
    fashionWork?: string;
    fashionFormal?: string;
    fashionFavorite?: string;
    accessories?: string;

    // --- 4. Social Settings (社会) ---
    // Theme: Socially correct, personally wrong
    job?: string;
    jobCause?: string;
    careerGoal?: string;
    careerGoalCause?: string;
    position?: string;
    positionCause?: string;
    workOpinion?: string;       // 仕事内容への思い
    workOpinionCause?: string;
    satisfaction?: string;      // 評価・給料への満足度
    satisfactionCause?: string;
    workRelationships?: string; // 上司・同僚・部下
    workRelationshipsCause?: string;
    workplace?: string;         // 勤務地
    workplaceCause?: string;
    futureAnxiety?: string;
    futureAnxietyCause?: string;
    socialEpisodes?: string[];  // 社会的エピソード (1-4)

    // --- 5. Personal/Family (個人的) ---
    // Theme: Familially correct, socially wrong
    familyStructure?: string;
    familyPosition?: string;
    marriageStatus?: string;
    marriageStory?: string;
    marriageLife?: string;
    loveInterest?: string;
    loveInterestTrigger?: string;
    loveInterestRelationship?: string;
    exPartners?: string;
    exPartnersCause?: string;
    neighborRelationships?: string;
    neighborRelationshipsCurrent?: string;
    parentRelationship?: string;
    childRelationship?: string;
    childRelationshipPast?: string;
    childRelationshipCurrent?: string;
    relativeRelationship?: string;
    relativeRelationshipCurrent?: string;
    friends?: string;
    friendsTrigger?: string;
    friendActivities?: string;
    friendActivitiesTrigger?: string;
    enemies?: string;
    enemiesTrigger?: string;
    personalEpisodes?: string[]; // 個人的エピソード (1-4)

    // --- 6. Private (プライベート) ---
    // Theme: Personally correct, familially/socially wrong
    solitaryActivity?: string;
    solitaryActivityTrigger?: string;
    solitaryActivityFeeling?: string;
    weekendActivity?: string;
    weekendActivityTrigger?: string;
    weekendActivityFeeling?: string;
    dailyHabit?: string;
    dailyHabitTrigger?: string;
    dailyHabitFeeling?: string;
    hobbies?: string;
    hobbiesTrigger?: string;
    hobbiesFeeling?: string;
    fears?: string;
    fearsTrigger?: string;
    futureGoal?: string;
    futureGoalTrigger?: string;
    privateEpisodes?: string[]; // プライベートエピソード (1-4)
}

export interface CharacterItem {
    id: string;
    name: string;
    description: string;
    icon?: string; // DataURL
    groupIds?: string[]; // IDs of CharacterGroup
    profile?: CharacterProfile; // New detailed profile
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

export interface Episode {
    id: string;
    projectId: string;
    title: string;
    order: number;
    lastEdited: string;

    // Story Data (Moved from old Project)
    concept?: {
        theme: string;
        emotions: string;
        keywords: string;
        note: string;
    };
    outline?: {
        start: string;
        end: string;
        midpoint: string;
        decision: string;
    };
    structureBoard?: {
        id: string;
        content: string; // Episode Title
        act: '1' | '2' | '3';
        tags?: ('vs' | 'wakuwaku' | 'dokidoki' | 'bikkuri')[];
        scenes?: SceneItem[]; // Hierarchical Scenes
    }[];
    structureBeats?: {
        tp1: string;
        midpoint: string;
        tp2: string;
    };
    linkedCharacterIds?: string[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    worldView?: string;
    episodes?: Episode[];
    lastEdited: string;

    // Global Settings
    characters?: CharacterItem[]; // Deprecated: Use global pool
}
