"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCharacters } from '@/hooks/useCharacters';
import { Button } from '@/components/ui/Button';
import { Plus, User, ArrowLeft, Search, Filter, Hash, Tag, Trash2, Edit2, ChevronDown, X, Upload, Save, Ban, Check } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import { supabase } from '@/lib/supabase';

// --- Utility for Cropping ---
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    fileName: string
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg');
    });
}

export default function GlobalCharacterPage() {
    const { characters, groups, addCharacter, updateCharacter, deleteCharacter, addGroup } = useCharacters();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // --- Image Upload & Crop State ---
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [targetCharId, setTargetCharId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Group Assignment State ---
    const [openGroupMenuId, setOpenGroupMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const filteredCharacters = characters.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = selectedGroupId ? c.groupIds?.includes(selectedGroupId) : true;
        return matchesSearch && matchesGroup;
    });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenGroupMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCreate = () => {
        addCharacter({
            name: '新しいキャラクター',
            description: '',
            groupIds: selectedGroupId ? [selectedGroupId] : []
        });
    };

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            addGroup(newGroupName.trim());
            setNewGroupName('');
            setIsCreatingGroup(false);
        }
    };

    // --- Group Toggle Logic ---
    const toggleGroup = (charId: string, groupId: string) => {
        const char = characters.find(c => c.id === charId);
        if (!char) return;

        const currentGroups = char.groupIds || [];
        let newGroups;
        if (currentGroups.includes(groupId)) {
            newGroups = currentGroups.filter(id => id !== groupId);
        } else {
            newGroups = [...currentGroups, groupId];
        }
        updateCharacter(charId, { groupIds: newGroups });
    };

    // --- Image Handling Functions ---
    const handleIconClick = (charId: string) => {
        setTargetCharId(charId);
        fileInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setSelectedImage(imageDataUrl as string);
            setIsCropModalOpen(true);
            // Reset input value so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result));
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCroppedImage = async () => {
        if (!selectedImage || !croppedAreaPixels || !targetCharId) return;

        try {
            setUploading(true);
            const blob = await getCroppedImg(selectedImage, croppedAreaPixels, 'new-icon.jpg');

            // Upload to Supabase
            const filename = `${targetCharId}-${Date.now()}.jpg`;
            const { data, error } = await supabase.storage
                .from('characters')
                .upload(filename, blob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('characters')
                .getPublicUrl(filename);

            // Update Character
            updateCharacter(targetCharId, { icon: publicUrl });

            // Close Modal
            setIsCropModalOpen(false);
            setSelectedImage(null);
            setTargetCharId(null);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('画像のアップロードに失敗しました。');
        } finally {
            setUploading(false);
        }
    };

    const handleCancelCrop = () => {
        setIsCropModalOpen(false);
        setSelectedImage(null);
        setTargetCharId(null);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/" className="flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            ダッシュボードへ戻る
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">グローバルキャラクター名簿</h1>
                        <p className="text-zinc-500 text-sm mt-1">すべての作品で使用できる共通のキャラクターデータベースです。</p>
                    </div>
                    <Button onClick={handleCreate} className="bg-white text-black hover:bg-zinc-200 font-bold h-12 px-6 rounded-xl">
                        <Plus className="w-5 h-5 mr-2" />
                        新キャラを登録
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-900">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="キャラクターを検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 h-11 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setSelectedGroupId(null)}
                            className={`px-4 h-11 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${!selectedGroupId ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                        >
                            すべて
                        </button>
                        {groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroupId(group.id)}
                                className={`px-4 h-11 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedGroupId === group.id ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                            >
                                {group.name}
                            </button>
                        ))}

                        {isCreatingGroup ? (
                            <form onSubmit={handleCreateGroup} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="グループ名..."
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 h-11 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-500 w-32"
                                />
                                <Button type="submit" size="sm" className="bg-white text-black h-11 px-4 rounded-xl font-bold text-xs">作成</Button>
                                <button type="button" onClick={() => setIsCreatingGroup(false)} className="text-zinc-500 hover:text-white px-2">
                                    <X size={16} />
                                </button>
                            </form>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreatingGroup(true)}
                                className="text-zinc-400 hover:text-white h-11 px-4 border border-zinc-800 hover:border-zinc-700 rounded-xl"
                            >
                                <Plus size={14} className="mr-2" /> グループを新規作成
                            </Button>
                        )}
                    </div>
                </div>

                {/* Character Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCharacters.map(char => (
                        <div key={char.id} className="group bg-[#1a1a1a] rounded-2xl border border-zinc-900 p-5 hover:border-zinc-700 transition-all hover:shadow-2xl">
                            <div className="flex gap-4 items-start">
                                <div
                                    onClick={() => handleIconClick(char.id)}
                                    className="w-16 h-16 rounded-full bg-black border border-zinc-800 overflow-hidden shrink-0 cursor-pointer relative group/icon"
                                >
                                    {char.icon ? (
                                        <img src={char.icon} alt={char.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-800 group-hover/icon:text-zinc-600 transition-colors">
                                            <User size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload size={16} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            value={char.name}
                                            onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                                            className="bg-zinc-900/50 hover:bg-zinc-900 px-2 py-1 rounded font-bold text-lg focus:outline-none w-full border border-transparent focus:border-zinc-700 transition-all text-white"
                                        />
                                        <button
                                            onClick={() => deleteCharacter(char.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1 relative">
                                        {char.groupIds?.map(gid => {
                                            const g = groups.find(gr => gr.id === gid);
                                            return g ? (
                                                <button
                                                    key={gid}
                                                    onClick={() => toggleGroup(char.id, gid)}
                                                    className="group/tag relative text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/30 transition-all"
                                                >
                                                    {g.name}
                                                    <span className="sr-only">削除</span>
                                                </button>
                                            ) : null;
                                        })}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenGroupMenuId(openGroupMenuId === char.id ? null : char.id);
                                                }}
                                                className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 whitespace-nowrap"
                                            >
                                                + グループ割り当て
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openGroupMenuId === char.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1a] border border-zinc-800 rounded-xl shadow-xl z-10 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100"
                                                >
                                                    {groups.length === 0 ? (
                                                        <div className="p-3 text-center text-zinc-500 text-xs">
                                                            利用可能なグループがありません
                                                        </div>
                                                    ) : (
                                                        groups.map(group => {
                                                            const isAssigned = char.groupIds?.includes(group.id);
                                                            return (
                                                                <button
                                                                    key={group.id}
                                                                    onClick={() => toggleGroup(char.id, group.id)}
                                                                    className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-colors ${isAssigned
                                                                            ? 'bg-zinc-900 text-white font-bold'
                                                                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                                                        }`}
                                                                >
                                                                    <span>{group.name}</span>
                                                                    {isAssigned && <Check size={12} />}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <textarea
                                value={char.description}
                                onChange={(e) => updateCharacter(char.id, { description: e.target.value })}
                                placeholder="特徴、役割、設定詳細..."
                                className="w-full bg-zinc-950 border border-zinc-900 focus:border-zinc-700 focus:bg-zinc-900 rounded-xl p-3 text-xs text-zinc-300 mt-4 h-24 resize-none focus:outline-none transition-all placeholder:text-zinc-700"
                            />
                        </div>
                    ))}

                    {filteredCharacters.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 select-none">
                            <User size={64} className="mb-4" />
                            <p className="font-bold">該当するキャラクターがいません</p>
                        </div>
                    )}
                </div>

                {/* Crop Modal */}
                {isCropModalOpen && selectedImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold">画像を編集</h3>
                                <button onClick={handleCancelCrop} className="text-zinc-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="relative w-full h-64 bg-black">
                                <Cropper
                                    image={selectedImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                />
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500">Zoom</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleCancelCrop} variant="ghost" className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800">
                                        キャンセル
                                    </Button>
                                    <Button
                                        onClick={handleSaveCroppedImage}
                                        disabled={uploading}
                                        className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold"
                                    >
                                        {uploading ? '保存中...' : '保存'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
