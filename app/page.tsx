'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LoginModal } from './components/LoginModal';

const GeminiIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#gemini-gradient)" />
        <defs>
            <linearGradient id="gemini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4E8AFF" />
                <stop offset="1" stopColor="#9333EA" />
            </linearGradient>
        </defs>
    </svg>
);

export default function LandingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden font-sans flex flex-col items-center justify-center relative">
            
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
            
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none"></div>

            <div className="absolute top-0 left-0 right-0 h-16 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-8 z-20">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">System Ready</span>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-16 scale-100 md:scale-110">
                
                <div className="flex flex-col items-center space-y-6">
                    {/* Gemini Logo & Text */}
                    <div className="flex flex-col items-center space-y-2 mb-4">
                        <span className="text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase">Built with</span>
                        <div className="flex items-center space-x-3 relative group cursor-default">
                             <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                             <GeminiIcon className="w-10 h-10 drop-shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-custom-pulse" />
                             <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg tracking-tight">
                                GEMINI 3
                             </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {['O','P','E','N','S','C',"E" , "N" , "E" , "S"].map((l, i) => (
                            <div key={i} 
                                className="w-16 h-24 bg-zinc-950 border-b-[6px] border-r-[6px] border-black flex items-center justify-center relative group hover:-translate-y-2 transition-transform duration-300 cursor-default"
                                style={{ 
                                    backgroundColor: i === 0 ? '#9333ea' : '#09090b', 
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <span className={`text-5xl font-black uppercase font-mono ${i === 0 ? 'text-white' : 'text-zinc-700 group-hover:text-zinc-200 transition-colors'}`}>
                                    {l}
                                </span>
                                <div className="absolute top-1 left-1 w-2 h-2 bg-white/10 rounded-full" />
                                <div className="absolute bottom-1 right-1 w-1 h-1 bg-zinc-800" />
                            </div>
                        ))}
                    </div>
                    
                     <div className="flex flex-col items-center space-y-4 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
                         <div className="flex items-center space-x-6">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                                <span className="font-mono text-xs uppercase tracking-[0.4em] text-zinc-500 font-bold">
                                    Agentic Video Interface
                                </span>
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                         </div>
                         
                         <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md">
                            <GeminiIcon className="w-3 h-3" />
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Powered by Gemini 1.5 Pro</span>
                         </div>
                     </div>
                </div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="group relative w-72 h-20 bg-zinc-100 hover:bg-white active:bg-zinc-300 border-b-[8px] border-r-[8px] border-black rounded-sm flex items-center justify-between px-8 transition-all active:border-b-0 active:border-r-0 active:translate-y-[8px] active:translate-x-[8px]">
                    <div className="flex flex-col items-start space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-purple-600 transition-colors">Initialize</span>
                        <span className="text-xl font-black text-black tracking-tight group-hover:scale-105 transition-transform origin-left">LAUNCH STUDIO</span>
                    </div>
                    <div className="w-10 h-10 bg-black flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                         <ArrowRight className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                </button>

            </div>


            <div className="absolute top-12 left-6 w-px h-12 bg-zinc-800" />
            <div className="absolute top-12 right-6 w-px h-12 bg-zinc-800" />
            <div className="absolute bottom-24 left-6 w-px h-12 bg-zinc-800" />
            <div className="absolute bottom-24 right-6 w-px h-12 bg-zinc-800" />


            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        </div>
    );
}
