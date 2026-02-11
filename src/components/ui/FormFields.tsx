
import React from 'react';

interface SharedFieldProps {
    label: string;
    value?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

export const FormField = ({ label, value, onChange, placeholder }: SharedFieldProps) => (
    <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{label}</label>
        <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-all placeholder:text-zinc-700"
        />
    </div>
);

export const FormTextarea = ({ label, value, onChange, placeholder, height = "h-24" }: SharedFieldProps & { height?: string }) => (
    <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{label}</label>
        <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800 transition-all placeholder:text-zinc-700 resize-none leading-relaxed ${height}`}
        />
    </div>
);

interface CauseFieldProps extends SharedFieldProps {
    cause?: string;
    onCauseChange?: (value: string) => void;
    height?: string;
}

export const CauseField = ({ label, value, cause, onChange, onCauseChange, placeholder, height = "h-20" }: CauseFieldProps) => (
    <div className="mb-6 group">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{label}</label>
        <div className="space-y-2">
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all placeholder:text-zinc-700 resize-none leading-relaxed ${height}`}
            />
            <div className="pl-4 border-l-2 border-zinc-800 group-focus-within:border-zinc-600 transition-colors">
                <input
                    value={cause || ''}
                    onChange={(e) => onCauseChange?.(e.target.value)}
                    placeholder="↳ 原因・理由・背景..."
                    className="w-full bg-transparent text-sm text-zinc-400 focus:text-zinc-200 focus:outline-none placeholder:text-zinc-700 py-1"
                />
            </div>
        </div>
    </div>
);

interface TriggerFieldProps extends SharedFieldProps {
    trigger?: string;
    onTriggerChange?: (value: string) => void;
}

export const TriggerField = ({ label, value, trigger, onChange, onTriggerChange, placeholder }: TriggerFieldProps) => (
    <div className="mb-6">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{label}</label>
        <div className="space-y-2">
            <input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all placeholder:text-zinc-700"
            />
            <div className="pl-4 border-l-2 border-zinc-800">
                <input
                    value={trigger || ''}
                    onChange={(e) => onTriggerChange?.(e.target.value)}
                    placeholder="↳ きっかけ・トリガー"
                    className="w-full bg-transparent text-sm text-zinc-400 focus:text-zinc-200 focus:outline-none placeholder:text-zinc-700 py-1"
                />
            </div>
        </div>
    </div>
);

interface ActivityFieldProps extends SharedFieldProps {
    trigger?: string;
    feeling?: string;
    onTriggerChange?: (value: string) => void;
    onFeelingChange?: (value: string) => void;
}

export const ActivityField = ({ label, value, trigger, feeling, onChange, onTriggerChange, onFeelingChange }: ActivityFieldProps) => (
    <div className="mb-8 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
        <h4 className="text-sm font-bold text-zinc-400 mb-3">{label}</h4>
        <div className="space-y-3">
            <input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="活動内容..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <input
                    value={trigger || ''}
                    onChange={(e) => onTriggerChange?.(e.target.value)}
                    placeholder="きっかけ..."
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-500 text-xs text-zinc-400 focus:outline-none py-1"
                />
                <input
                    value={feeling || ''}
                    onChange={(e) => onFeelingChange?.(e.target.value)}
                    placeholder="その時の感情..."
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-500 text-xs text-zinc-400 focus:outline-none py-1"
                />
            </div>
        </div>
    </div>
);


interface EpisodeFieldProps extends SharedFieldProps {
    cause?: string;
    episode?: string;
    onCauseChange?: (value: string) => void;
    onEpisodeChange?: (value: string) => void;
}

export const EpisodeField = ({ label, value, cause, episode, onChange, onCauseChange, onEpisodeChange, placeholder }: EpisodeFieldProps) => (
    <div className="mb-6">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{label}</label>
        <div className="space-y-3">
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all placeholder:text-zinc-700 resize-none h-20"
            />
            {cause !== undefined && (
                <div className="pl-4 border-l-2 border-zinc-800">
                    <input
                        value={cause || ''}
                        onChange={(e) => onCauseChange?.(e.target.value)}
                        placeholder="↳ 原因・理由"
                        className="w-full bg-transparent text-sm text-zinc-400 focus:text-zinc-200 focus:outline-none placeholder:text-zinc-700 py-1"
                    />
                </div>
            )}
            <div className="pl-4 border-l-2 border-zinc-800 pt-1">
                <textarea
                    value={episode || ''}
                    onChange={(e) => onEpisodeChange?.(e.target.value)}
                    placeholder="↳ 具体的なエピソード"
                    className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 resize-none h-16 placeholder:text-zinc-700"
                />
            </div>
        </div>
    </div>
);
