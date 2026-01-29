'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="h-screen bg-[#09090b] text-white selection:bg-purple-500/30 overflow-hidden font-sans flex flex-col items-center justify-center relative">
            
            {/* Dark Noise Texture Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="relative z-10 flex flex-col items-center space-y-12 scale-110">
                
                {/* 1. CLARITY LOGO BLOCK */}
                <div className="flex items-center space-x-2">
                    {['C','L','A','R','I','T','Y'].map((l, i) => (
                        <div key={i} 
                            className="w-16 h-20 bg-zinc-900 border-b-[6px] border-r-[6px] border-black flex items-center justify-center rounded-md relative group hover:-translate-y-1 hover:brightness-110 transition-all cursor-default shadow-2xl"
                            style={{ 
                                backgroundColor: i === 0 ? '#9333ea' : '#18181b', // Purple for 'C'
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                borderLeft: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <span className={`text-4xl font-black uppercase font-mono ${i === 0 ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-300 transition-colors'}`}>
                                {l}
                            </span>
                            {/* Reflection pixel */}
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white/10 rounded-full" />
                            {/* Inner Shadow inset */}
                            <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] rounded-md pointer-events-none" />
                        </div>
                    ))}
                </div>

                {/* 2. SUBTITLE / TAGLINE CHIP */}
                <div className="flex items-center space-x-4">
                     <div className="h-px w-12 bg-zinc-800" />
                     <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-600 font-bold">
                        Agentic Video Generation v2.0
                     </span>
                     <div className="h-px w-12 bg-zinc-800" />
                </div>


                {/* 3. ACTION BUTTON BLOCK */}
                <Link href="/generate">
                    <button className="group relative w-64 h-16 bg-zinc-100 hover:bg-white active:bg-zinc-300 border-b-[6px] border-r-[6px] border-black/80 rounded-lg flex items-center justify-between px-6 transition-all active:border-b-0 active:border-r-0 active:translate-y-[6px] active:translate-x-[6px]">
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 group-hover:text-purple-600 transition-colors">Enter System</span>
                            <span className="text-lg font-black text-black tracking-tight group-hover:scale-105 transition-transform origin-left">LAUNCH STUDIO</span>
                        </div>
                        <div className="w-8 h-8 rounded bg-black flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                             <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                    </button>
                </Link>

            </div>

            {/* --- FOOTER STATUS BAR --- */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-8 opacity-40 hover:opacity-100 transition-opacity duration-500">
                 <div className="flex flex-col items-center space-y-2 group">
                    <div className="w-12 h-12 bg-zinc-900 border-b-[3px] border-r-[3px] border-black rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-600 group-hover:text-zinc-400 uppercase tracking-widest">Online</span>
                 </div>
                 
                 <div className="flex flex-col items-center space-y-2 group">
                    <div className="w-12 h-12 bg-zinc-900 border-b-[3px] border-r-[3px] border-black rounded flex items-center justify-center">
                         <span className="font-mono text-zinc-600 text-xs">AI</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-600 group-hover:text-zinc-400 uppercase tracking-widest">Active</span>
                 </div>

                 <div className="flex flex-col items-center space-y-2 group">
                    <div className="w-12 h-12 bg-zinc-900 border-b-[3px] border-r-[3px] border-black rounded flex items-center justify-center">
                         <span className="font-mono text-zinc-600 text-xs">V2</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-600 group-hover:text-zinc-400 uppercase tracking-widest">Beta</span>
                 </div>
            </div>

            {/* Corner Decor */}
            <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-zinc-800/50 rounded-tl-3xl pointer-events-none" />
            <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-zinc-800/50 rounded-tr-3xl pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-zinc-800/50 rounded-bl-3xl pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-zinc-800/50 rounded-br-3xl pointer-events-none" />

        </div>
    );
}
