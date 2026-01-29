import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { Activity, Cpu, Zap } from 'lucide-react';

export default function Slide() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleSpring = spring({ frame, fps, config: { damping: 200 } });
  const titleScale = 0.8 + titleSpring * 0.2;

  const glitchOffset = interpolate(frame, [0, 10, 20, 30, 40, 50], [0, 2, -1, 3, -2, 0]);

  const dataStream1X = interpolate(frame % 60, [0, 60], [-100, 2020]);
  const dataStream2X = interpolate((frame + 30) % 60, [0, 60], [-100, 2020]);

  const iconOpacity = interpolate(frame, [15, 30], [0, 0.7], { extrapolateRight: 'clamp' });
  const iconScale = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 150 } });

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-br from-black via-purple-950 to-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm" style={{ transform: `translateX(${dataStream1X}px)` }}></div>
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-magenta-500 to-transparent blur-sm" style={{ transform: `translateX(${dataStream2X}px)` }}></div>
        <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" style={{ transform: `translateX(${dataStream1X * 0.7}px)` }}></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(0,255,255,0.03)_50%)] bg-[length:100%_4px] opacity-40"></div>

      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <div className="relative">
          <h1
            style={{
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              textShadow: `0 0 30px rgba(0, 200, 255, 0.8), 0 0 60px rgba(0, 150, 255, 0.5)`
            }}
            className="text-9xl font-black tracking-tighter text-center"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI FUTURE
            </span>
          </h1>

          <div
            style={{
              transform: `translateX(${glitchOffset}px)`,
              opacity: Math.abs(glitchOffset) * 0.3
            }}
            className="absolute inset-0 text-9xl font-black tracking-tighter text-center"
          >
            <span className="bg-gradient-to-r from-magenta-500 to-pink-500 bg-clip-text text-transparent">
              AI FUTURE
            </span>
          </div>
        </div>

        <div className="mt-20 flex gap-16">
          <div
            style={{
              opacity: iconOpacity,
              transform: `scale(${iconScale})`
            }}
            className="flex flex-col items-center"
          >
            <Cpu className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_15px_rgba(0,200,255,0.7)]" />
            <span className="mt-4 text-xl font-semibold text-cyan-300">NEURAL CORE</span>
          </div>
          <div
            style={{
              opacity: iconOpacity,
              transform: `scale(${iconScale})`
            }}
            className="flex flex-col items-center"
          >
            <Zap className="w-24 h-24 text-magenta-400 drop-shadow-[0_0_15px_rgba(255,0,255,0.7)]" />
            <span className="mt-4 text-xl font-semibold text-magenta-300">QUANTUM SPEED</span>
          </div>
          <div
            style={{
              opacity: iconOpacity,
              transform: `scale(${iconScale})`
            }}
            className="flex flex-col items-center"
          >
            <Activity className="w-24 h-24 text-blue-400 drop-shadow-[0_0_15px_rgba(0,100,255,0.7)]" />
            <span className="mt-4 text-xl font-semibold text-blue-300">SYNTHETIC MIND</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div
          style={{
            opacity: interpolate(frame, [40, 60], [0, 0.6], { extrapolateRight: 'clamp' })
          }}
          className="text-lg font-mono text-cyan-300/70 tracking-widest"
        >
          SYSTEM INITIALIZED :: CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
}