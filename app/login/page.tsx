'use client';

import React from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-purple-500/30">
             {/* Background Noise & Gradient */}
             <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
             <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
             <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md p-8 relative z-10"
            >
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center mb-4 transform rotate-45">
                        <div className="w-6 h-6 bg-purple-600"></div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-white mb-1">OpenScenes</h1>
                </div>

                {/* Login Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 shadow-2xl relative group">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-purple-500/50"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-purple-500/50"></div>

                    <div className="space-y-4">
                        <button className="w-full h-12 bg-white text-black font-bold flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Countinue with Google</span>
                        </button>

                        <button className="w-full h-12 bg-[#24292F] text-white font-bold flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span>Continue with GitHub</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Internal Clearance Only</p>
                        <div className="flex justify-center gap-1">
                             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-75"></div>
                             <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/projects" className="text-xs text-zinc-500 hover:text-white transition-colors underline decoration-zinc-800 underline-offset-4">
                        Continue as Guest (Dev Mode) →
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
