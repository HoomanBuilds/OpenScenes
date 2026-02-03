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
