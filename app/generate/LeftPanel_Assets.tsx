import React, { useRef } from 'react';
import { Asset } from './types';

interface LeftPanel_AssetsProps {
    globalAssets: Asset[];
    onUploadAsset: (file: File, type: 'image' | 'audio') => void;
}

const STOCK_ASSETS: Asset[] = [
    { id: 'stock-charts-1', type: 'image', name: 'Analytics', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-charts-2', type: 'image', name: 'Dashboard', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-strat-1', type: 'image', name: 'Strategy', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-1', type: 'image', name: 'Nature', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-2', type: 'image', name: 'Interior', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-4', type: 'image', name: 'City', url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-5', type: 'image', name: 'Abstract', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80' },
    { id: 'stock-6', type: 'image', name: 'People', url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80' },
];

export const LeftPanel_Assets: React.FC<LeftPanel_AssetsProps> = ({
    globalAssets,
    onUploadAsset
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUploadAsset(e.target.files[0], 'image');
        }
    };

    const handleDragStartAsset = (e: React.DragEvent, asset: Asset) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'asset', payload: asset }));
    };

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Media Library
                </h3>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors border border-zinc-700/50"
                >
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {globalAssets.length === 0 ? (
                    <div className="col-span-2 py-8 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center opacity-40">
                         <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">No Uploads</span>
                    </div>
                ) : (
                    globalAssets.map((asset) => (
                        <div 
                            key={asset.id}
                            className="group relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-all"
                            draggable
                            onDragStart={(e) => handleDragStartAsset(e, asset)}
                        >
                            {asset.type === 'image' && (
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-[10px] text-zinc-300 truncate">{asset.name}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
             <div className="pt-6 border-t border-zinc-800/50">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                    Stock Library
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {STOCK_ASSETS.map((asset) => (
                        <div 
                            key={asset.id} 
                            className="group relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-all"
                            draggable
                            onDragStart={(e) => handleDragStartAsset(e, asset)}
                        >
                            <img src={asset.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                                <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">{asset.name}</span>
                                <div className="p-1 rounded bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
