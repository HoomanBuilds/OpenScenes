import React, { useRef } from 'react';
import { Asset } from './types';
import * as LucideIcons from 'lucide-react';

interface LeftPanel_AssetsProps {
    globalAssets: Asset[];
    onUploadAsset: (file: File, type: 'image' | 'audio' | 'video') => void;
}

const STOCK_ASSETS: Asset[] = [
    { id: 'stock-charts-1', type: 'image', name: 'Analytics', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-global', type: 'image', name: 'Global Hub', url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-rocket', type: 'image', name: 'Growth', url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-strat-1', type: 'image', name: 'Strategy', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
    
    { id: 'stock-vid-tech', type: 'video', name: 'Network Loop', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 'stock-vid-abstract', type: 'video', name: 'Bear Intro', url: 'https://www.w3schools.com/html/movie.mp4' },
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
        <div className="space-y-8 mt-6">
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <LucideIcons.UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                    User Uploads
                </h3>
                <div className="flex items-center space-x-2">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-none transition-all text-[9px] font-black text-zinc-300 uppercase tracking-wider group"
                    >
                        <LucideIcons.Plus className="w-3 h-3 group-hover:text-purple-400" />
                        <span>Add File</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {globalAssets.length === 0 ? (
                     <div className="col-span-2 py-8 bg-zinc-950 border-2 border-dashed border-zinc-900 flex flex-col items-center justify-center opacity-50">
                         <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                             <LucideIcons.Tv className="w-5 h-5 text-zinc-700" />
                         </div>
                         <span className="text-[9px] uppercase font-black tracking-widest text-zinc-700">Empty Slot</span>
                    </div>
                ) : (
                    globalAssets.map((asset) => (
                        <div 
                            key={asset.id}
                            className="group relative aspect-video bg-zinc-950 border-2 border-zinc-900 hover:border-purple-600 transition-colors cursor-grab active:cursor-grabbing"
                            draggable
                            onDragStart={(e) => handleDragStartAsset(e, asset)}
                        >
                            {asset.type === 'image' ? (
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                    <LucideIcons.PlayCircle className="w-8 h-8 text-zinc-700 group-hover:text-purple-500 transition-colors" />
                                </div>
                            )}
                            
                            <div className="absolute top-0 left-0 bg-black/80 px-1.5 py-0.5 border-b border-r border-zinc-800">
                                <span className="text-[8px] font-mono text-zinc-500">{asset.type.toUpperCase()}</span>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/90 border-t border-zinc-900">
                                <p className="text-[9px] text-zinc-400 truncate font-mono uppercase">{asset.name}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
             <div className="pt-6 border-t-2 border-zinc-900/50">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LucideIcons.Library className="w-3.5 h-3.5 text-zinc-600" />
                    Asset Library
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {STOCK_ASSETS.map((asset) => (
                        <div 
                            key={asset.id} 
                            className="group relative aspect-video bg-zinc-950 border-2 border-zinc-900 hover:border-zinc-500 transition-colors cursor-grab active:cursor-grabbing"
                            draggable
                            onDragStart={(e) => handleDragStartAsset(e, asset)}
                        >
                            {asset.type === 'image' ? (
                                <img src={asset.url} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 grayscale group-hover:grayscale-0 transition-all duration-300" />
                            ) : (
                                <div className="w-full h-full relative">
                                    <video src={asset.url} muted className="w-full h-full object-cover opacity-30 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <LucideIcons.Play className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            )}
                            
                             {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-2 h-2 border-l border-b border-zinc-800 bg-black z-10"></div>

                            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/80 border-t border-zinc-900 flex items-end justify-between">
                                <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-tighter truncate max-w-[80px]">{asset.name}</span>
                                <div className="w-3 h-3 bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-500 transition-colors">
                                    <LucideIcons.Plus className="w-2 h-2 text-zinc-600 group-hover:text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
