'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden font-sans flex flex-col items-center justify-center relative">
            
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
            
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none"></div>

            <div className="absolute top-0 left-0 right-0 h-12 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-between px-6 z-20">
                <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">System_v2.0.4 // Stable</span>
                </div>
                <div className="flex items-center space-x-8">
                     <div className="hidden md:flex font-mono text-[9px] text-zinc-600 space-x-8 uppercase tracking-widest opacity-50">
                        <span>Mem: 42%</span>
                        <span>Net: Active</span>
                        <span>Gpu: Ready</span>
                     </div>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-16 scale-100 md:scale-110">
                
                <div className="flex flex-col items-center space-y-6">
                    <div className="flex items-center space-x-2">
                        {['C','L','A','R','I','T','Y'].map((l, i) => (
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
                    
                    <div className="flex items-center space-x-6 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
                         <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                         <span className="font-mono text-xs uppercase tracking-[0.4em] text-zinc-500 font-bold">
                            Agentic Video Interface
                         </span>
                         <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                    </div>
                </div>

                <Link href="/generate">
                    <button className="group relative w-72 h-20 bg-zinc-100 hover:bg-white active:bg-zinc-300 border-b-[8px] border-r-[8px] border-black rounded-sm flex items-center justify-between px-8 transition-all active:border-b-0 active:border-r-0 active:translate-y-[8px] active:translate-x-[8px]">
                        <div className="flex flex-col items-start space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-purple-600 transition-colors">Initialize</span>
                            <span className="text-xl font-black text-black tracking-tight group-hover:scale-105 transition-transform origin-left">LAUNCH STUDIO</span>
                        </div>
                        <div className="w-10 h-10 bg-black flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                             <ArrowRight className="w-5 h-5 text-white" strokeWidth={3} />
                        </div>
                    </button>
                </Link>

            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center space-x-px">
                 <div className="h-full w-48 border-r border-zinc-900 flex flex-col items-center justify-center space-y-2 group hover:bg-zinc-900/50 transition-colors">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Core Engine</span>
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-3 bg-purple-600" />
                        <div className="w-1.5 h-3 bg-purple-600/50" />
                        <div className="w-1.5 h-3 bg-purple-600/20" />
                    </div>
                 </div>
                 
                 <div className="h-full w-48 border-r border-zinc-900 flex flex-col items-center justify-center space-y-2 group hover:bg-zinc-900/50 transition-colors">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Render: GPU</span>
                    <div className="font-mono text-xs text-zinc-400 font-bold">READY</div>
                 </div>

                 <div className="h-full w-48 border-r border-zinc-900 flex flex-col items-center justify-center space-y-2 group hover:bg-zinc-900/50 transition-colors">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Connection</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
                 </div>
            </div>

            <div className="absolute top-12 left-6 w-px h-12 bg-zinc-800" />
            <div className="absolute top-12 right-6 w-px h-12 bg-zinc-800" />
            <div className="absolute bottom-24 left-6 w-px h-12 bg-zinc-800" />
            <div className="absolute bottom-24 right-6 w-px h-12 bg-zinc-800" />

            <div className="absolute top-1/4 right-12 hidden md:block opacity-20 font-mono text-[9px] text-zinc-500 text-right space-y-1">
                <div>SYS_CHECK_OK</div>
                <div>BUFFER_LOAD: 0%</div>
                <div>INIT_SEQ_READY</div>
            </div>

        </div>
    );
}
