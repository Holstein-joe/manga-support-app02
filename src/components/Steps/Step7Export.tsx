import React, { useRef } from 'react';
import { Project, CharacterItem } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Download, FileText, User } from 'lucide-react';
import { useCharacters } from '@/hooks/useCharacters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Step7ExportProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
}

export const Step7Export: React.FC<Step7ExportProps> = ({ project }) => {
    const { characters: globalCharacters } = useCharacters();
    const printRef = useRef<HTMLDivElement>(null);

    // Resolve characters
    const linkedIds = project.linkedCharacterIds || [];
    const linkedCharacters = globalCharacters.filter(c => linkedIds.includes(c.id));
    const legacyCharacters = project.characters || [];
    const availableCharacters = [...linkedCharacters, ...legacyCharacters];

    const handlePDFExport = async () => {
        if (!printRef.current) return;

        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${project.title || 'project'}_proposal.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('PDFの出力に失敗しました。');
        }
    };

    // Correctly get all scenes from structureBoard
    const allScenes = (project.structureBoard || []).flatMap(group =>
        (group.scenes || []).map(scene => ({
            ...scene,
            groupTitle: group.content
        }))
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-100 dark:text-zinc-900">5</span>
                    完成企画書の出力
                </h2>
                <Button size="lg" onClick={handlePDFExport} className="px-6 font-bold">
                    <Download className="mr-2 h-4 w-4" />
                    企画書をPDF出力
                </Button>
            </div>

            <div className="bg-zinc-100 p-8 rounded-xl overflow-auto dark:bg-zinc-900/50">
                <div
                    ref={printRef}
                    className="bg-white text-zinc-900 p-[20mm] mx-auto shadow-lg max-w-[210mm] min-h-[297mm] box-border"
                    style={{ fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif' }}
                >
                    {/* Header */}
                    <div className="border-b-2 border-zinc-900 pb-6 mb-8 text-center">
                        <p className="text-sm text-zinc-500 mb-2">漫画制作企画書</p>
                        <h1 className="text-3xl font-bold mb-4">{project.title || '（タイトル未定）'}</h1>
                        <p className="text-zinc-600 whitespace-pre-wrap">{project.description || ''}</p>
                    </div>

                    {/* Characters */}
                    {availableCharacters.length > 0 && (
                        <section className="mb-8">
                            <h3 className="text-lg font-bold border-l-4 border-zinc-900 pl-3 mb-4 bg-zinc-50 py-1">キャラクター設定</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {availableCharacters.map(char => (
                                    <div key={char.id} className="flex gap-4 p-2 border border-zinc-100 rounded">
                                        <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0">
                                            {char.icon ? (
                                                <img src={char.icon} alt={char.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                    <User size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{char.name}</div>
                                            <div className="text-[10px] text-zinc-500 line-clamp-2">{char.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Story Structure */}
                    <section className="mb-8 keep-together">
                        <h3 className="text-lg font-bold border-l-4 border-zinc-900 pl-3 mb-4 bg-zinc-50 py-1">三幕構成（ビートシート）</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 text-sm">
                                <div className="col-span-3 font-bold text-zinc-400">状況設定 (Act 1)</div>
                                <div className="col-span-9">ターニングポイント 1: {project.structureBeats?.tp1 || '-'}</div>
                            </div>
                            <div className="grid grid-cols-12 gap-4 text-sm">
                                <div className="col-span-3 font-bold text-zinc-400">葛藤・展開 (Act 2)</div>
                                <div className="col-span-9 space-y-2">
                                    <div>中間点 (Midpoint): {project.structureBeats?.midpoint || '-'}</div>
                                    <div>ターニングポイント 2: {project.structureBeats?.tp2 || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Plot */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold border-l-4 border-zinc-900 pl-3 mb-4 bg-zinc-50 py-1">プロット（起承転結）</h3>
                        <div className="space-y-4">
                            {[
                                { label: '【起】', content: project.plot?.intro },
                                { label: '【承】', content: project.plot?.development },
                                { label: '【転】', content: project.plot?.twist },
                                { label: '【結】', content: project.plot?.conclusion },
                            ].map((part, i) => (
                                <div key={i} className="flex gap-4 text-sm">
                                    <div className="font-bold text-zinc-500 w-12 shrink-0">{part.label}</div>
                                    <div className="whitespace-pre-wrap">{part.content || '-'}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Scenes with Sketches */}
                    <section>
                        <h3 className="text-lg font-bold border-l-4 border-zinc-900 pl-3 mb-4 bg-zinc-50 py-1">ネーム構成（下書き）</h3>
                        <div className="space-y-8">
                            {allScenes.map((scene: any, i: number) => (
                                <div key={scene.id} className="grid grid-cols-12 gap-6 border-b border-zinc-100 pb-6 break-inside-avoid">
                                    <div className="col-span-1 font-bold text-zinc-300 text-center">{i + 1}</div>
                                    <div className="col-span-4">
                                        {scene.drawing ? (
                                            <div className="bg-zinc-100 rounded border border-zinc-200 aspect-video overflow-hidden">
                                                <img src={scene.drawing} alt={`Scene ${i + 1}`} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="bg-zinc-50 rounded border border-dashed border-zinc-200 aspect-video flex items-center justify-center">
                                                <span className="text-[10px] text-zinc-400">下書きなし</span>
                                            </div>
                                        )}
                                        <div className="mt-1 text-[9px] text-zinc-400 font-bold uppercase truncate">{scene.groupTitle}</div>
                                    </div>
                                    <div className="col-span-7 space-y-3">
                                        {(scene.dialogues || []).map((dialogue: any) => {
                                            const char = project.characters?.find(c => c.id === dialogue.characterId);
                                            return (
                                                <div key={dialogue.id} className="text-sm flex gap-3">
                                                    {char?.icon && (
                                                        <div className="w-8 h-8 rounded-full border border-zinc-100 overflow-hidden shrink-0 mt-1">
                                                            <img src={char.icon} alt={char.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="font-bold text-xs text-zinc-400 mb-0.5">{char?.name || dialogue.character || 'キャラ未設定'}</div>
                                                        <div className="leading-relaxed">{dialogue.text || '（セリフなし）'}</div>
                                                        {dialogue.memo && <div className="text-[10px] text-zinc-400 italic mt-0.5">※{dialogue.memo}</div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!scene.dialogues || scene.dialogues.length === 0) && (
                                            <p className="text-zinc-300 text-xs italic">セリフ設定なし</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {allScenes.length === 0 && (
                                <p className="text-zinc-400 text-sm">ネーム構成はまだ作成されていません。ステップ4を確認してください。</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
