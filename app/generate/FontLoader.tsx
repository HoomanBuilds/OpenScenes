'use client';

import React, { useEffect, useState } from 'react';
import { Slide } from './types';

interface FontLoaderProps {
    slides: Slide[];
}

export const FontLoader: React.FC<FontLoaderProps> = ({ slides }) => {
    useEffect(() => {
        const fonts = new Set<string>();

        slides.forEach(slide => {
            slide.elements?.forEach(el => {
                if (el.fontFamily && el.fontFamily !== 'inherit') {
                    fonts.add(el.fontFamily);
                }
            });
        });

        if (fonts.size === 0) return;

        const families = Array.from(fonts).map(font => {
            const familyName = font.replace(/\s+/g, '+');
            return `family=${familyName}:wght@300;400;500;700;900`;
        });

        if (families.length > 0) {
            const url = `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
            
            // Check if link already exists
            const existingLink = document.querySelector(`link[href="${url}"]`);
            if (existingLink) return;

            // Remove other google font links managed by this component? 
            // Better to just append and let cleanup handle removal of specific one.
            
            const link = document.createElement('link');
            link.href = url;
            link.rel = 'stylesheet';
            link.dataset.initiatedBy = "FontLoader";
            document.head.appendChild(link);

            console.log('FontLoader: Loaded fonts', families);

            return () => {
                // Remove the link when fonts change or component unmounts
                if (document.head.contains(link)) {
                    document.head.removeChild(link);
                }
            };
        }
    }, [slides]);

    return null;
};
