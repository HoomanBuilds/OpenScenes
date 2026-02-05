import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, AlertCircle, Film, ChevronDown, Trash2, Download, Square } from 'lucide-react';
import { RenderJob } from './hooks/useRenderJobs';

interface RenderStatusDropdownProps {
    jobs: RenderJob[];
    onClear: () => void;
    onSelect: (job: RenderJob) => void;
    onCancel?: (job: RenderJob) => void;
}

export const RenderStatusDropdown: React.FC<RenderStatusDropdownProps> = ({ jobs, onClear, onSelect, onCancel }) => {
    const [isOpen, setIsOpen] = useState(false);

    const activeJob = jobs.find(j => j.status === 'queued' || j.status === 'processing');
    const completedCount = jobs.filter(j => j.status === 'completed').length;
    
    // Status Icon Helper
    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'completed': return <Check size={12} className="text-green-500" />;
            case 'failed': return <AlertCircle size={12} className="text-red-500" />;
            case 'processing': return <Loader2 size={12} className="text-purple-500 animate-spin" />;
            case 'cancelling': return <Loader2 size={12} className="text-orange-500 animate-spin" />;
            case 'cancelled': return <Trash2 size={12} className="text-red-500" />;
            case 'queued': return <Loader2 size={12} className="text-zinc-500 animate-spin" />;
            default: return <Film size={12} className="text-zinc-500" />;
        }
    };

    return (
        <div className="relative z-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-3 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-all group ${
                    activeJob 
                    ? 'bg-zinc-900 border-purple-500/50 text-purple-400' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                }`}
            >
                {activeJob ? (
                    <>
                        <Loader2 size={14} className="animate-spin text-purple-500" />
                        <span>{activeJob.status === 'cancelling' ? 'Cancelling...' : 'Rendering...'}</span>
                    </>
                ) : (
                    <>
                        <Film size={14} className={completedCount > 0 ? "text-green-500" : "text-zinc-500"} />
                        <span>{jobs.length > 0 ? `${jobs.length} Versions` : 'Renders'}</span>
                    </>
                )}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40 bg-transparent" 
                            onClick={() => setIsOpen(false)} 
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute top-full right-0 mt-2 w-72 bg-zinc-950 border-2 border-zinc-800 shadow-2xl z-50 flex flex-col max-h-[400px]"
                        >
                            <div className="p-3 border-b-2 border-zinc-900 bg-[#09090b]">
                                <span className="text-[10px] uppercase font-black text-zinc-500">Render History</span>
                            </div>

                            <div className="overflow-y-auto p-1 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
                                {jobs.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-600 text-[10px] font-mono">
                                        No renders yet.
                                    </div>
                                ) : (
                                    jobs.map((job, index) => {
                                        const versionNumber = jobs.length - index;
                                        const isCancellable = job.status === 'queued' || job.status === 'processing';
                                        
                                        return (
                                            <button
                                                key={job.jobId} 
                                                onClick={() => {
                                                    onSelect(job);
                                                    setIsOpen(false);
                                                }}
                                                className="w-full text-left bg-zinc-900/30 border border-transparent hover:border-zinc-700 hover:bg-zinc-900 p-2 flex flex-col gap-1 group transition-all"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-[10px] font-bold text-zinc-300 line-clamp-1 max-w-[150px]">
                                                        {job.name}
                                                    </span>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {isCancellable && job.status !== 'cancelling' && (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onCancel?.(job);
                                                                }}
                                                                className="w-4 h-4 flex items-center justify-center bg-red-900/20 border border-red-900/50 hover:bg-red-500 hover:border-red-500 text-red-500 hover:text-white rounded-[2px] transition-all cursor-pointer"
                                                                title="Cancel Render"
                                                            >
                                                                <Square size={6} fill="currentColor" />
                                                            </div>
                                                        )}
                                                        <StatusIcon status={job.status} />
                                                        <span className={`text-[9px] uppercase font-black tracking-wider px-1 rounded-[2px] ${
                                                            job.status === 'completed' ? 'bg-green-900/30 text-green-500' :
                                                            job.status === 'failed' ? 'bg-red-900/30 text-red-500' :
                                                            job.status === 'cancelling' ? 'bg-orange-900/30 text-orange-500' :
                                                            job.status === 'cancelled' ? 'bg-red-900/10 text-red-700 line-through decoration-2' :
                                                            'bg-zinc-800 text-zinc-600'
                                                        }`}>
                                                            {job.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <span className="text-[9px] text-zinc-600 font-mono group-hover:text-zinc-500 transition-colors">
                                                    #{versionNumber}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
