import { Slide, SlideElement } from '../../../app/generate/types';
import { SlideAction } from './schema';

function generateId(prefix: string = 'el'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function findElementById(elements: SlideElement[], id: string): SlideElement | undefined {
    for (const el of elements) {
        if (el.id === id) return el;
        if (el.type === 'custom' && typeof el.content === 'object' && (el.content as any).layout) {
            const layout = (el.content as any).layout;
            if (layout.id === id) return layout as any; 
            if (layout.children && Array.isArray(layout.children)) {
                const found = findInDomTree(layout.children, id);
                if (found) return found;
            }
        }
    }
    return undefined;
}

function findInDomTree(nodes: any[], id: string): any | undefined {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children && Array.isArray(node.children)) {
            const found = findInDomTree(node.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

function findParentAndIndex(nodes: any[], targetId: string): { parentArray: any[], index: number } | undefined {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === targetId) {
            return { parentArray: nodes, index: i };
        }
        if (node.children && Array.isArray(node.children)) {
            const found = findParentAndIndex(node.children, targetId);
            if (found) return found;
        }
    }
    return undefined;
}

function applyUpdate(element: any, properties: Record<string, any>) {
    if (!properties) return;

    const textVal = properties.text || properties.content;
    
    if (textVal !== undefined) {
        if (element.content !== undefined && typeof element.content === 'string') {
            element.content = textVal;
        } else if (element.text !== undefined && typeof element.text === 'string') {
            element.text = textVal;
        }
    }

    Object.assign(element, properties);
    if (properties.style && element.style) {
        Object.assign(element.style, properties.style);
    }
    if (properties.className && element.className) {
        element.className = properties.className;
    }
}

function applyAdd(slide: Slide, action: any) {
    if (!action.structure) {
        console.warn('[Executor] ADD_COMPONENT missing structure');
        return;
    }

    const newComponent: any = {
        id: action.elementId || generateId('el'),
        type: action.elementType || 'custom',
        x: 0,
        y: 0,
        width: 1000,
        height: 562,
        content: action.structure,
    };
    
    console.log("ADD_COMPONENT DEBUG:");
    console.log("Parent:", action.parentId);
    console.log("Component:", newComponent.id);
    console.log("Position:", action.position, "Ref:", action.referenceId);

    let targetArray: any[] = slide.elements || [];
    let insertionIndex: number = targetArray.length;

    if (action.referenceId) {
        const result = findParentAndIndex(slide.elements || [], action.referenceId);
        if (result) {
            targetArray = result.parentArray;
            if (action.position === 'before') {
                insertionIndex = result.index;
            } else if (action.position === 'after') {
                insertionIndex = result.index + 1;
            } else {
                insertionIndex = result.index + 1;
            }
        }
    } else if (action.parentId && action.parentId !== 'root' && action.parentId !== slide.id) {
        const parent = findElementById(slide.elements || [], action.parentId);
        if (parent) {
            if (parent.type === 'custom' && (parent.content as any).layout) {
                targetArray = (parent.content as any).layout.children || [];
                insertionIndex = targetArray.length; // Append inside
            }
        } else {
             for (const el of slide.elements || []) {
                 if (el.type === 'custom' && (el.content as any).layout) {
                     const domParent = findInDomTree([(el.content as any).layout], action.parentId);
                     if (domParent && domParent.children) {
                         targetArray = domParent.children;
                         insertionIndex = targetArray.length;
                         break;
                     }
                 }
             }
        }
    }

    if (!slide.elements) slide.elements = [];
    
    const isRootLevel = targetArray === slide.elements;
    
    if (isRootLevel) {
        targetArray.splice(insertionIndex, 0, newComponent);
        console.log(`Inserted into slide.elements at index ${insertionIndex}`);
    } else {
        targetArray.splice(insertionIndex, 0, action.structure.layout || action.structure);
        console.log(`Inserted into nested container children at index ${insertionIndex}`);
    }
}

function applyRemove(slide: Slide, id: string) {
    if (!slide.elements) return;
    
    const initialLength = slide.elements.length;
    slide.elements = slide.elements.filter(el => el.id !== id);
    if (slide.elements.length < initialLength) return; 

    for (const el of slide.elements) {
        if (el.type === 'custom' && (el.content as any).layout) {
            removeFromDom((el.content as any).layout, id);
        }
    }
}

function removeFromDom(node: any, id: string) {
    if (!node.children || !Array.isArray(node.children)) return;
    
    const initialLen = node.children.length;
    node.children = node.children.filter((child: any) => child.id !== id);
    
    if (node.children.length < initialLen) return; 
    
    for (const child of node.children) {
        removeFromDom(child, id);
    }
}

function applyAnimationUpdate(slide: Slide, targetId: string, properties: Record<string, any>) {
    // 1. Check top-level elements first
    const topElement = slide.elements?.find(el => el.id === targetId);
    if (topElement) {
        console.log(`[Executor]   -> Updating animation on top-level element ${targetId}`);
        if (!topElement.animation) topElement.animation = { type: 'fade', duration: 1, delay: 0 };
        Object.assign(topElement.animation, properties);
        
        // Also update direct properties if they are specified (like rotation, scale)
        const visualProps = ['rotation', 'scale', 'opacity', 'x', 'y', 'width', 'height'];
        for (const prop of visualProps) {
            if (properties[prop] !== undefined) {
                (topElement as any)[prop] = properties[prop];
            }
        }
        return;
    }

    // 2. Search inside custom elements
    for (const el of slide.elements || []) {
        if (el.type === 'custom' && el.content && typeof el.content === 'object') {
            const content = el.content as any;
            if (content.animations) {
                if (content.animations[targetId]) {
                    content.animations[targetId].initial = {
                        ...(content.animations[targetId].initial || {}),
                        ...properties
                    };
                    return;
                }
                const found = findInDomTree([content.layout], targetId);
                if (found) {
                     if (!content.animations[targetId]) content.animations[targetId] = { initial: {} };
                     content.animations[targetId].initial = {
                         ...content.animations[targetId].initial,
                         ...properties
                     };
                     return;
                }
            }
        }
    }
}

function applyTimelineUpdate(slide: Slide, step: any, index?: number, position: 'before' | 'after' | 'replace' | 'append' = 'append') {
     for (const el of slide.elements || []) {
        if (el.type === 'custom' && el.content && typeof el.content === 'object') {
            const content = el.content as any;
            if (content.timeline && Array.isArray(content.timeline)) {
                const targetIdx = index !== undefined ? index : content.timeline.length;
                
                switch (position) {
                    case 'replace':
                        if (index !== undefined) content.timeline[index] = { ...content.timeline[index], ...step };
                        break;
                    case 'before':
                        content.timeline.splice(targetIdx, 0, step);
                        break;
                    case 'after':
                        content.timeline.splice(targetIdx + 1, 0, step);
                        break;
                    case 'append':
                    default:
                        content.timeline.push(step);
                        break;
                }
                return;
            }
        }
    }
}

function applyMove(slide: Slide, targetId: string, referenceId: string, position: 'before' | 'after' | 'inside') {
    let targetEl: SlideElement | undefined;
    
    const topIdx = slide.elements?.findIndex(e => e.id === targetId);
    if (topIdx !== undefined && topIdx !== -1) {
        targetEl = slide.elements?.splice(topIdx, 1)[0];
    }
    
    if (!targetEl) {
        for (const el of slide.elements || []) {
            if (el.type === 'custom' && el.content && (el.content as any).layout) {
                const parent = findParentInDomTree([(el.content as any).layout], targetId);
                if (parent && parent.children) {
                    const idx = parent.children.findIndex((c: any) => c.id === targetId);
                    targetEl = parent.children.splice(idx, 1)[0];
                    break;
                }
            }
        }
    }

    if (!targetEl) return;

    if (position === 'inside') {
        const parent = findElementById(slide.elements || [], referenceId);
        if (parent && parent.type === 'custom' && (parent.content as any).layout) {
            const layout = (parent.content as any).layout;
            if (!layout.children) layout.children = [];
            layout.children.push(targetEl);
        }
    } else {
        if (!slide.elements) slide.elements = [];
        const refIdx = slide.elements.findIndex(e => e.id === referenceId);
        if (refIdx !== -1) {
            slide.elements.splice(position === 'before' ? refIdx : refIdx + 1, 0, targetEl);
        } else {
            slide.elements.push(targetEl);
        }
    }
}

function findParentInDomTree(nodes: any[], targetId: string): any | null {
    for (const node of nodes) {
        if (node.children && node.children.some((c: any) => c.id === targetId)) {
            return node;
        }
        if (node.children) {
            const found = findParentInDomTree(node.children, targetId);
            if (found) return found;
        }
    }
    return null;
}

export function executeActions(slide: Slide, actions: SlideAction[]): Slide {
    const newSlide = JSON.parse(JSON.stringify(slide));
    console.log(`[Executor] Starting execution of ${actions.length} actions...`);
    
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i] as any;
        const actionType = action.action;
        const targetId = action.targetId || action.elementId;
        
        console.log(`[Executor] [Action ${i+1}/${actions.length}] ${actionType} targeting ${targetId || action.parentId || 'unknown'}`);
        
        try {
            switch (actionType) {
                case 'REPLACE_SLIDE':
                    console.log(`[Executor]   -> Replacing entire slide content`);
                    newSlide.elements = action.elements || [];
                    if (action.background) newSlide.background = action.background;
                    break;
                case 'UPDATE_STYLE': {
                    const { properties } = action;
                    if (targetId === newSlide.id) {
                        console.log(`[Executor]   -> Updating slide background`);
                        if (properties.background) {
                            newSlide.background = { ...newSlide.background, ...properties.background };
                        } else {
                            applyUpdate(newSlide, properties);
                        }
                    } else {
                        const target = findElementById(newSlide.elements || [], targetId);
                        if (target) {
                            console.log(`[Executor]   -> Updating element style: ${targetId}`);
                            applyUpdate(target, properties);
                        } else {
                            let foundNested = false;
                            for (const el of newSlide.elements || []) {
                                if (el.type === 'custom' && (el.content as any).layout) {
                                    const domTarget = findInDomTree([(el.content as any).layout], targetId);
                                    if (domTarget) {
                                        console.log(`[Executor]   -> Updating nested element style: ${targetId}`);
                                        applyUpdate(domTarget, properties);
                                        foundNested = true;
                                        break;
                                    }
                                }
                            }
                            if (!foundNested) console.warn(`[Executor]   ⚠️ Target ${targetId} not found for UPDATE_STYLE`);
                        }
                    }
                    break;
                }
                case 'UPDATE_CONTENT': {
                    const { properties } = action;
                    const target = findElementById(newSlide.elements || [], targetId);
                    if (target) {
                        console.log(`[Executor]   -> Updating element content: ${targetId}`);
                        applyUpdate(target, properties);
                    } else {
                        let foundNested = false;
                        for (const el of newSlide.elements || []) {
                            if (el.type === 'custom' && (el.content as any).layout) {
                                const domTarget = findInDomTree([(el.content as any).layout], targetId);
                                if (domTarget) {
                                    console.log(`[Executor]   -> Updating nested element content: ${targetId}`);
                                    applyUpdate(domTarget, properties);
                                    foundNested = true;
                                    break;
                                }
                            }
                        }
                        if (!foundNested) console.warn(`[Executor]   ⚠️ Target ${targetId} not found for UPDATE_CONTENT`);
                    }
                    break;
                }
                case 'ADD_COMPONENT':
                    console.log(`[Executor]   -> Adding ${action.elementType || 'custom'} component: ${action.elementId} to ${action.parentId}`);
                    applyAdd(newSlide, action);
                    break;
                case 'REMOVE_COMPONENT':
                    console.log(`[Executor]   -> Removing element: ${action.targetId}`);
                    applyRemove(newSlide, action.targetId);
                    break;
                case 'UPDATE_ANIMATION':
                    console.log(`[Executor]   -> Updating animation for: ${action.targetId}`);
                    applyAnimationUpdate(newSlide, action.targetId, action.properties);
                    break;
                case 'UPDATE_TIMELINE':
                    console.log(`[Executor]   -> Updating timeline step (position: ${(action as any).position || 'append'})`);
                    applyTimelineUpdate(newSlide, action.timelineStep, action.timelineIndex, (action as any).position);
                    break;
                case 'MOVE_COMPONENT': {
                    const refId = (action as any).parentId || 'root';
                    console.log(`[Executor]   -> Moving ${action.targetId} relative to ${refId} (${(action as any).position})`);
                    applyMove(newSlide, action.targetId, refId, (action as any).position || 'inside');
                    break;
                }
            }
        } catch (e) {
            console.error(`[Executor] ❌ Failed to execute action ${action.action}:`, e);
        }
    }
    
    console.log(`[Executor] Execution complete.`);
    return newSlide;
}
