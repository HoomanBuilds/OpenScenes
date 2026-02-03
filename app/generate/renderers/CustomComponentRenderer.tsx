import React from 'react';
import { motion, useAnimation, animate, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';

interface CustomNode {
    id?: string;
    tag: string;
    className?: string; 
    style?: React.CSSProperties;
    text?: string;
    children?: CustomNode[];
    props?: Record<string, any>;
    
    states?: InteractionStates;
    a11y?: A11yConfig;
    events?: Record<string, any>; 
    effects?: EffectsConfig;
    typing?: { speed?: number; delay?: number };
    
    initial?: any;
    animate?: any;
    transition?: any;
}

interface InteractionStates {
    hover?: Partial<StyleProps>;
    tap?: Partial<StyleProps>;
    focus?: Partial<StyleProps>;
    disabled?: Partial<StyleProps>;
}

interface EffectsConfig {
    parallax?: { strength?: number }; 
    spotlight?: { 
        color?: string; 
        size?: number;
        opacity?: number; 
    };
}

interface StyleProps {
    className?: string;
    style?: React.CSSProperties;
    opacity?: number;
    scale?: number;
    x?: number | string;
    y?: number | string;
    rotate?: number;
    backgroundColor?: string;
    color?: string;
}

interface A11yConfig {
    role?: string;
    label?: string; // aria-label
    description?: string; // aria-description
    hidden?: boolean; // aria-hidden
    tabIndex?: number;
}

interface DesignTokens {
    colors?: Record<string, string>;
    spacing?: Record<string, string | number>;
    radius?: Record<string, string | number>;
    shadows?: Record<string, string>;
    fonts?: Record<string, string>;
}

interface AnimationConfig {
    initial?: any;
    animate?: any;
    transition?: any;
}

interface SmartCustomComponentData {
    layout: CustomNode;
    animations?: Record<string, AnimationConfig>;
    timeline?: TimelineStep[];
    tokens?: DesignTokens; // Global tokens
    loop?: boolean;
}

interface CustomComponentRendererProps {
    content: string | Record<string, any>; 
    scale: number;
}

const COMPONENT_MAP: Record<string, any> = {
    'AreaChart': AreaChart,
    'Area': Area,
    'XAxis': XAxis,
    'YAxis': YAxis,
    'CartesianGrid': CartesianGrid,
    'Tooltip': Tooltip,
    'ResponsiveContainer': ResponsiveContainer,
    'PieChart': PieChart,
    'Pie': Pie,
    'Cell': Cell,
    'BarChart': BarChart,
    'Bar': Bar,
    'LineChart': LineChart,
    'Line': Line,
};

const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'base'];
const DANGEROUS_ATTRS = ['dangerouslySetInnerHTML', 'innerHTML', 'outerHTML'];

const sanitizeProps = (props?: Record<string, any>): Record<string, any> => {
    if (!props) return {};
    const safeProps: Record<string, any> = {};
    
    Object.keys(props).forEach(key => {
        if (DANGEROUS_ATTRS.includes(key) || key.startsWith('on')) return;
        const value = props[key];
        if (typeof value === 'string' && value.trim().toLowerCase().startsWith('javascript:')) return;
        safeProps[key] = value;
    });

    return safeProps;
};

const resolveToken = (val: any, tokens?: DesignTokens): any => {
    if (typeof val !== 'string' || !val.startsWith('$') || !tokens) return val;
    const [category, key] = val.slice(1).split('.');
    if (!category || !key) return val;
    return (tokens as any)[category]?.[key] || val;
};

const resolveTokensInObj = (obj: any, tokens?: DesignTokens): any => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return resolveToken(obj, tokens);
    const resolved: any = {};
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            resolved[key] = resolveTokensInObj(val, tokens);
        } else if (Array.isArray(val)) {
            resolved[key] = val.map(v => resolveTokensInObj(v, tokens));
        } else {
            resolved[key] = resolveToken(val, tokens);
        }
    });
    return resolved;
};

interface RenderNodeProps {
    node: CustomNode;
    animationMap?: Record<string, AnimationConfig>;
    registry: React.MutableRefObject<Record<string, HTMLElement | null>>;
    rootRef: React.RefObject<HTMLDivElement>;
    onInteraction?: (type: string, payload: any) => void;
    tokens?: DesignTokens;
    mouse?: { x: any, y: any };
    focusedId?: string | null;
}

const RenderNode: React.FC<RenderNodeProps> = ({ node, animationMap, registry, rootRef, onInteraction, tokens, mouse, focusedId }) => {
    const { id, tag, className, style, text, children, props, states, a11y, effects, typing } = node;
    const controls = useAnimation();
    const elementRef = React.useRef<HTMLElement | null>(null);
    const [displayText, setDisplayText] = React.useState(text || "");

    if (DANGEROUS_TAGS.includes(tag.toLowerCase())) return null;

    const resolvedStyle: any = resolveTokensInObj(style, tokens);
    const resolvedClassName = resolveToken(className, tokens);

    let initialAnimProps: AnimationConfig = {
        initial: node.initial,
        animate: node.animate,
        transition: node.transition
    };

    if (id && animationMap && animationMap[id]) {
        initialAnimProps = {
            initial: animationMap[id].initial || initialAnimProps.initial,
            animate: animationMap[id].animate || initialAnimProps.animate,
            transition: animationMap[id].transition || initialAnimProps.transition
        };
    }
    
    initialAnimProps = resolveTokensInObj(initialAnimProps, tokens);

    if (initialAnimProps.transition && initialAnimProps.transition.repeat === 'Infinity') {
        initialAnimProps.transition.repeat = Infinity;
    }

    React.useEffect(() => {
        if (!typing || !text) {
            setDisplayText(text || "");
            return;
        }

        let isCancelled = false;
        setDisplayText("");
        
        const typeLoop = async () => {
            if (typing.delay) {
                await new Promise(r => setTimeout(r, typing.delay! * 1000));
            }
            if (isCancelled) return;

            for (let i = 0; i <= text.length; i++) {
                if (isCancelled) return;
                setDisplayText(text.slice(0, i));
                await new Promise(r => setTimeout(r, typing.speed || 50));
            }
        };

        typeLoop();
        return () => { isCancelled = true; };
    }, [text, typing]);

    // 4. Dynamic Target Resolution Logic
    React.useEffect(() => {
        const resolveAndAnimate = async () => {
             if (id && elementRef.current) {
                registry.current[id] = elementRef.current;
            }

            if (!initialAnimProps.animate) return;

            const animateDef = { ...initialAnimProps.animate };
            let hasDynamicTargets = false;

            // Target Resolution Helper
            const resolveTargetOffset = (targetId: string, axis: 'x' | 'y') => {
                 const targetEl = registry.current[targetId];
                 const myEl = elementRef.current;
                 if (!targetEl || !myEl || !rootRef.current) return 0;
                 const parentEl = myEl.offsetParent || document.body;
                 const targetRect = targetEl.getBoundingClientRect();
                 const parentRect = parentEl.getBoundingClientRect();
                 const myRect = myEl.getBoundingClientRect();
                 const rootDOM = rootRef.current;

                 // Calculate Scale Factor (Screen Pixels / Local Pixels)
                 const scaleX = rootDOM.getBoundingClientRect().width / rootDOM.offsetWidth;
                 const scale = scaleX || 1;

                 if (axis === 'x') {
                     const val = (targetRect.left - parentRect.left + (targetRect.width / 2)) - (myRect.width / 2);
                     return val / scale;
                 } else {
                     const val = (targetRect.top - parentRect.top + (targetRect.height / 2)) - (myRect.height / 2);
                     return val / scale;
                 }
            };

            const resolveValue = (val: any, axis: 'x' | 'y') => {
                if (typeof val === 'string' && val.startsWith('target:')) {
                    hasDynamicTargets = true;
                    return resolveTargetOffset(val.split(':')[1], axis);
                }
                return val;
            };

            ['x', 'y'].forEach(axis => {
                if (Array.isArray(animateDef[axis])) {
                     const newKeyframes = animateDef[axis].map((v: any) => resolveValue(v, axis as 'x'|'y'));
                     if (hasDynamicTargets) animateDef[axis] = newKeyframes;
                } else {
                     const val = animateDef[axis];
                     if (typeof val === 'string' && val.startsWith('target:')) {
                        animateDef[axis] = resolveValue(val, axis as 'x'|'y');
                        hasDynamicTargets = true;
                     }
                }
            });

            if (hasDynamicTargets) {
                await new Promise(r => setTimeout(r, 100)); 
                ['x', 'y'].forEach(axis => {
                    const originalAnimate = initialAnimProps.animate;
                    if (Array.isArray(originalAnimate[axis])) {
                         animateDef[axis] = originalAnimate[axis].map((v: any) => {
                             if (typeof v === 'string' && v.startsWith('target:')) return resolveTargetOffset(v.split(':')[1], axis as 'x'|'y');
                             return v;
                         });
                    } else if (typeof originalAnimate[axis] === 'string' && originalAnimate[axis].startsWith('target:')) {
                         animateDef[axis] = resolveTargetOffset(originalAnimate[axis].split(':')[1], axis as 'x'|'y');
                    }
                });
                controls.start(animateDef);
            } else {
                controls.start(initialAnimProps.animate);
            }
        };

        resolveAndAnimate();
    }, [id, initialAnimProps, registry]);

    // --- Interactive Effects ---
    if (effects && mouse) {
        if (effects.parallax) {
             const strength = typeof effects.parallax === 'object' ? (effects.parallax.strength || 20) : 20;
             resolvedStyle.x = useTransform(mouse.x, [0, 1], [-strength, strength]);
             resolvedStyle.y = useTransform(mouse.y, [0, 1], [-strength, strength]);
        }
    }
    
    // Spotlight (Child Overlay)
    let spotlightOverlay = null;
    if (effects?.spotlight && mouse) {
        const size = effects.spotlight.size || 300;
        const color = effects.spotlight.color || "rgba(255,255,255,0.1)";
        
        const spotX = useTransform(mouse.x, (v: any) => `${v * 100}%`);
        const spotY = useTransform(mouse.y, (v: any) => `${v * 100}%`);
        
        const bg = useMotionTemplate`radial-gradient(${size}px circle at ${spotX} ${spotY}, ${color}, transparent 80%)`;
        
        spotlightOverlay = (
            <motion.div 
                style={{ background: bg }} 
                className="absolute inset-0 pointer-events-none z-10"
            />
        );
    }

    const childElements = children?.map((child, index) => (
        <RenderNode key={index} node={child} animationMap={animationMap} registry={registry} rootRef={rootRef} onInteraction={onInteraction} tokens={tokens} mouse={mouse} focusedId={focusedId} />
    ));

    let Component: any = tag;
    if (COMPONENT_MAP[tag]) {
        Component = COMPONENT_MAP[tag];
    } else if (initialAnimProps.initial || initialAnimProps.animate || states || effects) {
        Component = (motion as any)[tag] || (motion as any).div;
    }

    const interactionProps: Record<string, any> = {};
    if ((node as any).events) {
        const events = (node as any).events;
        if (events.onClick) {
            interactionProps.onTap = (e: any) => {
                if (onInteraction) onInteraction('onClick', events.onClick);
            };
        }
    }
    if (states) {
        if (states.hover) interactionProps.whileHover = resolveTokensInObj(states.hover, tokens);
        if (states.tap) interactionProps.whileTap = resolveTokensInObj(states.tap, tokens);
        if (states.focus) interactionProps.whileFocus = resolveTokensInObj(states.focus, tokens);
    }
    const a11yProps: Record<string, any> = {};
    if (a11y) {
        if (a11y.role) a11yProps.role = a11y.role;
        if (a11y.label) a11yProps['aria-label'] = a11y.label;
        if (a11y.description) a11yProps['aria-description'] = a11y.description;
        if (a11y.hidden !== undefined) a11yProps['aria-hidden'] = a11y.hidden;
        if (a11y.tabIndex !== undefined) a11yProps.tabIndex = a11y.tabIndex;
    }

const VOID_ELEMENTS = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);

    const isVoid = VOID_ELEMENTS.has(tag);
    const componentProps = {
        className: resolvedClassName,
        style: {
            ...resolvedStyle,
            zIndex: (id && id === focusedId) ? 100 : ((resolvedStyle && resolvedStyle.zIndex) || 1),
            filter: (resolvedStyle?.filter),
            transition: 'box-shadow 0.3s ease, z-index 0.3s ease, filter 0.3s ease'
        },
        ...sanitizeProps(props),
        ...interactionProps,
        ...a11yProps,
        initial: initialAnimProps.initial,
        animate: controls, 
        transition: initialAnimProps.transition,
        ref: (el: HTMLElement | null) => {
            elementRef.current = el;
            if (id && el) registry.current[id] = el;
        }
    };

    if (isVoid) {
        return React.createElement(Component, componentProps);
    }

    return React.createElement(Component, componentProps, spotlightOverlay, displayText || childElements);
};

const resolveTarget = (
    val: any, 
    axis: 'x' | 'y', 
    registry: Record<string, HTMLElement | null>,
    element: HTMLElement,
    rootRef: React.RefObject<HTMLDivElement>
) => {
    if (typeof val !== 'string') return val;

    const [type, targetId] = val.split(':');
    if (!targetId) return val;

    const targetEl = registry[targetId];
    if (!targetEl || !rootRef.current) return 0;

    const targetRect = targetEl.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();

    // Scale correction
    const scaleX = rootRect.width / rootRef.current.offsetWidth;
    const scale = scaleX || 1;

    if (type === 'target') {
        const parentEl = element.offsetParent || document.body;
        const parentRect = parentEl.getBoundingClientRect();
        const myRect = element.getBoundingClientRect();

        if (axis === 'x') {
            const targetCenterX = targetRect.left - parentRect.left + (targetRect.width / 2);
            const rawVal = targetCenterX - (myRect.width / 2);
            return rawVal / scale;
        } else {
            const targetCenterY = targetRect.top - parentRect.top + (targetRect.height / 2);
            const rawVal = targetCenterY - (myRect.height / 2);
            return rawVal / scale;
        }
    }

    if (type === 'camera') {
        // Calculate offset to center target in root viewport
        // This is applied to a container (like desktop-env)
        // Camera logic: We want to move container so Target is at Center of Root.
        // Diff = RootCenter - TargetCenter (Screen Space)
        // We apple this to 'x/y' of container.
        
        if (axis === 'x') {
            const targetInRootX = targetRect.left - rootRect.left;
            const targetCenterInRootX = targetInRootX + (targetRect.width / 2);
            const viewCenter = rootRect.width / 2;
            const rawVal = (viewCenter - targetCenterInRootX);
            return rawVal / scale;
        } else {
            const targetInRootY = targetRect.top - rootRect.top;
            const targetCenterInRootY = targetInRootY + (targetRect.height / 2);
            const viewCenter = rootRect.height / 2;
            const rawVal = (viewCenter - targetCenterInRootY);
            return rawVal / scale;
        }
    }

    return val;
};

interface TimelineStep {
    id: string;
    animate: any; 
    transition?: any;
    delay?: number; 
    wait?: boolean; 
    parallel?: boolean; 
    guide?: {
        target: string;
        zoom?: number;
        duration?: number;
        cursor?: boolean;
        camera?: boolean;
        opacity?: number;
    };
}

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
            return typeof content === 'string' ? JSON.parse(content) : content;
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


                  // --- Guide Logic ---
                  if (step.guide) {
                      const { target, zoom = 1.5, duration = 0.8, cursor = true, camera = true, opacity = 1 } = step.guide;
                      const targetEl = registry.current[target];
                      
                      if (targetEl && rootRef.current) {
                           // 1. Focus ID
                           setFocusedId(target);
                           animate(focusOpacity, opacity, { duration: duration * 0.5 });

                           // 2. Calculations
                           const rootRect = rootRef.current.getBoundingClientRect();
                           const targetRect = targetEl.getBoundingClientRect();
                           
                           const anims: any[] = [];
                           const trans: any = { duration, ease: "easeInOut" };

                           // 3. Camera (Zoom & Pan)
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
