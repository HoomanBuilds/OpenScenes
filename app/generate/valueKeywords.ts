'use client';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 562;

export const valueKeywords: Record<string, Record<string, string | number>> = {
    width: {
        full: CANVAS_WIDTH,
        half: CANVAS_WIDTH / 2,
        third: CANVAS_WIDTH / 3,
        quarter: CANVAS_WIDTH / 4,
        twoThirds: (CANVAS_WIDTH * 2) / 3,
        threeQuarters: (CANVAS_WIDTH * 3) / 4,
        small: 200,
        medium: 400,
        large: 600,
        xl: 800,
    },
    height: {
        full: CANVAS_HEIGHT,
        half: CANVAS_HEIGHT / 2,
        third: CANVAS_HEIGHT / 3,
        quarter: CANVAS_HEIGHT / 4,
        twoThirds: (CANVAS_HEIGHT * 2) / 3,
        threeQuarters: (CANVAS_HEIGHT * 3) / 4,
        small: 50,
        medium: 100,
        large: 200,
        xl: 300,
        heading: 80,
        subheading: 60,
        text: 40,
    },
    x: {
        left: 0,
        center: CANVAS_WIDTH / 2,
        right: CANVAS_WIDTH,
        leftMargin: 50,
        rightMargin: CANVAS_WIDTH - 50,
        leftThird: CANVAS_WIDTH / 3,
        rightThird: (CANVAS_WIDTH * 2) / 3,
        leftQuarter: CANVAS_WIDTH / 4,
        rightQuarter: (CANVAS_WIDTH * 3) / 4,
    },
    y: {
        top: 0,
        center: CANVAS_HEIGHT / 2,
        bottom: CANVAS_HEIGHT,
        topMargin: 40,
        bottomMargin: CANVAS_HEIGHT - 40,
        topThird: CANVAS_HEIGHT / 3,
        bottomThird: (CANVAS_HEIGHT * 2) / 3,
        topQuarter: CANVAS_HEIGHT / 4,
        bottomQuarter: (CANVAS_HEIGHT * 3) / 4,
    },
    fontSize: {
        xs: 14,
        small: 18,
        medium: 24,
        large: 32,
        xl: 48,
        xxl: 60,
        heading: 60,
        subheading: 32,
        body: 24,
        caption: 16,
        title: 72,
    },
    textColor: {
        primary: '#ffffff',
        secondary: '#d4d4d8',
        muted: '#71717a',
        accent: '#a855f7',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#ef4444',
        info: '#3b82f6',
        brand: '#6366f1',
        dark: '#18181b',
        light: '#fafafa',
    },
    color: {
        primary: '#ffffff',
        secondary: '#d4d4d8',
        muted: '#71717a',
        accent: '#a855f7',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#ef4444',
        info: '#3b82f6',
        brand: '#6366f1',
        dark: '#18181b',
        light: '#fafafa',
        purple: '#a855f7',
        green: '#34d399',
        blue: '#3b82f6',
        red: '#ef4444',
        yellow: '#fbbf24',
        indigo: '#6366f1',
        zinc: '#27272a',
    },
    backgroundColor: {
        dark: '#18181b',
        darker: '#09090b',
        light: '#fafafa',
        muted: '#27272a',
        accent: '#a855f7',
        brand: '#6366f1',
        transparent: 'transparent',
    },
    fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },
    textAlign: {
        left: 'left',
        center: 'center',
        right: 'right',
    },
    verticalAlign: {
        top: 'top',
        center: 'center',
        bottom: 'bottom',
    },
    opacity: {
        invisible: 0,
        faint: 0.1,
        light: 0.25,
        medium: 0.5,
        strong: 0.75,
        full: 1,
    },
    borderRadius: {
        none: 0,
        small: 4,
        medium: 8,
        large: 12,
        xl: 16,
        xxl: 24,
        full: 9999,
        rounded: 8,
        pill: 9999,
    },
    zIndex: {
        back: 0,
        default: 1,
        front: 2,
        overlay: 10,
        modal: 100,
    },
    duration: {
        fast: 0.3,
        normal: 0.6,
        slow: 1,
        verySlow: 1.5,
    },
    delay: {
        none: 0,
        short: 0.2,
        medium: 0.5,
        long: 1,
    },
    spacing: {
        none: 0,
        xs: 4,
        small: 8,
        medium: 16,
        large: 24,
        xl: 32,
        xxl: 48,
    },
};

export function resolveValue(
    category: string,
    value: string | number | undefined
): string | number | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return value;
    if (!isNaN(Number(value))) return Number(value);
    if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'))) {
        return value;
    }
    const keywords = valueKeywords[category];
    if (keywords && typeof value === 'string' && value in keywords) {
        return keywords[value];
    }
    return value;
}

export function resolveElementValues<T extends Record<string, unknown>>(element: T): T {
    const resolved = { ...element } as Record<string, unknown>;
    
    if ('width' in resolved) resolved.width = resolveValue('width', resolved.width as string | number);
    if ('height' in resolved) resolved.height = resolveValue('height', resolved.height as string | number);
    
    if ('x' in resolved) {
        const originalX = resolved.x;
        const x = resolveValue('x', resolved.x as string | number);
        if (originalX === 'center' && 'width' in resolved) {
            const width = typeof resolved.width === 'number' ? resolved.width : CANVAS_WIDTH;
            resolved.x = (CANVAS_WIDTH - width) / 2;
        } else {
            resolved.x = x;
        }
    }
    
    if ('y' in resolved) {
        const originalY = resolved.y;
        const y = resolveValue('y', resolved.y as string | number);
        if (originalY === 'center' && 'height' in resolved) {
            const height = typeof resolved.height === 'number' ? resolved.height : CANVAS_HEIGHT;
            resolved.y = (CANVAS_HEIGHT - height) / 2;
        } else {
            resolved.y = y;
        }
    }
    
    if ('fontSize' in resolved) resolved.fontSize = resolveValue('fontSize', resolved.fontSize as string | number);
    if ('textColor' in resolved) resolved.textColor = resolveValue('textColor', resolved.textColor as string | number);
    if ('color' in resolved) resolved.color = resolveValue('color', resolved.color as string | number);
    if ('backgroundColor' in resolved) resolved.backgroundColor = resolveValue('backgroundColor', resolved.backgroundColor as string | number);
    if ('fontWeight' in resolved) resolved.fontWeight = resolveValue('fontWeight', resolved.fontWeight as string | number);
    if ('textAlign' in resolved) resolved.textAlign = resolveValue('textAlign', resolved.textAlign as string | number);
    if ('verticalAlign' in resolved) resolved.verticalAlign = resolveValue('verticalAlign', resolved.verticalAlign as string | number);
    if ('opacity' in resolved) resolved.opacity = resolveValue('opacity', resolved.opacity as string | number);
    if ('borderRadius' in resolved) resolved.borderRadius = resolveValue('borderRadius', resolved.borderRadius as string | number);
    if ('zIndex' in resolved) resolved.zIndex = resolveValue('zIndex', resolved.zIndex as string | number);
    
    if (resolved.animation && typeof resolved.animation === 'object') {
        const animation = { ...resolved.animation } as Record<string, unknown>;
        if ('duration' in animation) animation.duration = resolveValue('duration', animation.duration as string | number);
        if ('delay' in animation) animation.delay = resolveValue('delay', animation.delay as string | number);
        resolved.animation = animation;
    }
    
    return resolved as T;
}

export function resolveSlideValues<T extends { elements?: unknown[] }>(slide: T): T {
    if (!slide.elements) return slide;
    return { ...slide, elements: slide.elements.map((el) => resolveElementValues(el as Record<string, unknown>)) };
}

export function resolvePresentationValues<T extends { slides?: unknown[] }>(presentation: T): T {
    if (!presentation.slides) return presentation;
    return { ...presentation, slides: presentation.slides.map((s) => resolveSlideValues(s as { elements?: unknown[] })) };
}

export const CANVAS = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
