import React, { useRef } from 'react';
import { Asset } from './types';
import * as LucideIcons from 'lucide-react';

interface LeftPanel_AssetsProps {
    globalAssets: Asset[];
    onUploadAsset: (file: File, type: 'image' | 'audio' | 'video') => void;
}

const STOCK_ASSETS: Asset[] = [
    // --- IMAGES ---
    { id: 'stock-charts-1', type: 'image', name: 'Analytics', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-global', type: 'image', name: 'Global Hub', url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-rocket', type: 'image', name: 'Growth', url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-strat-1', type: 'image', name: 'Strategy', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
    
    // --- VIDEOS ---
    { id: 'stock-vid-tech', type: 'video', name: 'Network Loop', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 'stock-vid-abstract', type: 'video', name: 'Bear Intro', url: 'https://www.w3schools.com/html/movie.mp4' },
    { id: 'stock-vid-nature', type: 'video', name: 'Water Flow', url: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-body-of-water-broken-by-some-rocks-4275-large.mp4' },
    { id: 'stock-vid-cloud', type: 'video', name: 'Clouds', url: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-slowly-moving-across-the-blue-sky-4643-large.mp4' },
];

export const LeftPanel_Assets: React.FC<LeftPanel_AssetsProps> = ({
    globalAssets,
    onUploadAsset
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let type: 'image' | 'video' | 'audio' = 'image';
        if (file.type.startsWith('video/')) type = 'video';
        if (file.type.startsWith('audio/')) type = 'audio';

        onUploadAsset(file, type);
    };

    const handleDragStartAsset = (e: React.DragEvent, asset: Asset) => {
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('application/json', JSON.stringify({ 
            type: 'asset', 
            assetType: asset.type,
            url: asset.url,
            name: asset.name 
        }));
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <LucideIcons.UploadCloud className="w-3.5 h-3.5 text-purple-500" />
                    My Uploads
                </h3>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700/50 transition-all text-[10px] font-bold text-zinc-300"
                >
                    <LucideIcons.Plus className="w-3 h-3" />
                    <span>UPLOAD</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {globalAssets.length === 0 ? (
                    <div className="col-span-2 py-8 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center opacity-30">
                         <LucideIcons.ImagePlus className="w-6 h-6 text-zinc-600 mb-2" />
                         <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">No Content</span>
                    </div>
                ) : (
                    globalAssets.map((asset) => (
                        <div 
                            key={asset.id}
                            className="group relative aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/50 cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-all"
                            draggable
                            onDragStart={(e) => handleDragStartAsset(e, asset)}
                        >
                            {asset.type === 'image' ? (
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                    <LucideIcons.PlayCircle className="w-8 h-8 text-purple-500 opacity-50" />
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black to-transparent">
                                <p className="text-[9px] text-zinc-400 truncate font-medium">{asset.name}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
             <div className="pt-6 border-t border-zinc-800/50">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LucideIcons.Library className="w-3.5 h-3.5 text-yellow-500" />
                    Library Stacks
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {STOCK_ASSETS.map((asset) => (
                        <div 
                            key={asset.id} 
                            className="group relative aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/50 cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-all"
                            draggable
                            onDragStart={(e) => handleDragStartAsset(e, asset)}
                        >
                            {asset.type === 'image' ? (
                                <img src={asset.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full relative">
                                    <video src={asset.url} muted className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <LucideIcons.Play className="w-6 h-6 text-white/30 group-hover:text-white/60 transition-colors" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black to-transparent flex items-end justify-between">
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{asset.name}</span>
                                <div className="p-1 rounded bg-purple-600/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <LucideIcons.Move className="w-3 h-3 text-purple-400" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
