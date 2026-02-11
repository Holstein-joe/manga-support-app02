
import React from 'react';

export const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold mb-6 text-zinc-100 flex items-center gap-2">
            <div className="w-1 h-6 bg-white rounded-full"></div>
            {title}
        </h3>
        {children}
    </div>
);
