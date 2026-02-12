import React from 'react';
import { motion, useAnimation, useTransform, useMotionTemplate } from 'framer-motion';
import { CustomNode, AnimationConfig, DesignTokens } from './CustomComponent_Types';
import { 
    COMPONENT_MAP, DANGEROUS_TAGS, VOID_ELEMENTS, 
    sanitizeProps, resolveToken, resolveTokensInObj, resolveTarget, sanitizeEasing, sanitizeTransition 
} from './CustomComponent_Utils';

interface RenderNodeProps {
    node: CustomNode;
    animationMap?: Record<string, AnimationConfig>;
    registry: React.MutableRefObject<Record<string, HTMLElement | null>>;
    rootRef: React.RefObject<HTMLDivElement>;
    onInteraction?: (type: string, payload: any) => void;
    tokens?: DesignTokens;
    mouse?: { x: any, y: any };
    focusedId?: string | null;
    overrides?: Record<string, any>;
}

export const RenderNode: React.FC<RenderNodeProps> = ({ node, animationMap, registry, rootRef, onInteraction, tokens, mouse, focusedId, overrides }) => {
    const { id, tag, className, style, text, children, props, states, a11y, effects, typing } = node;
    const controls = useAnimation();
    const elementRef = React.useRef<HTMLElement | null>(null);
    const initialText = text || (typeof children === 'string' ? children : "");
    const [displayText, setDisplayText] = React.useState(initialText);

    if (!tag || DANGEROUS_TAGS.includes(tag.toLowerCase())) return null;

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

    if (initialAnimProps.transition) {
        initialAnimProps.transition = sanitizeTransition(initialAnimProps.transition);
    }

    const myOverrides = (id && overrides) ? overrides[id] : null;

    React.useEffect(() => {
        if (id && elementRef.current) {
            registry.current[id] = elementRef.current;
        }
    }, [id]);

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

    React.useEffect(() => {
        const resolveAndAnimate = async () => {
             if (id && elementRef.current) {
                registry.current[id] = elementRef.current;
            }
            
            if (myOverrides) return;

            if (!initialAnimProps.animate) return;

            const animateDef = { ...initialAnimProps.animate };
            let hasDynamicTargets = false;

            const resolveTargetOffset = (targetId: string, axis: 'x' | 'y') => {
                 const targetEl = registry.current[targetId];
                 const myEl = elementRef.current;
                 if (!targetEl || !myEl || !rootRef.current) return 0;
                 const parentEl = myEl.offsetParent || document.body;
                 const targetRect = targetEl.getBoundingClientRect();
                 const parentRect = parentEl.getBoundingClientRect();
                 const myRect = myEl.getBoundingClientRect();
                 const rootDOM = rootRef.current;

                 const scaleX = rootDOM.getBoundingClientRect().width / rootDOM.offsetWidth;
                 const scale = scaleX || 1;

                  if (axis === 'x') {
                      const targetCenter = targetRect.left + (targetRect.width / 2);
                      const myCenter = myRect.left + (myRect.width / 2);
                      return (targetCenter - myCenter) / scale;
                  } else {
                      const targetCenter = targetRect.top + (targetRect.height / 2);
                      const myCenter = myRect.top + (myRect.height / 2);
                      return (targetCenter - myCenter) / scale;
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
    }, [id, initialAnimProps, registry, myOverrides]);  

    if (effects && mouse) {
        if (effects.parallax) {
             const strength = typeof effects.parallax === 'object' ? (effects.parallax.strength || 20) : 20;
             resolvedStyle.x = useTransform(mouse.x, [0, 1], [-strength, strength]);
             resolvedStyle.y = useTransform(mouse.y, [0, 1], [-strength, strength]);
        }
    }
    
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

    const childElements = Array.isArray(children) ? children.map((child, index) => (
        <RenderNode key={index} node={child} animationMap={animationMap} registry={registry} rootRef={rootRef} onInteraction={onInteraction} tokens={tokens} mouse={mouse} focusedId={focusedId} overrides={overrides} />
    )) : null;

    let Component: any = tag;
    if (COMPONENT_MAP[tag]) {
        Component = COMPONENT_MAP[tag];
    } else if (initialAnimProps.initial || initialAnimProps.animate || states || effects || myOverrides) {
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

    const isVoid = VOID_ELEMENTS.has(tag);
    
    const componentProps = {
        className: resolvedClassName,
        style: (() => {
            const classList = resolvedClassName?.split(/\s+/) || [];
            const isGradientText = classList.includes('bg-clip-text');
            
            return {
                fontFamily: (elementRef.current?.style.fontFamily) || 'Inter, sans-serif',
                ...resolvedStyle,
                zIndex: (id && id === focusedId) ? 100 : ((resolvedStyle && resolvedStyle.zIndex) || 1),
                filter: (resolvedStyle?.filter),
                ...(isGradientText ? {
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                    display: tag === 'span' ? 'inline-block' : resolvedStyle?.display,
                } : {}),
                ...(classList.includes('text-transparent') ? {
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                } : {}),
                isolation: isGradientText ? 'isolate' : resolvedStyle?.isolation,
            };
        })(),
        ...sanitizeProps(props),
        ...interactionProps,
        ...a11yProps,
        initial: myOverrides ? false : initialAnimProps.initial, 
        animate: myOverrides || controls, 
        transition: myOverrides ? { duration: 0 } : initialAnimProps.transition,
        ref: (el: HTMLElement | null) => {
            elementRef.current = el;
            if (id && el) registry.current[id] = el;
        }
    };

    if (isVoid) {
        return React.createElement(Component, componentProps);
    }

    return React.createElement(Component, componentProps, displayText || childElements, spotlightOverlay);
};
