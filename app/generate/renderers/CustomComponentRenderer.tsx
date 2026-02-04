import React from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { CustomNode, AnimationConfig, DesignTokens, CustomComponentRendererProps } from './CustomComponent_Types';
import { resolveTarget } from './CustomComponent_Utils';
import { RenderNode } from './CustomComponent_Node';

export const CustomComponentRenderer: React.FC<CustomComponentRendererProps> = ({ content, scale }) => {
    const registry = React.useRef<Record<string, HTMLElement | null>>({});
    const rootRef = React.useRef<HTMLDivElement>(null);
    const signalRef = React.useRef<{ type: string; payload: any } | null>(null);

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

    React.useEffect(() => {
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
                                if (sceneEl) {
                                    anims.push(animate(sceneEl, { scale: zoom, x: centerX, y: centerY } as any, trans));
                                }
                           }

                           // 4. Cursor (Center on target)
                           if (cursor) {
                                const cursorEl = registry.current['cursor'];
                                if (cursorEl) {
                                    const tx = resolveTarget(`target:${target}`, 'x', registry.current, cursorEl, rootRef as any);
                                    const ty = resolveTarget(`target:${target}`, 'y', registry.current, cursorEl, rootRef as any);
                                    
                                    anims.push(animate(cursorEl, { x: tx, y: ty } as any, trans));
                                }
                           }

                           if (wait) await Promise.all(anims);
                      } else {
                          if (delay) await new Promise(r => setTimeout(r, delay * 1000));
                      }
                      
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



                const el = registry.current[id];

                 if (!el) {
                     if (delay && !id) await new Promise(r => setTimeout(r, delay * 1000));
                     stepIndex++;
                     continue;
                 }

                 if (delay) await new Promise(r => setTimeout(r, delay * 1000));
                 
                 const resolvedAnim = { ...animDef };
                 ['x', 'y'].forEach(axis => {
                     if (resolvedAnim[axis]) {
                         resolvedAnim[axis] = resolveTarget(resolvedAnim[axis], axis as 'x' | 'y', registry.current, el, rootRef as any);
                     }
                 });

                 try {
                     const controls = animate(el, resolvedAnim, transition);
                     if (!parallel && wait) {
                         await controls.then(() => {}); 
                     }
                 } catch (err) {
                    console.warn("Animation failed", err);
                 }

                 stepIndex++;
             }
        };

        runTimeline();

        return () => { isCancelled = true; };
    }, [parsed]);

    if (!parsed) {
        return <div className="text-red-500 text-xs">Invalid JSON</div>;
    }

    let rootNode: CustomNode;
    let animationMap: Record<string, AnimationConfig> | undefined;
    let tokens: DesignTokens | undefined;

    if (parsed.layout) {
        rootNode = parsed.layout;
        animationMap = parsed.animations;
        tokens = parsed.tokens;
    } else {
        rootNode = parsed;
    }

    return (
        <div 
            ref={rootRef} 
            style={{ width: '100%', height: '100%', position: 'relative' }}
        >
            <RenderNode 
                node={rootNode} 
                animationMap={animationMap} 
                registry={registry}
                rootRef={rootRef as React.RefObject<HTMLDivElement>}
                onInteraction={handleInteraction}
                tokens={tokens}
                mouse={{ x: mouseX, y: mouseY }}
                focusedId={focusedId}
            />
        </div>
    );
};
