
import React from 'react';
import { SectionCard } from './SectionCard';
import { CharacterProfile } from '@/types/project';

interface EpisodeCollectionProps {
    title: string;
    field: keyof CharacterProfile;
    values?: string[];
    onUpdate: (field: keyof CharacterProfile, index: number, value: string) => void;
}

export const EpisodeCollection = ({ title, field, values = [], onUpdate }: EpisodeCollectionProps) => {
    const safeValues = [...(values || [])];
    // Ensure at least 4 slots
    while (safeValues.length < 4) safeValues.push('');

    return (
        <SectionCard title={title}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safeValues.slice(0, 4).map((val: string, idx: number) => (
                    <div key={idx} className="relative">
                        <span className="absolute top-2 left-3 text-xs font-bold text-zinc-600">#{idx + 1}</span>
                        <textarea
                            value={val}
                            onChange={(e) => onUpdate(field, idx, e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-all placeholder:text-zinc-700 resize-none h-24 text-sm"
                            placeholder="内容を入力..."
                        />
                    </div>
                ))}
            </div>
        </SectionCard>
    );
};
