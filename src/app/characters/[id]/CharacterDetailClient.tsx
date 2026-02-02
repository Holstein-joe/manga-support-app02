"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useCharacters } from '@/hooks/useCharacters';
import { CharacterItem, CharacterProfile } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Upload, User, Trash2, X, Plus, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Tab {
    id: string;
    label: string;
}

interface ImageModalProps {
    src: string;
    onClose: () => void;
}

const TABS: Tab[] = [
    { id: 'basic', label: '基本・性格' },
    { id: 'story', label: '物語設定' },
    { id: 'appearance', label: '外見・特徴' },
    { id: 'social', label: '社会関係' },
    { id: 'personal', label: '個人・家族' },
    { id: 'private', label: 'プライベート' },
];

interface SharedFieldProps {
    label: string;
    value?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold mb-6 text-zinc-100 flex items-center gap-2">
            <div className="w-1 h-6 bg-white rounded-full"></div>
            {title}
        </h3>
        {children}
    </div>
);

const FormField = ({ label, value, onChange, placeholder }: SharedFieldProps) => (
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

const FormTextarea = ({ label, value, onChange, placeholder, height = "h-24" }: SharedFieldProps & { height?: string }) => (
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

const CauseField = ({ label, value, cause, onChange, onCauseChange, placeholder, height = "h-20" }: CauseFieldProps) => (
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

const TriggerField = ({ label, value, trigger, onChange, onTriggerChange, placeholder }: TriggerFieldProps) => (
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

const ActivityField = ({ label, value, trigger, feeling, onChange, onTriggerChange, onFeelingChange }: ActivityFieldProps) => (
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

const EpisodeField = ({ label, value, cause, episode, onChange, onCauseChange, onEpisodeChange, placeholder }: EpisodeFieldProps) => (
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

interface EpisodeCollectionProps {
    title: string;
    field: keyof CharacterProfile;
    values?: string[];
    onUpdate: (field: keyof CharacterProfile, index: number, value: string) => void;
}

const EpisodeCollection = ({ title, field, values = [], onUpdate }: EpisodeCollectionProps) => {
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

import { useDebounce } from '@/hooks/useDebounce'; // Add import

export const CharacterDetailClient = ({
    characterId,
    backLink = '/characters'
}: {
    characterId?: string;
    backLink?: string;
}) => {
    const params = useParams();
    // If characterId prop is passed, use it.
    // Otherwise check for 'charId' (project route) or 'id' (global route) in params.
    const id = characterId || (params?.charId as string) || (params?.id as string);
    const router = useRouter();
    const { characters, groups, updateCharacter, deleteCharacter, addGroup } = useCharacters();
    const [character, setCharacter] = useState<CharacterItem | null>(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved'); // New status state for detailed feedback
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Group creation state
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // Auto-save logic
    // We only want to auto-save when 'character' changes, but ignoring the initial set
    const debouncedCharacter = useDebounce(character, 1000);
    const isFirstLoad = useRef(true);

    // Initial load
    useEffect(() => {
        if (!id) return;

        const found = characters.find(c => c.id === id);
        if (found) {
            // Only set initial state if we haven't edited it yet (or on first mount)
            // But since 'characters' updates when we save, we need to be careful not to overwrite local edits if we were typing?
            // Actually, for a single user local app, 'characters' coming from useCharacters is the source of truth, but we have local state 'character'.
            // When we save, 'characters' will update.
            // We should sync local 'character' with 'found' ONLY on initial load.
            // Re-syncing on every 'characters' change might clobber typing if updates are slow.
            if (isFirstLoad.current) {
                if (!found.profile) {
                    setCharacter({ ...found, profile: {} as CharacterProfile });
                } else {
                    setCharacter(found);
                }
                isFirstLoad.current = false;
            }
        }
    }, [characters, id]);

    // Effect for auto-save
    useEffect(() => {
        // Skip null or if it's just the initial load 
        if (!debouncedCharacter) return;

        const currentStored = characters.find(c => c.id === id);
        if (!currentStored) return;

        // specific props comparison
        // We compare the whole object or just relevant fields
        // Since we update whole object structure in updateCharacter, full comparison is fine
        // But we need to be careful about circular refs or functions? CharacterItem is simple data.
        const isDifferent = JSON.stringify(debouncedCharacter) !== JSON.stringify(currentStored);

        if (isDifferent) {
            setStatus('saving');
            updateCharacter(debouncedCharacter.id, {
                ...debouncedCharacter
            });
            setTimeout(() => setStatus(prev => prev === 'saving' ? 'saved' : prev), 800);
        }
    }, [debouncedCharacter, characters, id, updateCharacter]);

    // Handle loading and not found states
    if (!id) return <div className="p-10 text-center text-zinc-500">Initializing...</div>;

    const isReady = characters.length > 0;

    if (!character) {
        if (!isReady) return <div className="p-10 text-center text-zinc-500">Loading characters...</div>;
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-10">
                <User size={64} className="text-zinc-700 mb-4" />
                <h1 className="text-xl font-bold mb-2">Character Not Found</h1>
                <p className="text-zinc-500 mb-6">ID: {id}</p>
                <Link href={backLink}>
                    <Button variant="ghost" className="border border-zinc-700">Go Back</Button>
                </Link>
            </div>
        );
    }

    // ... helper logic for handleUpdate etc is already defined above in previous chunks, 
    // but we need to ensure this block includes isReady definition which was lost in previous edit


    const handleUpdate = (field: keyof CharacterItem, value: any) => {
        setStatus('unsaved');
        setCharacter(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleProfileUpdate = (field: keyof CharacterProfile, value: string | string[]) => {
        setStatus('unsaved');
        setCharacter(prev => {
            if (!prev) return null;
            return {
                ...prev,
                profile: {
                    ...prev.profile!,
                    [field]: value
                }
            };
        });
    };

    const handleArrayUpdate = (field: keyof CharacterProfile, index: number, value: string) => {
        const currentArray = (character.profile?.[field] as string[]) || ['', '', '', ''];
        const newArray = [...currentArray];
        newArray[index] = value;
        handleProfileUpdate(field, newArray);
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        addGroup(newGroupName);
        setNewGroupName('');
        setIsCreatingGroup(false);
    };

    const saveChanges = async () => {
        if (!character) return;
        setIsSaving(true);
        try {
            updateCharacter(character.id, {
                name: character.name,
                description: character.description,
                icon: character.icon,
                profile: character.profile
            });
            // Optional: Show toast
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const handleDelete = () => {
        if (confirm('本当にこのキャラクターを削除しますか？\nこの操作は取り消せません。')) {
            deleteCharacter(character.id);
            router.push(backLink);
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const filename = `${character.id}-${Date.now()}.jpg`;
            try {
                const { error } = await supabase.storage
                    .from('characters')
                    .upload(filename, file, { upsert: true });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('characters')
                    .getPublicUrl(filename);

                handleUpdate('icon', publicUrl);
                updateCharacter(character.id, { icon: publicUrl }); // Immediate save for icon
            } catch (err) {
                console.error('Upload failed', err);
                alert('画像のアップロードに失敗しました');
            }
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploadingGallery(true);
            const file = e.target.files[0];
            const filename = `gallery-${character.id}-${Date.now()}.jpg`;
            try {
                const { error } = await supabase.storage
                    .from('characters')
                    .upload(filename, file, { upsert: true });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('characters')
                    .getPublicUrl(filename);

                const currentImages = character.profile?.appearanceImages || [];
                handleProfileUpdate('appearanceImages', [...currentImages, publicUrl]);

                // Auto-save effectively happens via local state update, but we might want to trigger save?
                // The existing architecture saves on 'Save' button click, but handleIconUpload saves immediately.
                // Let's stick to consistent manual save for profile data, unlike icon which is a direct property.
                // However, for file uploads user usually expects auto-save.
                // Let's trigger updateCharacter immediately for this property to avoid "upload -> forget save -> loose image".
                if (character) {
                    const updatedProfile = {
                        ...character.profile,
                        appearanceImages: [...currentImages, publicUrl]
                    };
                    updateCharacter(character.id, { profile: updatedProfile });
                }

            } catch (err) {
                console.error('Gallery upload failed', err);
                alert('画像のアップロードに失敗しました');
            } finally {
                setIsUploadingGallery(false);
                if (galleryInputRef.current) galleryInputRef.current.value = '';
            }
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        if (confirm('この画像を削除しますか？')) {
            const currentImages = character.profile?.appearanceImages || [];
            const newImages = currentImages.filter((_, i) => i !== index);
            handleProfileUpdate('appearanceImages', newImages);

            // Sync save as well
            if (character) {
                const updatedProfile = {
                    ...character.profile,
                    appearanceImages: newImages
                };
                updateCharacter(character.id, { profile: updatedProfile });
            }
        }
    };

    const p = character.profile || {};

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 pb-32">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={backLink}>
                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white pl-0 hover:bg-transparent">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            一覧へ戻る
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <h1 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">
                            {character.name || '名称未定'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-2 ${status === 'saving' ? 'text-blue-400 bg-blue-400/10' :
                            status === 'unsaved' ? 'text-amber-500 bg-amber-500/10' :
                                'text-zinc-500 bg-zinc-800'
                            }`}>
                            {status === 'saving' && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                            {status === 'unsaved' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                            {status === 'saved' && <div className="w-2 h-2 rounded-full bg-zinc-500" />}

                            {status === 'saving' ? '保存中...' :
                                status === 'unsaved' ? '未保存' :
                                    '保存済み'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="group relative w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden shrink-0">
                        {character.icon ? (
                            <img src={character.icon} alt={character.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                <User size={48} />
                            </div>
                        )}
                        <div
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={24} className="mb-2" />
                            <span className="text-xs font-bold">画像を変更</span>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleIconUpload}
                        />
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">名前</label>
                            <input
                                value={character.name}
                                onChange={(e) => handleUpdate('name', e.target.value)}
                                className="w-full bg-transparent text-3xl md:text-4xl font-black text-white focus:outline-none border-b border-transparent focus:border-zinc-700 placeholder:text-zinc-700 transition-colors"
                                placeholder="キャラクター名"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">キャッチフレーズ (一言紹介)</label>
                            <input
                                value={character.description}
                                onChange={(e) => handleUpdate('description', e.target.value)}
                                className="w-full bg-transparent text-lg text-zinc-300 focus:outline-none border-b border-transparent focus:border-zinc-700 placeholder:text-zinc-600 transition-colors"
                                placeholder="例: 世界を救う運命を背負った少年"
                            />
                        </div>

                        {/* Group Selection */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 pt-4 border-t border-zinc-900 border-dashed">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0">所属グループ:</label>

                            {!isCreatingGroup ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select
                                        value={character.groupIds?.[0] || ''}
                                        onChange={(e) => handleUpdate('groupIds', [e.target.value])}
                                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 w-full sm:w-auto text-ellipsis"
                                    >
                                        <option value="">未設定</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setIsCreatingGroup(true)}
                                        className="text-zinc-500 hover:text-white p-1.5 rounded hover:bg-zinc-800 transition-colors shrink-0"
                                        title="新しいグループを作成"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 w-full sm:w-auto">
                                    <input
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 flex-1 sm:w-40 min-w-0"
                                        placeholder="グループ名"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                                    />
                                    <button
                                        onClick={handleCreateGroup}
                                        className="text-blue-400 hover:text-blue-300 p-1.5 rounded hover:bg-blue-400/10 transition-colors"
                                        title="作成"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingGroup(false)}
                                        className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded hover:bg-zinc-800 transition-colors"
                                        title="キャンセル"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-800 flex gap-6 overflow-x-auto scrollbar-hide sticky top-0 bg-zinc-950 z-40 pt-4 pb-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                ? 'text-white border-white'
                                : 'text-zinc-500 border-transparent hover:text-zinc-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* --- 1. Basic & Personality --- */}
                    {activeTab === 'basic' && (
                        <div className="space-y-12">
                            <SectionCard title="基本プロフィール (Core)">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <FormField label="役割 (Role)" value={p.role} onChange={v => handleProfileUpdate('role', v)} placeholder="主人公 / 敵対者" />
                                    <FormField label="性別" value={p.gender} onChange={v => handleProfileUpdate('gender', v)} />
                                    <FormField label="年齢" value={p.age} onChange={v => handleProfileUpdate('age', v)} />
                                    <FormField label="一人称" value={p.firstPerson} onChange={v => handleProfileUpdate('firstPerson', v)} />
                                    <FormField label="あだ名" value={p.nickname} onChange={v => handleProfileUpdate('nickname', v)} />
                                    <FormField label="口癖" value={p.speechHabit} onChange={v => handleProfileUpdate('speechHabit', v)} />
                                    <FormField label="よくする仕草" value={p.gestures} onChange={v => handleProfileUpdate('gestures', v)} />
                                    <div className="col-span-full">
                                        <FormTextarea label="メモ・備考" value={p.memo} onChange={v => handleProfileUpdate('memo', v)} height="h-20" />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="性格の詳細・深掘り (Personality)">
                                <CauseField label="性格・おもな性質" value={p.personality} cause={p.personalityCause} onChange={v => handleProfileUpdate('personality', v)} onCauseChange={v => handleProfileUpdate('personalityCause', v)} placeholder="明るい、陰気、慎重..." />
                                <CauseField label="魅力 (Charm Point)" value={p.charm} onChange={v => handleProfileUpdate('charm', v)} />
                                <CauseField label="現在の境遇 (Current Situation)" value={p.currentSituation} cause={p.currentSituationCause} onChange={v => handleProfileUpdate('currentSituation', v)} onCauseChange={v => handleProfileUpdate('currentSituationCause', v)} />
                                <CauseField label="生い立ち (Backstory)" value={p.backstory} cause={p.backstoryCause} onChange={v => handleProfileUpdate('backstory', v)} onCauseChange={v => handleProfileUpdate('backstoryCause', v)} height="h-32" />
                                <CauseField label="周囲からの評判" value={p.reputation} cause={p.reputationCause} onChange={v => handleProfileUpdate('reputation', v)} onCauseChange={v => handleProfileUpdate('reputationCause', v)} />
                                <CauseField label="特有の癖" value={p.habit} cause={p.habitCause} onChange={v => handleProfileUpdate('habit', v)} onCauseChange={v => handleProfileUpdate('habitCause', v)} />
                                <CauseField label="絶対に譲れない信念・倫理" value={p.principles} cause={p.principlesCause} onChange={v => handleProfileUpdate('principles', v)} onCauseChange={v => handleProfileUpdate('principlesCause', v)} placeholder="法律より大切なもの..." />
                            </SectionCard>

                            <SectionCard title="内面・葛藤 (Inner Self)">
                                <CauseField label="最も困難だった出来事" value={p.hardestEvent} onChange={v => handleProfileUpdate('hardestEvent', v)} />
                                <FormTextarea label="↑ どう乗り越えたか (Resolution)" value={p.hardestEventResolution} onChange={(v) => handleProfileUpdate('hardestEventResolution', v)} height="h-20" placeholder="その結果どう変わったか..." />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                    <EpisodeField label="長所 (Strengths)" value={p.strengths} cause={p.strengthsCause} episode={p.strengthsEpisode} onChange={v => handleProfileUpdate('strengths', v)} onCauseChange={v => handleProfileUpdate('strengthsCause', v)} onEpisodeChange={v => handleProfileUpdate('strengthsEpisode', v)} />
                                    <EpisodeField label="短所・弱点 (Weaknesses)" value={p.weaknesses} cause={p.weaknessesCause} episode={p.weaknessesEpisode} onChange={v => handleProfileUpdate('weaknesses', v)} onCauseChange={v => handleProfileUpdate('weaknessesCause', v)} onEpisodeChange={v => handleProfileUpdate('weaknessesEpisode', v)} />
                                </div>

                                <CauseField label="コンプレックス" value={p.complex} cause={p.complexCause} onChange={v => handleProfileUpdate('complex', v)} onCauseChange={v => handleProfileUpdate('complexCause', v)} />
                                <EpisodeField label="共感ポイント (Empathy)" value={p.empathyPoint} episode={p.empathyEpisode} onChange={v => handleProfileUpdate('empathyPoint', v)} onEpisodeChange={v => handleProfileUpdate('empathyEpisode', v)} placeholder="読者が共感できる弱さや人間らしさ" />
                                <CauseField label="二面性・矛盾 (Duality)" value={p.duality} cause={p.dualityCause} onChange={v => handleProfileUpdate('duality', v)} onCauseChange={v => handleProfileUpdate('dualityCause', v)} placeholder="優しいが冷酷、臆病だが勇敢など" />
                                <CauseField label="独自の哲学・考え見" value={p.philosophy} cause={p.philosophyCause} onChange={v => handleProfileUpdate('philosophy', v)} onCauseChange={v => handleProfileUpdate('philosophyCause', v)} />
                            </SectionCard>
                        </div>
                    )}

                    {/* --- 2. Story Settings --- */}
                    {activeTab === 'story' && (
                        <div className="space-y-12">
                            <SectionCard title="物語における位置づけ">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="誕生日" value={p.birthDate} onChange={v => handleProfileUpdate('birthDate', v)} />
                                    <FormField label="命日 (Death Date)" value={p.deathDate} onChange={v => handleProfileUpdate('deathDate', v)} />
                                </div>
                                <FormTextarea label="動機・目的 (Motivation)" value={p.motivation} onChange={v => handleProfileUpdate('motivation', v)} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <FormTextarea label="立ちはだかる障害 (Obstacles)" value={p.obstacles} onChange={v => handleProfileUpdate('obstacles', v)} />
                                    <FormTextarea label="解決への行動 (Action)" value={p.obstacleAction} onChange={v => handleProfileUpdate('obstacleAction', v)} />
                                </div>
                                <div className="mt-4">
                                    <FormTextarea label="物語を通した変化・成長 (Growth Arc)" value={p.growthArc} onChange={v => handleProfileUpdate('growthArc', v)} height="h-32" />
                                    <FormTextarea label="過去の事件との関わり" value={p.pastIncidentInvolvement} onChange={v => handleProfileUpdate('pastIncidentInvolvement', v)} />
                                </div>
                            </SectionCard>

                            <SectionCard title="登場と退場">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormTextarea label="初登場シーン" value={p.firstAppearance} onChange={v => handleProfileUpdate('firstAppearance', v)} />
                                    <FormTextarea label="退場シーン (Last Scene)" value={p.exitScene} onChange={v => handleProfileUpdate('exitScene', v)} />
                                </div>
                            </SectionCard>

                            <SectionCard title="物語の進行による変化 (Progression)">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormTextarea label="序盤 (Early Stage)" value={p.stageEarly} onChange={v => handleProfileUpdate('stageEarly', v)} height="h-40" placeholder="状況、心情、立ち位置..." />
                                    <FormTextarea label="中盤 (Middle Stage)" value={p.stageMiddle} onChange={v => handleProfileUpdate('stageMiddle', v)} height="h-40" />
                                    <FormTextarea label="終盤 (Late Stage)" value={p.stageLate} onChange={v => handleProfileUpdate('stageLate', v)} height="h-40" />
                                </div>
                            </SectionCard>

                            <EpisodeCollection title="印象的なセリフ (Lines)" field="representativeLines" values={p.representativeLines} onUpdate={handleArrayUpdate} />
                            <EpisodeCollection title="魅力が伝わるエピソード" field="charmEpisodes" values={p.charmEpisodes} onUpdate={handleArrayUpdate} />
                        </div>
                    )}

                    {/* --- 3. Appearance --- */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-12">
                            <SectionCard title="身体的特徴">
                                <div className="mb-8">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">参考画像・イメージボード</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {/* Upload Button */}
                                        <div
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all flex flex-col items-center justify-center cursor-pointer text-zinc-500 hover:text-zinc-300"
                                        >
                                            <Upload size={24} className="mb-2" />
                                            <span className="text-xs font-bold">{isUploadingGallery ? 'UP中...' : '画像を追加'}</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={galleryInputRef}
                                            accept="image/*"
                                            onChange={handleGalleryUpload}
                                        />

                                        {/* Images */}
                                        {(p.appearanceImages || []).map((img, idx) => (
                                            <div key={idx} className="group relative aspect-square rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                                                <img
                                                    src={img}
                                                    alt={`Gallery ${idx}`}
                                                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                                    onClick={() => setSelectedImage(img)}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveGalleryImage(idx);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <FormTextarea label="外見の第一印象" value={p.firstImpression} onChange={v => handleProfileUpdate('firstImpression', v)} />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                    <FormField label="人種・種族" value={p.race} onChange={v => handleProfileUpdate('race', v)} />
                                    <FormField label="肌の色" value={p.skinColor} onChange={v => handleProfileUpdate('skinColor', v)} />
                                    <FormField label="体型・身長・体重" value={p.body} onChange={v => handleProfileUpdate('body', v)} />
                                    <FormField label="目 (形・色)" value={p.eyes} onChange={v => handleProfileUpdate('eyes', v)} />
                                    <FormField label="髪 (色・髪型)" value={p.hair} onChange={v => handleProfileUpdate('hair', v)} />
                                    <FormField label="チャームポイント" value={p.charmPoint} onChange={v => handleProfileUpdate('charmPoint', v)} />
                                </div>
                                <div className="mt-4">
                                    <FormTextarea label="その他の身体的特徴" value={p.physicalFeatures} onChange={v => handleProfileUpdate('physicalFeatures', v)} />
                                </div>
                            </SectionCard>

                            <SectionCard title="ファッション・アイテム">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormTextarea label="普段着 (Casual)" value={p.fashionCasual} onChange={v => handleProfileUpdate('fashionCasual', v)} height="h-24" />
                                    <FormTextarea label="仕事着・制服 (Work)" value={p.fashionWork} onChange={v => handleProfileUpdate('fashionWork', v)} height="h-24" />
                                    <FormTextarea label="正装・勝負服 (Formal)" value={p.fashionFormal} onChange={v => handleProfileUpdate('fashionFormal', v)} height="h-24" />
                                    <FormTextarea label="お気に入りの服装" value={p.fashionFavorite} onChange={v => handleProfileUpdate('fashionFavorite', v)} height="h-24" />
                                </div>
                                <div className="mt-6">
                                    <FormTextarea label="持ち物・アクセサリー" value={p.accessories} onChange={v => handleProfileUpdate('accessories', v)} />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* --- 4. Social --- */}
                    {activeTab === 'social' && (
                        <div className="space-y-12">
                            <SectionCard title="仕事・社会的な顔">
                                <div className="bg-zinc-900/50 p-4 rounded-lg mb-6 text-sm text-zinc-400">
                                    テーマ：社会的には正しいが、個人の本音とはズレがある領域
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <CauseField label="職業 (Job)" value={p.job} cause={p.jobCause} onChange={v => handleProfileUpdate('job', v)} onCauseChange={v => handleProfileUpdate('jobCause', v)} placeholder="なぜその仕事を選んだか？" />
                                    <CauseField label="役職・地位 (Position)" value={p.position} cause={p.positionCause} onChange={v => handleProfileUpdate('position', v)} onCauseChange={v => handleProfileUpdate('positionCause', v)} />
                                    <CauseField label="キャリアの目標" value={p.careerGoal} cause={p.careerGoalCause} onChange={v => handleProfileUpdate('careerGoal', v)} onCauseChange={v => handleProfileUpdate('careerGoalCause', v)} />
                                    <CauseField label="現在の満足度" value={p.satisfaction} cause={p.satisfactionCause} onChange={v => handleProfileUpdate('satisfaction', v)} onCauseChange={v => handleProfileUpdate('satisfactionCause', v)} />
                                </div>
                                <div className="mt-8 space-y-8">
                                    <CauseField label="仕事内容への意見・思い" value={p.workOpinion} cause={p.workOpinionCause} onChange={v => handleProfileUpdate('workOpinion', v)} onCauseChange={v => handleProfileUpdate('workOpinionCause', v)} />
                                    <CauseField label="職場の人間関係" value={p.workRelationships} cause={p.workRelationshipsCause} onChange={v => handleProfileUpdate('workRelationships', v)} onCauseChange={v => handleProfileUpdate('workRelationshipsCause', v)} />
                                    <CauseField label="勤務地・環境" value={p.workplace} cause={p.workplaceCause} onChange={v => handleProfileUpdate('workplace', v)} onCauseChange={v => handleProfileUpdate('workplaceCause', v)} />
                                    <CauseField label="将来への不安" value={p.futureAnxiety} cause={p.futureAnxietyCause} onChange={v => handleProfileUpdate('futureAnxiety', v)} onCauseChange={v => handleProfileUpdate('futureAnxietyCause', v)} />
                                </div>
                            </SectionCard>

                            <EpisodeCollection title="社会的なエピソード" field="socialEpisodes" values={p.socialEpisodes} onUpdate={handleArrayUpdate} />
                        </div>
                    )}

                    {/* --- 5. Personal/Family --- */}
                    {activeTab === 'personal' && (
                        <div className="space-y-12">
                            <SectionCard title="家族・個人的な関係">
                                <div className="bg-zinc-900/50 p-4 rounded-lg mb-6 text-sm text-zinc-400">
                                    テーマ：家族としては正しいが、社会通念とは違うかもしれない領域
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="家族構成" value={p.familyStructure} onChange={v => handleProfileUpdate('familyStructure', v)} />
                                    <FormField label="家族内での立ち位置" value={p.familyPosition} onChange={v => handleProfileUpdate('familyPosition', v)} />
                                </div>

                                <h4 className="text-zinc-400 font-bold mt-8 mb-4 border-b border-zinc-800 pb-2">恋愛・結婚</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField label="配偶者・パートナーの有無" value={p.marriageStatus} onChange={v => handleProfileUpdate('marriageStatus', v)} />
                                    <FormTextarea label="出会い・馴れ初め" value={p.marriageStory} onChange={v => handleProfileUpdate('marriageStory', v)} height="h-20" />
                                </div>
                                <TriggerField label="好きな人 (Love Interest)" value={p.loveInterest} trigger={p.loveInterestTrigger} onChange={v => handleProfileUpdate('loveInterest', v)} onTriggerChange={v => handleProfileUpdate('loveInterestTrigger', v)} />
                                <FormTextarea label="その相手との関係性" value={p.loveInterestRelationship} onChange={v => handleProfileUpdate('loveInterestRelationship', v)} height="h-20" />
                                <CauseField label="元恋人 (Ex-partners)" value={p.exPartners} cause={p.exPartnersCause} onChange={v => handleProfileUpdate('exPartners', v)} onCauseChange={v => handleProfileUpdate('exPartnersCause', v)} />

                                <h4 className="text-zinc-400 font-bold mt-8 mb-4 border-b border-zinc-800 pb-2">親子・親族関係</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormTextarea label="親との関係" value={p.parentRelationship} onChange={v => handleProfileUpdate('parentRelationship', v)} />
                                    <FormTextarea label="子供との関係 (過去/現在)" value={p.childRelationship} onChange={v => handleProfileUpdate('childRelationship', v)} />
                                    <FormTextarea label="親戚との関係" value={p.relativeRelationship} onChange={v => handleProfileUpdate('relativeRelationship', v)} />
                                    <FormTextarea label="近所付き合い" value={p.neighborRelationships} onChange={v => handleProfileUpdate('neighborRelationships', v)} />
                                </div>

                                <h4 className="text-zinc-400 font-bold mt-8 mb-4 border-b border-zinc-800 pb-2">友人・敵対関係</h4>
                                <TriggerField label="友人 (Friends)" value={p.friends} trigger={p.friendsTrigger} onChange={v => handleProfileUpdate('friends', v)} onTriggerChange={v => handleProfileUpdate('friendsTrigger', v)} placeholder="どんなきっかけで？" />
                                <TriggerField label="友人との活動" value={p.friendActivities} trigger={p.friendActivitiesTrigger} onChange={v => handleProfileUpdate('friendActivities', v)} onTriggerChange={v => handleProfileUpdate('friendActivitiesTrigger', v)} />
                                <TriggerField label="敵対者 (Enemies)" value={p.enemies} trigger={p.enemiesTrigger} onChange={v => handleProfileUpdate('enemies', v)} onTriggerChange={v => handleProfileUpdate('enemiesTrigger', v)} placeholder="なぜ敵対した？" />
                            </SectionCard>

                            <EpisodeCollection title="個人的なエピソード" field="personalEpisodes" values={p.personalEpisodes} onUpdate={handleArrayUpdate} />
                        </div>
                    )}

                    {/* --- 6. Private --- */}
                    {activeTab === 'private' && (
                        <div className="space-y-12">
                            <SectionCard title="プライベート・一人の時間">
                                <div className="bg-zinc-900/50 p-4 rounded-lg mb-6 text-sm text-zinc-400">
                                    テーマ：個人的には正しいが、家族や社会からは理解されないかもしれない領域
                                </div>

                                <ActivityField label="一人の時の活動" value={p.solitaryActivity} trigger={p.solitaryActivityTrigger} feeling={p.solitaryActivityFeeling}
                                    onChange={v => handleProfileUpdate('solitaryActivity', v)}
                                    onTriggerChange={v => handleProfileUpdate('solitaryActivityTrigger', v)}
                                    onFeelingChange={v => handleProfileUpdate('solitaryActivityFeeling', v)}
                                />

                                <ActivityField label="週末の過ごし方" value={p.weekendActivity} trigger={p.weekendActivityTrigger} feeling={p.weekendActivityFeeling}
                                    onChange={v => handleProfileUpdate('weekendActivity', v)}
                                    onTriggerChange={v => handleProfileUpdate('weekendActivityTrigger', v)}
                                    onFeelingChange={v => handleProfileUpdate('weekendActivityFeeling', v)}
                                />

                                <ActivityField label="毎日の習慣 (Daily Habit)" value={p.dailyHabit} trigger={p.dailyHabitTrigger} feeling={p.dailyHabitFeeling}
                                    onChange={v => handleProfileUpdate('dailyHabit', v)}
                                    onTriggerChange={v => handleProfileUpdate('dailyHabitTrigger', v)}
                                    onFeelingChange={v => handleProfileUpdate('dailyHabitFeeling', v)}
                                />

                                <ActivityField label="趣味 (Hobbies)" value={p.hobbies} trigger={p.hobbiesTrigger} feeling={p.hobbiesFeeling}
                                    onChange={v => handleProfileUpdate('hobbies', v)}
                                    onTriggerChange={v => handleProfileUpdate('hobbiesTrigger', v)}
                                    onFeelingChange={v => handleProfileUpdate('hobbiesFeeling', v)}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <TriggerField label="個人的な恐怖" value={p.fears} trigger={p.fearsTrigger} onChange={v => handleProfileUpdate('fears', v)} onTriggerChange={v => handleProfileUpdate('fearsTrigger', v)} />
                                    <TriggerField label="将来の夢・個人的目標" value={p.futureGoal} trigger={p.futureGoalTrigger} onChange={v => handleProfileUpdate('futureGoal', v)} onTriggerChange={v => handleProfileUpdate('futureGoalTrigger', v)} />
                                </div>
                            </SectionCard>
                            <EpisodeCollection title="プライベートエピソード" field="privateEpisodes" values={p.privateEpisodes} onUpdate={handleArrayUpdate} />
                        </div>
                    )}


                    {/* Danger Zone */}
                    <div className="mt-20 pt-10 border-t border-zinc-900">
                        <h3 className="text-zinc-500 font-bold mb-4">Danger Zone</h3>
                        <Button onClick={handleDelete} variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-950/20 px-4 border border-red-900/30 rounded-xl">
                            <Trash2 size={16} className="mr-2" />
                            このキャラクターを削除
                        </Button>
                    </div>
                </div> {/* End Content */}
            </div>
            {/* Lightbox Modal */}
            {
                selectedImage && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )
            }
        </div >
    );
};
