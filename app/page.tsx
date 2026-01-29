'use client';

import React, { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import { VideoRenderer } from '../remotion/VideoRenderer';
import { ExecutionPlan, ExecutionPlanSchema } from '@/registry/schema';
import { Loader2, Play, Download, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // ensure this exists or use template literals

// Default placeholder plan
const DEFAULT_PLAN: ExecutionPlan = {
  video: {
    totalDurationWait: 5,
    totalDurationFrames: 150,
    theme: 'dark',
    fps: 30,
    width: 1920,
    height: 1080
  },
  slides: [
    {
      id: 'default-1',
      componentId: 'TITLE_CENTER_FADE',
      content: {
        title: "AI Video Generator",
        subtitle: "Enter your prompt to begin"
      },
      timing: { durationInFrames: 150 },
      motion: { intensity: 'medium', enterDuration: 30, exitDuration: 30, holdDuration: 90 },
    }
  ]
};

export default function Home() {
  const [plan, setPlan] = useState<ExecutionPlan>(DEFAULT_PLAN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [theme, setTheme] = useState('dark');
  const [duration, setDuration] = useState(5);
  const [intensity, setIntensity] = useState('medium');
  const [density, setDensity] = useState('balanced');
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          duration,
          motionIntensity: intensity,
          textDensity: density,
          customPrompt
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      // Validate again on client just to be safe/strict
      // const validPlan = ExecutionPlanSchema.parse(data);
      setPlan(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
      if (loading) return;
      setLoading(true);
      try {
          const res = await fetch('/api/render', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(plan)
          });
          
          if (!res.ok) throw new Error("Rendering failed");
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `remotion-video-${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
      } catch (e: any) {
          console.error(e);
          alert("Rendering failed: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <main className="flex h-screen w-full bg-neutral-900 text-white overflow-hidden font-sans">
      
      {/* LEFT SIDE: PREVIEW */}
      <section className="flex-1 flex flex-col items-center justify-center bg-neutral-950 border-r border-neutral-800 relative p-8">
        <div className="relative shadow-2xl rounded-lg overflow-hidden border border-neutral-800">
           <Player
             component={VideoRenderer}
             inputProps={{ plan }}
             durationInFrames={plan.video.totalDurationFrames}
             fps={plan.video.fps}
             compositionWidth={plan.video.width}
             compositionHeight={plan.video.height}
             style={{
               width: '100%',
               maxWidth: '800px',
               aspectRatio: '16/9',
             }}
             controls
             autoPlay
             loop
           />
        </div>

        <div className="mt-8 flex gap-4">
           {/* Download Button */}
           <button 
             disabled={loading}
             className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-full font-medium transition-colors disabled:opacity-50"
             onClick={handleDownload}
           >
             <Download className="w-4 h-4" />
             {loading ? 'Rendering...' : 'Download MP4'}
           </button>
        </div>
      </section>

      {/* RIGHT SIDE: CONTROLS */}
      <section className="w-[400px] bg-neutral-900 flex flex-col p-6 overflow-y-auto border-l border-neutral-800 z-10">
        <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">AI Director</h1>
            <p className="text-neutral-400 text-sm">Configure your video and let the AI handle the choreography.</p>
        </div>

        <div className="space-y-6">
            
            {/* Theme */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                    {['dark', 'light', 'cinematic', 'minimal'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm border transition-all",
                                theme === t 
                                    ? "bg-white text-black border-white" 
                                    : "bg-neutral-800 border-neutral-700 hover:border-neutral-500"
                            )}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
                 <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Duration: {duration}s</label>
                 <input 
                    type="range" 
                    min={3} 
                    max={60} 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-white"
                 />
            </div>

            {/* Intensity */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Motion Intensity</label>
                <div className="flex bg-neutral-800 p-1 rounded-md">
                    {['low', 'medium', 'high'].map(i => (
                        <button 
                            key={i}
                            onClick={() => setIntensity(i)}
                            className={cn(
                                "flex-1 py-1 px-3 rounded text-xs transition-all",
                                intensity === i ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {i}
                        </button>
                    ))}
                </div>
            </div>
             
             {/* Density */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Text Density</label>
                <div className="flex bg-neutral-800 p-1 rounded-md">
                     {['minimal', 'balanced', 'dense'].map(d => (
                        <button 
                            key={d}
                            onClick={() => setDensity(d)}
                            className={cn(
                                "flex-1 py-1 px-3 rounded text-xs transition-all",
                                density === d ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Instructions (Optional)</label>
                <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Make it punchy, use blue accents..."
                    className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-md p-3 text-sm focus:outline-none focus:border-white resize-none"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-xs">
                    {error}
                </div>
            )}

            {/* Generate Button */}
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full h-12 bg-white text-black font-bold rounded-md flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                {loading ? "Directing..." : "Generate Video"}
            </button>
        </div>
      </section>

    </main>
  );
}
