import { useState, useEffect } from 'react';
import { CharacterItem, CharacterGroup } from '@/types/project';

const CHAR_STORAGE_KEY = 'manga-app-global-characters';
const GROUP_STORAGE_KEY = 'manga-app-character-groups';

const DEFAULT_GROUPS: CharacterGroup[] = [
    { id: 'g1', name: 'メインキャスト', color: '#ef4444' },
    { id: 'g2', name: '敵役・ライバル', color: '#3b82f6' },
    { id: 'g3', name: 'サブキャラクター', color: '#10b981' },
];

export const useCharacters = () => {
    const [characters, setCharacters] = useState<CharacterItem[]>([]);
    const [groups, setGroups] = useState<CharacterGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedChars = localStorage.getItem(CHAR_STORAGE_KEY);
        const storedGroups = localStorage.getItem(GROUP_STORAGE_KEY);

        if (storedChars) setCharacters(JSON.parse(storedChars));
        if (storedGroups) {
            setGroups(JSON.parse(storedGroups));
        } else {
            setGroups(DEFAULT_GROUPS);
            localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
        }
        setLoading(false);
    }, []);

    const saveCharacters = (newList: CharacterItem[]) => {
        setCharacters(newList);
        localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(newList));
    };

    const saveGroups = (newList: CharacterGroup[]) => {
        setGroups(newList);
        localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(newList));
    };

    const addCharacter = (char: Omit<CharacterItem, 'id'>) => {
        const newChar = { ...char, id: crypto.randomUUID() };
        saveCharacters([newChar, ...characters]);
        return newChar;
    };

    const updateCharacter = (id: string, updates: Partial<CharacterItem>) => {
        const newList = characters.map(c => c.id === id ? { ...c, ...updates } : c);
        saveCharacters(newList);
    };

    const deleteCharacter = (id: string) => {
        const newList = characters.filter(c => c.id !== id);
        saveCharacters(newList);
    };

    const addGroup = (name: string) => {
        const newGroup = { id: crypto.randomUUID(), name };
        saveGroups([...groups, newGroup]);
    };

    return {
        characters,
        groups,
        loading,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        addGroup
    };
};
