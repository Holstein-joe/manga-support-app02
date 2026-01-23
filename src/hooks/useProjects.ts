import { useState, useEffect, useRef } from 'react';
import { Project } from '@/types/project';
import { useSession } from 'next-auth/react';

const STORAGE_KEY = 'manga-app-projects-v4-hierarchy';

const SEED_DATA: Project[] = [
    {
        id: 'seed-1',
        title: '魔法使いの弟子と機械仕掛けの街',
        description: '魔法が衰退し、科学が発展した世界。',
        lastEdited: new Date().toISOString(),
        concept: {
            theme: '伝統と革新の対立、そして融合',
            emotions: 'ワクワク感、少しの切なさ、希望',
            keywords: 'スチームパンク, 魔法, 師弟関係, 冒険',
            note: 'ビジュアルは錆びついた真鍮と光る魔法陣のコントラスト。'
        },
        outline: {
            start: '魔法が使えず、周囲にバカにされている状態（ゴールの逆）',
            end: '魔法と科学を融合させ、街の英雄として認められる（ゴール）',
            midpoint: '師匠がさらわれ、魔法だけでは勝てないと悟る（変化のきっかけ）',
            decision: '禁忌とされていた「機械との融合」を受け入れ、新しい杖を作る（変化の証明）'
        },
        structureBoard: [
            {
                id: 'c1', act: '1', content: '廃材置き場で古代の杖を拾う', tags: ['wakuwaku'],
                scenes: [
                    {
                        id: 'i1',
                        drawing: '',
                        dialogues: [
                            { id: 'd1', character: 'アルト', text: 'これが...伝説の杖？', memo: '驚きの表情' }
                        ]
                    },
                    {
                        id: 'i2',
                        drawing: '',
                        dialogues: [
                            { id: 'd2', character: '（ト書き）', text: '杖が淡く光り始める。', memo: '足元の廃材が揺れる' }
                        ]
                    }
                ]
            },
            { id: 'c2', act: '1', content: '機械兵の襲撃、師匠が捕まる [TP1]', tags: ['vs', 'dokidoki'], scenes: [] },
            { id: 'c3', act: '2', content: '機械技師リナとの出会い', tags: ['wakuwaku'], scenes: [] },
            { id: 'c4', act: '2', content: '魔法が通じず敗北 [Midpoint]', tags: ['vs', 'bikkuri'], scenes: [] },
            { id: 'c5', act: '2', content: 'リナと協力してハイブリッド杖を開発', tags: ['wakuwaku'], scenes: [] },
            { id: 'c6', act: '2', content: '敵のアジトへ潜入 [TP2]', tags: ['dokidoki'], scenes: [] },
            { id: 'c7', act: '3', content: '長官との最終決戦', tags: ['vs', 'dokidoki'], scenes: [] },
            { id: 'c8', act: '3', content: '勝利と新しい時代の幕開け', tags: ['wakuwaku'], scenes: [] }
        ]
    }
];

export const useProjects = () => {
    const { data: session, status } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const syncTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

    // 1. Initial Load Logic
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                if (status === 'authenticated') {
                    const res = await fetch('/api/projects');
                    if (res.ok) {
                        const cloudProjects = await res.json();
                        const transformed = cloudProjects.map((p: any) => ({
                            ...p.data,
                            id: p.id,
                            title: p.title,
                            description: p.description,
                            lastEdited: p.updatedAt
                        }));
                        setProjects(transformed);

                        // Migration logic (Optional): If local storage has unique projects, we could upload them
                    }
                } else if (status === 'unauthenticated') {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        setProjects(JSON.parse(stored));
                    } else {
                        setProjects(SEED_DATA);
                    }
                }
            } catch (err) {
                console.error("Sync load failed", err);
            } finally {
                setLoading(false);
            }
        };

        if (status !== 'loading') {
            loadInitialData();
        }
    }, [status]);

    // 2. Add Project
    const addProject = async (project: Omit<Project, 'id' | 'lastEdited'>) => {
        const tempId = crypto.randomUUID();
        const newProject: Project = {
            ...project,
            id: tempId,
            lastEdited: new Date().toISOString(),
        };

        setProjects(prev => [newProject, ...prev]);

        if (status === 'authenticated') {
            try {
                const res = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: newProject.title,
                        description: newProject.description,
                        data: newProject
                    })
                });
                if (res.ok) {
                    const saved = await res.json();
                    setProjects(prev => prev.map(p => p.id === tempId ? { ...p, id: saved.id } : p));
                }
            } catch (err) {
                console.error("Cloud create failed", err);
            }
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([newProject, ...projects]));
        }
    };

    // 3. Update Project (with Auto-save debounce)
    const updateProject = (id: string, updates: Partial<Project>) => {
        setProjects(prev => {
            const updatedProjects = prev.map(p => {
                if (p.id === id) {
                    const updatedProject = {
                        ...p,
                        ...updates,
                        lastEdited: new Date().toISOString()
                    };

                    // Auto-sync if authenticated
                    if (status === 'authenticated') {
                        if (syncTimeoutRef.current[id]) clearTimeout(syncTimeoutRef.current[id]);
                        syncTimeoutRef.current[id] = setTimeout(async () => {
                            try {
                                await fetch(`/api/projects/${id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        title: updatedProject.title,
                                        description: updatedProject.description,
                                        data: updatedProject
                                    })
                                });
                            } catch (err) {
                                console.error("Auto-save failed", err);
                            }
                        }, 2000); // 2 second stability window
                    }

                    return updatedProject;
                }
                return p;
            });

            if (status !== 'authenticated') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
            }
            return updatedProjects;
        });
    };

    // 4. Delete Project
    const deleteProject = async (id: string) => {
        setProjects(prev => {
            const filtered = prev.filter(p => p.id !== id);
            if (status !== 'authenticated') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            }
            return filtered;
        });

        if (status === 'authenticated') {
            try {
                await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            } catch (err) {
                console.error("Cloud delete failed", err);
            }
        }
    };

    return { projects, loading: loading || status === 'loading', addProject, deleteProject, updateProject };
};
