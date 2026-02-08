import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';
import { DesignTokens } from './CustomComponent_Types';
import React from 'react';

export const COMPONENT_MAP: Record<string, any> = {
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

export const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'base'];
export const DANGEROUS_ATTRS = ['dangerouslySetInnerHTML', 'innerHTML', 'outerHTML'];
export const VOID_ELEMENTS = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);

export const sanitizeProps = (props?: Record<string, any>): Record<string, any> => {
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

export const resolveToken = (val: any, tokens?: DesignTokens): any => {
    if (typeof val !== 'string' || !val.startsWith('$') || !tokens) return val;
    const [category, key] = val.slice(1).split('.');
    if (!category || !key) return val;
    return (tokens as any)[category]?.[key] || val;
};

export const resolveTokensInObj = (obj: any, tokens?: DesignTokens): any => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return resolveToken(obj, tokens);
    const resolved: any = {};
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            resolved[key] = resolveTokensInObj(val, tokens);
        } else if (Array.isArray(val)) {
            resolved[key] = val.map((v: any) => resolveTokensInObj(v, tokens));
        } else {
            resolved[key] = resolveToken(val, tokens);
        }
    });
    return resolved;
};

export const resolveTarget = (
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

export const VALID_EASINGS = ['easeIn', 'easeOut', 'easeInOut', 'circIn', 'circOut', 'backIn', 'backOut', 'anticipate', 'linear'];

export const sanitizeEasing = (ease?: any): any => {
    if (!ease) return undefined;
    if (typeof ease !== 'string') return ease;
    
    const mapped: Record<string, string> = {
        'power1.in': 'easeIn',
        'power1.out': 'easeOut',
        'power1.inOut': 'easeInOut',
        'power2.in': 'easeIn',
        'power2.out': 'easeOut',
        'power2.inOut': 'easeInOut',
        'power3.in': 'easeIn',
        'power3.out': 'easeOut',
        'power3.inOut': 'easeInOut',
        'power4.in': 'easeIn',
        'power4.out': 'easeOut',
        'power4.inOut': 'easeInOut',
        'sine.in': 'easeIn',
        'sine.out': 'easeOut',
        'sine.inOut': 'easeInOut',
        'expo.in': 'easeIn',
        'expo.out': 'easeOut',
        'expo.inOut': 'easeInOut',
        'circ.in': 'circIn',
        'circ.out': 'circOut',
        'circ.inOut': 'easeInOut',
    };

    if (mapped[ease]) return mapped[ease];
    if (VALID_EASINGS.includes(ease)) return ease;
    
    return 'easeOut';
};

export const sanitizeRepeat = (repeat?: any): any => {
    if (repeat === undefined || repeat === null) return undefined;
    if (typeof repeat === 'string') {
        const lower = repeat.trim().toLowerCase();
        if (lower === 'infinity') return Infinity;
        const num = parseInt(lower, 10);
        return isNaN(num) ? undefined : num;
    }
    return repeat;
};

export const sanitizeTransition = (transition?: any): any => {
    if (!transition) return undefined;
    const sanitized = { ...transition };
    
    if (sanitized.repeat !== undefined) {
        sanitized.repeat = sanitizeRepeat(sanitized.repeat);
    }
    
    if (sanitized.ease) {
        sanitized.ease = sanitizeEasing(sanitized.ease);
    }
    
    if (sanitized.yoyo === true) {
        sanitized.repeatType = 'reverse';
        delete sanitized.yoyo;
    }
    
    return sanitized;
};
