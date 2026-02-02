import { useState, useEffect } from 'react';
import { CharacterItem, CharacterGroup } from '@/types/project';

const CHAR_STORAGE_KEY = 'manga-app-global-characters';
const GROUP_STORAGE_KEY = 'manga-app-character-groups';

const DEFAULT_GROUPS: CharacterGroup[] = [
    { id: 'g1', name: 'メインキャスト', color: '#ef4444' },
    { id: 'g2', name: '敵役・ライバル', color: '#3b82f6' },
    { id: 'g3', name: 'サブキャラクター', color: '#10b981' },
];

export const useCharacters = (projectId?: string) => {
    const [allCharacters, setAllCharacters] = useState<CharacterItem[]>([]);
    const [groups, setGroups] = useState<CharacterGroup[]>([]);
    const [loading, setLoading] = useState(true);

    // Derived state for the specific project (or all if no projectId)
    const characters = projectId
        ? allCharacters.filter(c => c.projectId === projectId)
        : allCharacters;

    useEffect(() => {
        const storedChars = localStorage.getItem(CHAR_STORAGE_KEY);
        const storedGroups = localStorage.getItem(GROUP_STORAGE_KEY);

        if (storedChars) setAllCharacters(JSON.parse(storedChars));
        if (storedGroups) {
            setGroups(JSON.parse(storedGroups));
        } else {
            setGroups(DEFAULT_GROUPS);
            localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
        }
        setLoading(false);
    }, []);

    const saveCharacters = (newList: CharacterItem[]) => {
        setAllCharacters(newList);
        localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(newList));
    };

    const saveGroups = (newList: CharacterGroup[]) => {
        setGroups(newList);
        localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(newList));
    };

    const addCharacter = (char: Omit<CharacterItem, 'id'>) => {
        const newChar: CharacterItem = {
            ...char,
            id: crypto.randomUUID(),
            projectId: projectId // Auto-assign project ID if present
        };
        const newList = [newChar, ...allCharacters];
        saveCharacters(newList);
        return newChar;
    };

    const updateCharacter = (id: string, updates: Partial<CharacterItem>) => {
        const newList = allCharacters.map(c => c.id === id ? { ...c, ...updates } : c);
        saveCharacters(newList);
    };

    const deleteCharacter = (id: string) => {
        const newList = allCharacters.filter(c => c.id !== id);
        saveCharacters(newList);
    };

    const addGroup = (name: string) => {
        const newGroup = { id: crypto.randomUUID(), name };
        saveGroups([...groups, newGroup]);
    };

    const deleteGroup = (id: string) => {
        if (confirm('本当にこのグループを削除しますか？\n所属しているキャラクターの設定は解除されますが、キャラクター自体は削除されません。')) {
            const newList = groups.filter(g => g.id !== id);
            saveGroups(newList);
            // Optionally remove groupId from characters? 
            // Currently character.groupIds is just an array of strings. 
            // If we delete the group, those strings become orphans.
            // It's cleaner to remove them, but strictly not required for MVP if we handle missing groups gracefully.
            // Let's implement cleanup for consistency.
            const updatedCharacters = allCharacters.map(c => {
                if (c.groupIds?.includes(id)) {
                    return { ...c, groupIds: c.groupIds.filter(gid => gid !== id) };
                }
                return c;
            });
            saveCharacters(updatedCharacters);
        }
    };

    return {
        characters,
        groups,
        loading,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        addGroup,
        deleteGroup
    };
};
