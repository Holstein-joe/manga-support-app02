import React, { useState, useEffect } from 'react';
import { Project, CharacterItem, CharacterProfile } from '@/types/project';

interface Step2CharacterProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

// Helper function to get the main character's profile
const getMainCharacterProfile = (project: Project): Partial<CharacterProfile> => {
    const mainCharacter = project.characters?.[0];
    return mainCharacter?.profile || {};
};

export const Step2Character: React.FC<Step2CharacterProps> = ({ project, onUpdate }) => {
    // The local state of the component now represents a subset of the CharacterProfile
    const [data, setData] = useState({
        name: getMainCharacterProfile(project).name || '',
        age: getMainCharacterProfile(project).age || '',
        personality: getMainCharacterProfile(project).personality || '',
        desire: getMainCharacterProfile(project).motivation || '', // Map desire -> motivation
        problem: getMainCharacterProfile(project).hardestEvent || '', // Map problem -> hardestEvent
        weakness: getMainCharacterProfile(project).weaknesses || '',
    });

    // When the project data changes from the parent, update the local state
    useEffect(() => {
        const profile = getMainCharacterProfile(project);
        setData({
            name: profile.name || '',
            age: profile.age || '',
            personality: profile.personality || '',
            desire: profile.motivation || '',
            problem: profile.hardestEvent || '',
            weakness: profile.weaknesses || '',
        });
    }, [project.characters]);

    const handleChange = (field: keyof typeof data, value: string) => {
        setData(prevData => ({ ...prevData, [field]: value }));
    };

    // When the user finishes editing, update the project state
    const handleBlur = () => {
        const existingCharacters = project.characters || [];
        const mainCharacter = existingCharacters[0] || { id: `char-${Date.now()}`, name: '' };

        // Create the updated profile by merging the existing profile with the new data
        const updatedProfile: CharacterProfile = {
            ...mainCharacter.profile,
            name: data.name,
            age: data.age,
            personality: data.personality,
            motivation: data.desire,
            hardestEvent: data.problem,
            weaknesses: data.weakness,
        };

        // Create the updated character item
        const updatedCharacter: CharacterItem = {
            ...mainCharacter,
            name: data.name, // Also update the top-level name for consistency
            profile: updatedProfile,
        };

        // Create the new characters array
        const newCharacters = [...existingCharacters];
        if (newCharacters.length === 0) {
            newCharacters.push(updatedCharacter);
        } else {
            newCharacters[0] = updatedCharacter;
        }

        // Call the parent's update function
        onUpdate({ characters: newCharacters });
    };

    return (
        <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">2</span>
                    主人公を設計する
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">名前</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={handleBlur}
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">年齢</label>
                        <input
                            type="text"
                            value={data.age}
                            onChange={(e) => handleChange('age', e.target.value)}
                            onBlur={handleBlur}
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                        />
                    </div>
                </div>

                <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">性格・特徴</label>
                        <textarea
                            value={data.personality}
                            onChange={(e) => handleChange('personality', e.target.value)}
                            onBlur={handleBlur}
                            rows={3}
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">欲望（何がしたい？）</label>
                        <input
                            type="text"
                            value={data.desire}
                            onChange={(e) => handleChange('desire', e.target.value)}
                            onBlur={handleBlur}
                            className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">抱えている悩み</label>
                            <input
                                type="text"
                                value={data.problem}
                                onChange={(e) => handleChange('problem', e.target.value)}
                                onBlur={handleBlur}
                                className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">弱点・欠点</label>
                            <input
                                type="text"
                                value={data.weakness}
                                onChange={(e) => handleChange('weakness', e.target.value)}
                                onBlur={handleBlur}
                                className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 dark:focus:bg-zinc-900"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
