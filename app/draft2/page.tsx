'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { Loader2, Clapperboard, Sparkles } from 'lucide-react';
import { Composition } from 'remotion';

// A loader that attempts to load the component
// Defined OUTSIDE so it is stable across renders
const SlidePreview = (props: { slideId: string }) => {
     // Dynamically import the specific slide from the barrel file
     // This relies on HMR updating the index.ts file
     
     const slideId = props.slideId;

     const GeneratedComponent = React.lazy(async () => {
         // We import the whole module. In a real app we might dynamic import strictly
         const mode = await import('./generated/index');
         // @ts-ignore
         // Sanitize ID to match generator logic
         const sanitizedId = slideId ? slideId.replace(/[^a-zA-Z0-9]/g, '_') : '1';
         const Component = mode[`Slide_${sanitizedId}`] || mode.default?.Slide_1; 
         
         if (!Component) {
             return { default: () => <div className="text-white text-xl p-10">Waiting for {slideId || "Slide"}... (Try Refreshing)</div> };
         }
         return { default: Component };
     });
     
     return (
         <React.Suspense fallback={<div className="text-white text-xl p-10 flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading Slide...</div>}>
             <GeneratedComponent />
         </React.Suspense>
     );
};

export default function Draft2Page() {
    const [topic, setTopic] = useState("AI Future");
    const [customPrompt, setCustomPrompt] = useState("Dark cyberpunk theme, fast pace");
    const [plan, setPlan] = useState<any>(null);
    const [status, setStatus] = useState("idle"); // idle, planning, generating, ready
    const [logs, setLogs] = useState<string[]>([]);
    const [GeneratedSlide, setGeneratedSlide] = useState<any>(null);

    const log = (msg: string) => setLogs(prev => [...prev, msg]);

    const handlePlan = async () => {
        setStatus("planning");
        setLogs([]);
        log("🎬 Director is planning...");
        
        try {
            const res = await fetch('/api/draft2/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, userPrompt: customPrompt })
            });
            const data = await res.json();
            setPlan(data);
            log("✅ Plan created!");
            log(`Theme: ${data.themePrompt}`);
            // Auto start generation for slide 1
            handleGenerate(data);
        } catch (e: any) {
            log("❌ Planning failed: " + e.message);
            setStatus("idle");
        }
    };

    const handleGenerate = async (currentPlan: any) => {
        setStatus("generating");
        const slide = currentPlan.slides[0]; // Just 1 slide for now
        log(`🔨 Generating Component for Slide: ${slide.id}...`);
        
        try {
            const res = await fetch('/api/draft2/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slideId: slide.id,
                    themePrompt: currentPlan.themePrompt,
                    visualPrompt: slide.visualPrompt
                })
            });
            
            if (!res.ok) throw new Error("Generation failed");
            
            log("✅ Component Code Written to Disk!");
            log("⚡ HMR Triggered. If preview doesn't appear, try refreshing.");
            
            // Set the slide ID to trigger the preview logic
            setGeneratedSlide(slide.id);
            setStatus("ready");
            
        } catch (e: any) {
            log("❌ Generation failed: " + e.message);
            setStatus("idle");
        }
    };

    return (
        <div className="flex h-screen bg-black text-white p-8 gap-8">
            {/* INPUT PANEL */}
            <div className="w-1/3 flex flex-col gap-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-purple-500" />
                    Generative Director (Draft 2)
                </h1>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Topic</label>
                        <input 
                           className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded"
                           value={topic}
                           onChange={e => setTopic(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Style & Vibe</label>
                        <textarea 
                           className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded h-32"
                           value={customPrompt}
                           onChange={e => setCustomPrompt(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePlan}
                            disabled={status !== "idle"}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded flex items-center justify-center gap-2"
                        >
                            {status === "idle" ? <><Clapperboard /> Create Magic</> : <Loader2 className="animate-spin" />}
                        </button>
                        
                        <button
                            disabled={!GeneratedSlide}
                            onClick={async () => {
                                if (!GeneratedSlide) return;
                                try {
                                    const res = await fetch('/api/draft2/render', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ slideId: GeneratedSlide })
                                    });
                                    if (!res.ok) throw new Error("Render failed");
                                    const blob = await res.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `slide-${GeneratedSlide}.mp4`;
                                    a.click();
                                } catch (e) {
                                    alert("Render failed. Check console.");
                                    console.error(e);
                                }
                            }}
                            className="w-16 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded flex items-center justify-center"
                            title="Download MP4"
                        >
                            ⬇️
                        </button>
                    </div>
                </div>
                
                <div className="bg-neutral-900 p-4 rounded font-mono text-xs h-64 overflow-y-auto">
                    {logs.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
                </div>
            </div>
            
            {/* PREVIEW PANEL */}
            <div className="flex-1 bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-800 relative overflow-hidden">
                {status === "ready" ? (
                    <div className="w-full max-w-4xl aspect-video shadow-2xl relative">
                        <Player
                            component={SlidePreview}
                            durationInFrames={150}
                            fps={30}
                            compositionWidth={1920}
                            compositionHeight={1080}
                            style={{ width: '100%', height: '100%' }}
                            controls
                            autoPlay
                            loop
                            inputProps={{ slideId: GeneratedSlide }}
                        />
                    </div>
                ) : (
                    <div className="text-neutral-500 text-center">
                        <Clapperboard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Director is waiting for input...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
