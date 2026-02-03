'use client';

import React from 'react';

export type MarkdownTheme = 'dark' | 'light';

const darkTheme = {
    h1: {
        fontSize: '2.5em',
        fontWeight: '700',
        marginTop: '0.5rem',
        marginBottom: '0.25rem',
        color: '#ffffff',
        lineHeight: '1.2',
    },
    h2: {
        fontSize: '1.5em',
        fontWeight: '700',
        marginTop: '0.4rem',
        marginBottom: '0.2rem',
        color: '#ffffff',
        lineHeight: '1.25',
    },
    h3: {
        fontSize: '1.25em',
        fontWeight: '700',
        marginTop: '0.3rem',
        marginBottom: '0.15rem',
        color: '#ffffff',
        lineHeight: '1.3',
    },
    paragraph: {
        marginBottom: '0.2rem',
        color: '#e4e4e7',
        lineHeight: '1.5',
    },
    bold: {
        fontWeight: '700',
        color: '#ffffff',
    },
    italic: {
        fontStyle: 'italic',
        color: '#e4e4e7',
    },
    code: {
        backgroundColor: 'rgba(39, 39, 42, 0.8)',
        color: '#c084fc',
        paddingX: '0.375rem',
        paddingY: '0.125rem',
        borderRadius: '0.25rem',
        fontSize: '0.9em',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    codeBlock: {
        backgroundColor: 'rgba(24, 24, 27, 0.85)',
        backdropFilter: 'blur(12px)',
        color: '#e4e4e7',
        padding: '1rem',
        borderRadius: '0.75rem',
        overflow: 'auto',
        fontSize: '0.9em',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        border: '1px solid rgba(63, 63, 70, 0.5)',
        marginY: '0.5rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    },
    strikethrough: {
        textDecoration: 'line-through',
        color: '#71717a',
    },
    blockquote: {
        borderLeftWidth: '4px',
        borderLeftColor: '#a855f7',
        paddingLeft: '1rem',
        paddingY: '0.25rem',
        marginY: '0.5rem',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        color: '#d4d4d8',
        fontStyle: 'italic',
    },
    unorderedList: {
        listStyle: 'none',
        spacing: '0.25rem',
    },
    orderedList: {
        listStyle: 'decimal',
        listPosition: 'inside',
        spacing: '0.25rem',
    },
    listItem: {
        display: 'flex',
        alignItems: 'flex-start',
    },
    bulletPoint: {
        marginRight: '0.5rem',
        marginTop: '0.6em',
        width: '0.375rem',
        height: '0.375rem',
        borderRadius: '50%',
        backgroundColor: '#a855f7',
    },
};

const lightTheme = {
    h1: {
        fontSize: '2.5em',
        fontWeight: '700',
        marginTop: '0.5rem',
        marginBottom: '0.25rem',
        color: '#18181b',
        lineHeight: '1.2',
    },
    h2: {
        fontSize: '1.5em',
        fontWeight: '700',
        marginTop: '0.4rem',
        marginBottom: '0.2rem',
        color: '#18181b',
        lineHeight: '1.25',
    },
    h3: {
        fontSize: '1.25em',
        fontWeight: '700',
        marginTop: '0.3rem',
        marginBottom: '0.15rem',
        color: '#27272a',
        lineHeight: '1.3',
    },
    paragraph: {
        marginBottom: '0.2rem',
        color: '#3f3f46',
        lineHeight: '1.5',
    },
    bold: {
        fontWeight: '700',
        color: '#18181b',
    },
    italic: {
        fontStyle: 'italic',
        color: '#3f3f46',
    },
    code: {
        backgroundColor: 'rgba(228, 228, 231, 0.8)',
        color: '#7c3aed',
        paddingX: '0.375rem',
        paddingY: '0.125rem',
        borderRadius: '0.25rem',
        fontSize: '0.9em',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    codeBlock: {
        backgroundColor: 'rgba(250, 250, 250, 0.9)',
        backdropFilter: 'blur(12px)',
        color: '#27272a',
        padding: '1rem',
        borderRadius: '0.75rem',
        overflow: 'auto',
        fontSize: '0.9em',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        border: '1px solid rgba(212, 212, 216, 0.8)',
        marginY: '0.5rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    },
    strikethrough: {
        textDecoration: 'line-through',
        color: '#a1a1aa',
    },
    blockquote: {
        borderLeftWidth: '4px',
        borderLeftColor: '#7c3aed',
        paddingLeft: '1rem',
        paddingY: '0.25rem',
        marginY: '0.5rem',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        color: '#52525b',
        fontStyle: 'italic',
    },
    unorderedList: {
        listStyle: 'none',
        spacing: '0.25rem',
    },
    orderedList: {
        listStyle: 'decimal',
        listPosition: 'inside',
        spacing: '0.25rem',
    },
    listItem: {
        display: 'flex',
        alignItems: 'flex-start',
    },
    bulletPoint: {
        marginRight: '0.5rem',
        marginTop: '0.6em',
        width: '0.375rem',
        height: '0.375rem',
        borderRadius: '50%',
        backgroundColor: '#7c3aed',
    },
};

export const markdownThemes = { dark: darkTheme, light: lightTheme };

export const getMarkdownConfig = (theme: MarkdownTheme = 'dark') => {
    return theme === 'light' ? lightTheme : darkTheme;
};

export const createMarkdownComponents = (theme: MarkdownTheme = 'dark', overrideFont?: string, overrideColor?: string) => {
    const config = getMarkdownConfig(theme);
    const fontStyle = overrideFont ? { fontFamily: overrideFont } : { fontFamily: 'inherit' };
    const textColor = overrideColor || undefined;
    
    return {
        h1: ({ children }: any) => (
            <h1 style={{
                fontSize: config.h1.fontSize,
                fontWeight: config.h1.fontWeight,
                marginTop: config.h1.marginTop,
                marginBottom: config.h1.marginBottom,
                color: textColor || config.h1.color,
                lineHeight: config.h1.lineHeight,
                ...fontStyle,
            }}>{children}</h1>
        ),
        h2: ({ children }: any) => (
            <h2 style={{
                fontSize: config.h2.fontSize,
                fontWeight: config.h2.fontWeight,
                marginTop: config.h2.marginTop,
                marginBottom: config.h2.marginBottom,
                color: textColor || config.h2.color,
                lineHeight: config.h2.lineHeight,
                ...fontStyle,
            }}>{children}</h2>
        ),
        h3: ({ children }: any) => (
            <h3 style={{
                fontSize: config.h3.fontSize,
                fontWeight: config.h3.fontWeight,
                marginTop: config.h3.marginTop,
                marginBottom: config.h3.marginBottom,
                color: textColor || config.h3.color,
                lineHeight: config.h3.lineHeight,
                ...fontStyle,
            }}>{children}</h3>
        ),
        p: ({ children }: any) => (
            <p style={{
                marginBottom: config.paragraph.marginBottom,
                color: textColor || config.paragraph.color,
                lineHeight: config.paragraph.lineHeight,
                ...fontStyle,
            }}>{children}</p>
        ),
        strong: ({ children }: any) => (
            <strong style={{
                fontWeight: config.bold.fontWeight,
                color: textColor || config.bold.color,
                ...fontStyle,
            }}>{children}</strong>
        ),
        em: ({ children }: any) => (
            <em style={{
                fontStyle: config.italic.fontStyle,
                color: textColor || config.italic.color,
                ...fontStyle,
            }}>{children}</em>
        ),
        code: ({ inline, children }: any) => {
            if (!inline) {
                return <code>{children}</code>;
            }
            return (
                <code style={{
                    backgroundColor: config.code.backgroundColor,
                    color: config.code.color,
                    paddingLeft: config.code.paddingX,
                    paddingRight: config.code.paddingX,
                    paddingTop: config.code.paddingY,
                    paddingBottom: config.code.paddingY,
                    borderRadius: config.code.borderRadius,
                    fontSize: config.code.fontSize,
                    fontFamily: config.code.fontFamily,
                }}>{children}</code>
            );
        },
        pre: ({ children }: any) => (
            <pre style={{
                backgroundColor: config.codeBlock.backgroundColor,
                backdropFilter: config.codeBlock.backdropFilter,
                WebkitBackdropFilter: config.codeBlock.backdropFilter,
                color: config.codeBlock.color,
                padding: config.codeBlock.padding,
                borderRadius: config.codeBlock.borderRadius,
                overflow: config.codeBlock.overflow as any,
                fontSize: config.codeBlock.fontSize,
                fontFamily: config.codeBlock.fontFamily,
                border: config.codeBlock.border,
                marginTop: config.codeBlock.marginY,
                marginBottom: config.codeBlock.marginY,
                boxShadow: config.codeBlock.boxShadow,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}>{children}</pre>
        ),
        del: ({ children }: any) => (
            <span style={{
                textDecoration: config.strikethrough.textDecoration,
                color: config.strikethrough.color,
                ...fontStyle,
            }}>{children}</span>
        ),
        blockquote: ({ children }: any) => (
            <blockquote style={{
                borderLeftWidth: config.blockquote.borderLeftWidth,
                borderLeftStyle: 'solid',
                borderLeftColor: config.blockquote.borderLeftColor,
                paddingLeft: config.blockquote.paddingLeft,
                paddingTop: config.blockquote.paddingY,
                paddingBottom: config.blockquote.paddingY,
                marginTop: config.blockquote.marginY,
                marginBottom: config.blockquote.marginY,
                backgroundColor: config.blockquote.backgroundColor,
                color: textColor || config.blockquote.color,
                fontStyle: config.blockquote.fontStyle,
                ...fontStyle,
            }}>{children}</blockquote>
        ),
        ul: ({ children }: any) => (
            <ul style={{
                listStyle: config.unorderedList.listStyle,
                display: 'flex',
                flexDirection: 'column',
                gap: config.unorderedList.spacing,
            }}>{children}</ul>
        ),
        ol: ({ children }: any) => (
            <ol style={{
                listStyle: config.orderedList.listStyle,
                listStylePosition: config.orderedList.listPosition as any,
                display: 'flex',
                flexDirection: 'column',
                gap: config.orderedList.spacing,
            }}>{children}</ol>
        ),
        li: ({ children }: any) => (
            <li style={{
                display: config.listItem.display,
                alignItems: config.listItem.alignItems,
            }}>
                <span style={{
                    marginRight: config.bulletPoint.marginRight,
                    marginTop: config.bulletPoint.marginTop,
                    width: config.bulletPoint.width,
                    height: config.bulletPoint.height,
                    borderRadius: config.bulletPoint.borderRadius,
                    backgroundColor: textColor || config.bulletPoint.backgroundColor,
                    flexShrink: 0,
                    display: 'block',
                }} />
                <span style={{ ...fontStyle, color: textColor }}>{children}</span>
            </li>
        ),
    };
};

export const markdownComponents = createMarkdownComponents('dark');
