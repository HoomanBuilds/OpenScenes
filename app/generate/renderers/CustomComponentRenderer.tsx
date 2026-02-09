import React from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { CustomNode, AnimationConfig, DesignTokens, CustomComponentRendererProps } from './CustomComponent_Types';
import { resolveTarget, sanitizeTransition } from './CustomComponent_Utils';
import { RenderNode } from './CustomComponent_Node';

export const CustomComponentRenderer: React.FC<CustomComponentRendererProps> = ({ content, scale, frame, fps }) => {
    const registry = React.useRef<Record<string, HTMLElement | null>>({});
    const targetCache = React.useRef<Record<string, number>>({});
    const rootRef = React.useRef<HTMLDivElement>(null);
    const signalRef = React.useRef<{ type: string; payload: any } | null>(null);

    // Clear cache when template changes to ensure fresh coordinate resolution
    React.useEffect(() => {
        targetCache.current = {};
    }, [content]);

    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const focusOpacity = useMotionValue(0);
    const [focusedId, setFocusedId] = React.useState<string | null>(null);

    const handleInteraction = (type: string, payload: any) => {
        signalRef.current = { type, payload };
    };

    const parsed = React.useMemo(() => {
        try {
            if (typeof content === 'string') {
                const trimmed = content.trim();
                if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    return JSON.parse(content);
                }
                return null;
            }
            return content;
        } catch { return null; }
    }, [content]);

    const totalTimelineDuration = React.useMemo(() => {
        if (!parsed || !parsed.timeline) return 0;
        let currentTime = 0.2;
        let maxEndTime = 0;
        parsed.timeline.forEach((step: any) => {
             const { delay = 0, parallel = false, transition, guide, label, goto } = step;
             if (label || goto) return;
             const hasAnim = !!(step.animate || guide);
             const baseDuration = transition?.duration ?? guide?.duration ?? (hasAnim ? 0.8 : 0);
             const repeat = transition?.repeat ?? 0;
             const totalStepDuration = baseDuration * (repeat + 1);
             const stepEnd = currentTime + delay + (transition?.delay ?? 0) + totalStepDuration;
             
             maxEndTime = Math.max(maxEndTime, stepEnd);
             if (!parallel) currentTime = stepEnd;
        });
        return Math.max(0.1, maxEndTime);
    }, [parsed]);

    // This memo calculates the exact state of every animated element at a specific frame
    const frameSpecificOverrides = React.useMemo(() => {
        if (frame === undefined || !parsed || !parsed.timeline) return null;
        
        const fpsVal = fps || 30;
        let seekTime = frame / fpsVal;
        
        // Determinstic Looping logic: restarts the timeline once it exceeds total duration
        if (parsed.loop || parsed.timeline.some((s: any) => s.goto)) {
            seekTime = seekTime % totalTimelineDuration;
        }

        const results: Record<string, any> = {};
        let activeFocusId: string | null = null;
        
        const applyEasing = (p: number, type?: string) => {
            if (type === 'linear') return p;
            if (type === 'easeIn') return p * p * p;
            if (type === 'easeOut') return 1 - Math.pow(1 - p, 3);
            if (type === 'easeInOut') {
                return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            }
            if (type === 'circIn') return 1 - Math.sqrt(1 - Math.pow(p, 2));
            if (type === 'circOut') return Math.sqrt(1 - Math.pow(p - 1, 2));
            if (type === 'backOut') {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
            }
            if (type === 'spring') {
                const c4 = (2 * Math.PI) / 3;
                return p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
            }
            return 1 - Math.pow(1 - p, 3);
        };

        const memoResolveTarget = (val: string, axis: 'x' | 'y', element: HTMLElement, fallback: number) => {
            const cacheKey = `${val}-${axis}`;
            if (targetCache.current[cacheKey] !== undefined) return targetCache.current[cacheKey];
            
            if (rootRef.current) {
                const resolved = resolveTarget(val, axis, registry.current, element, rootRef as any);
                // Position fallback: If target is temporarily missing, don't snap to (0,0)
                const targetId = val.split(':')[1];
                if (resolved === 0 && targetId && !registry.current[targetId]) {
                    return fallback;
                }

                if (resolved !== 0) {
                    targetCache.current[cacheKey] = resolved;
                }
                return resolved;
            }
            return fallback;
        };

        let currentTime = 0.2;
        if (parsed.animations) {
            Object.keys(parsed.animations).forEach(id => {
                results[id] = { ...parsed.animations[id].initial };
            });
        }

        parsed.timeline.forEach((step: any) => {
            const { id, animate, transition, delay = 0, parallel = false, label, goto, guide } = step;
            if (label || goto) return;
            
            const hasAnim = !!(animate || guide);
            const baseDuration = transition?.duration ?? guide?.duration ?? (hasAnim ? 0.8 : 0);
            const repeat = transition?.repeat ?? 0;
            const repeatType = transition?.repeatType || (transition?.yoyo ? 'reverse' : 'loop');
            const transDelay = transition?.delay ?? 0;
            
            const totalStepDuration = baseDuration * (repeat + 1);
            const start = currentTime + delay + transDelay;
            const end = start + totalStepDuration;

            const calculateProgress = () => {
                if (seekTime < start) return 0;
                if (seekTime >= end && repeat !== Infinity) {
                    const totalCycles = repeat + 1;
                    if (repeatType === 'reverse' && totalCycles % 2 === 0) return 0;
                    return 1;
                }
                
                if (baseDuration === 0) return 1;
                
                const totalProgress = (seekTime - start) / baseDuration;
                const iteration = Math.floor(totalProgress);
                let progressInIteration = totalProgress % 1;
                
                if (repeat !== Infinity && iteration > repeat) {
                    const totalCycles = repeat + 1;
                    return (repeatType === 'reverse' && totalCycles % 2 === 0) ? 0 : 1;
                }
                
                if (repeatType === 'reverse' && iteration % 2 === 1) {
                    progressInIteration = 1 - progressInIteration;
                }
                
                return applyEasing(progressInIteration, transition?.ease || 'easeInOut');
            };

            const progress = calculateProgress();

            if (guide) {
                 const { target, cursor = true } = guide;
                 if (seekTime >= start) {
                      activeFocusId = target; // Deterministic focus tracking
                      if (cursor) {
                          const cursorEl = registry.current['cursor'];
                          if (cursorEl) {
                              if (!results['cursor']) results['cursor'] = { x: 0, y: 0 };
                              const currentX = results['cursor'].x ?? 0;
                              const currentY = results['cursor'].y ?? 0;
                              
                              const tx = memoResolveTarget(`target:${target}`, 'x', cursorEl, currentX);
                              const ty = memoResolveTarget(`target:${target}`, 'y', cursorEl, currentY);
                              
                              const isPast = seekTime >= end && repeat !== Infinity;
                              const nextX = isPast ? tx : currentX + (tx - currentX) * progress;
                              const nextY = isPast ? ty : currentY + (ty - currentY) * progress;
                              
                              if (Number.isFinite(nextX)) results['cursor'].x = nextX;
                              if (Number.isFinite(nextY)) results['cursor'].y = nextY;
                          }
                      }
                 }
            }

            if (id && animate) {
                if (seekTime >= start) {
                    if (id === "FOCUS_TARGET") {
                        activeFocusId = animate.id ?? null;
                    }

                    if (!results[id]) results[id] = {};
                    
                    Object.keys(animate).forEach(key => {
                        let targetVal = animate[key];
                        const el = registry.current[id];
                        
                        let currentVal = results[id][key] ?? 0;

                        if (typeof targetVal === 'string' && (targetVal.startsWith('target:') || targetVal.startsWith('camera:'))) {
                            if (el) targetVal = memoResolveTarget(targetVal, key === 'x' ? 'x' : 'y', el, currentVal);
                            else targetVal = currentVal;
                        }

                        if (typeof currentVal === 'string' && (currentVal.startsWith('target:') || currentVal.startsWith('camera:'))) {
                             if (el) currentVal = memoResolveTarget(currentVal, key === 'x' ? 'x' : 'y', el, 0);
                             else currentVal = 0;
                        }

                        if (typeof targetVal === 'number' && typeof currentVal === 'number') {
                            const isPast = seekTime >= end && repeat !== Infinity;
                            const nextVal = isPast ? (progress === 0 ? currentVal : targetVal) : currentVal + (targetVal - currentVal) * progress;
                            if (Number.isFinite(nextVal)) results[id][key] = nextVal;
                        } else if (seekTime >= start) {
                            results[id][key] = targetVal;
                        }
                    });
                }
            }

            if (!parallel) currentTime = end;
            else currentTime = start;
        });

        return { overrides: results, focusedId: activeFocusId };
    }, [parsed, frame, fps, totalTimelineDuration]);

    React.useEffect(() => {
        if (frame !== undefined) return; // Use deterministic mode for video
        if (!parsed || !parsed.timeline || !Array.isArray(parsed.timeline)) return;

        let isCancelled = false;

        const runTimeline = async () => {
             await new Promise(r => setTimeout(r, 200));

             const labelMap: Record<string, number> = {};
             parsed.timeline.forEach((step: any, idx: number) => {
                 if (step.label) labelMap[step.label] = idx;
             });

             let stepIndex = 0;
             
             while (!isCancelled) {
                 if (signalRef.current) {
                     const signal = signalRef.current;
                     signalRef.current = null;
                     
                     if (signal.type === 'onClick' && signal.payload.goto) {
                         if (labelMap[signal.payload.goto] !== undefined) {
                             stepIndex = labelMap[signal.payload.goto];
                             continue;
                         }
                     }
                 }

                 if (stepIndex >= parsed.timeline.length) {
                     if (parsed.loop) {
                         await new Promise(r => setTimeout(r, 1000));
                         stepIndex = 0; 
                     } else {
                         await new Promise(r => setTimeout(r, 200));
                         continue;
                     }
                 }

                 if (stepIndex >= parsed.timeline.length) { stepIndex = 0; continue; }

                 const step = parsed.timeline[stepIndex];
                 const { 
                     id, animate: animDef, transition, 
                     wait = true, parallel = false, delay = 0,
                     label, goto 
                 } = step;

                 if (goto) {
                     if (labelMap[goto] !== undefined) {
                         if (step.delay) await new Promise(r => setTimeout(r, step.delay * 1000));
                         stepIndex = labelMap[goto];
                         continue;
                     }
                 }

                 if (label) {
                     stepIndex++;
                     continue;
                 }

                 if (step.guide) {
                     const { target, zoom = 1.5, duration = 0.8, cursor = true, camera = true, opacity = 1 } = step.guide;
                     const targetEl = registry.current[target];
                     
                     if (targetEl && rootRef.current) {
                          setFocusedId(target);
                          animate(focusOpacity, opacity, { duration: duration * 0.5 });

                          const rootRect = rootRef.current.getBoundingClientRect();
                          const targetRect = targetEl.getBoundingClientRect();
                          
                          const anims: any[] = [];
                          const trans: any = { duration, ease: "easeInOut" };

                          if (camera) {
                               const targetInRootX = targetRect.left - rootRect.left;
                               const targetInRootY = targetRect.top - rootRect.top;
                               const centerX = (rootRect.width / 2) - (targetInRootX + targetRect.width / 2);
                               const centerY = (rootRect.height / 2) - (targetInRootY + targetRect.height / 2);
                               
                               const sceneEl = registry.current['el-scenes-ui'];
                               if (sceneEl) anims.push(animate(sceneEl, { scale: zoom, x: centerX, y: centerY } as any, trans));
                          }

                          if (cursor) {
                               const cursorEl = registry.current['cursor'];
                               if (cursorEl) {
                                   const tx = resolveTarget(`target:${target}`, 'x', registry.current, cursorEl, rootRef as any);
                                   const ty = resolveTarget(`target:${target}`, 'y', registry.current, cursorEl, rootRef as any);
                                   anims.push(animate(cursorEl, { x: tx, y: ty } as any, trans));
                               }
                          }

                          if (wait) await Promise.all(anims);
                     } else if (delay) await new Promise(r => setTimeout(r, delay * 1000));
                     
                     stepIndex++;
                     continue;
                 }

                 if (id === "FOCUS_TARGET") {
                    if (delay) await new Promise(r => setTimeout(r, delay * 1000));
                    if (animDef.id !== undefined) {
                        setFocusedId(animDef.id);
                        animate(focusOpacity, animDef.id ? 0.6 : 0, transition);
                    } else {
                         animate(focusOpacity, animDef.opacity ?? 0, transition);
                    }
                    stepIndex++;
                    continue;
                }

                // Poll for element existence (up to 500ms) to allow for render delays
                let el = registry.current[id];
                if (!el) {
                    for (let i = 0; i < 10; i++) {
                        await new Promise(r => setTimeout(r, 50));
                        el = registry.current[id];
                        if (el) break;
                    }
                }

                 if (!el) {
                     // If still missing, just skip this animation
                     if (delay && !id) await new Promise(r => setTimeout(r, delay * 1000));
                     stepIndex++;
                     continue;
                 }

                 if (delay) await new Promise(r => setTimeout(r, delay * 1000));
                 const resolvedAnim = { ...animDef };
                 ['x', 'y'].forEach(axis => {
                     if (typeof resolvedAnim[axis] === 'string' && resolvedAnim[axis].startsWith('target:')) {
                         resolvedAnim[axis] = resolveTarget(resolvedAnim[axis], axis as 'x' | 'y', registry.current, el, rootRef as any);
                     }
                 });

                 const resolvedTransition = sanitizeTransition(transition);
                 const shouldWait = (wait && !parallel) && resolvedTransition.repeat !== Infinity;

                 try {
                     const controls = animate(el, resolvedAnim, resolvedTransition);
                     if (shouldWait) await controls;
                 } catch (err) {
                    console.warn("Animation failed", err);
                 }

                 stepIndex++;
             }
        };

        runTimeline();
        return () => { isCancelled = true; };
    }, [parsed]);

    if (!parsed) return <div className="text-red-500 text-xs">Invalid JSON</div>;

    const rootNode = parsed.layout || parsed;
    const animationMap = parsed.animations;
    const tokens = parsed.tokens;

    return (
        <div ref={rootRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <RenderNode 
                node={rootNode} 
                animationMap={animationMap} 
                registry={registry}
                rootRef={rootRef as React.RefObject<HTMLDivElement>}
                onInteraction={handleInteraction}
                tokens={tokens}
                mouse={{ x: mouseX, y: mouseY }}
                focusedId={frameSpecificOverrides ? frameSpecificOverrides.focusedId : focusedId}
                overrides={frameSpecificOverrides ? frameSpecificOverrides.overrides : undefined}
            />
        </div>
    );
};
