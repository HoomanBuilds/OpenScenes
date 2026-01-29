import { RegistryComponentType } from "./schema";
import React from 'react';
import { TitleCenterFade } from "./components/TitleCenterFade";
import { TitleSubtitleStack } from "./components/TitleSubtitleStack";
import { FullscreenStatement } from "./components/FullscreenStatement";
import { AccentLineReveal } from "./components/AccentLineReveal";
import { BackgroundGradient } from "./components/BackgroundGradient";

export type RegistryMap = Record<RegistryComponentType, React.ComponentType<any>>;

export const REGISTRY: RegistryMap = {
  TITLE_CENTER_FADE: TitleCenterFade,
  TITLE_SUBTITLE_STACK: TitleSubtitleStack,
  FULLSCREEN_STATEMENT: FullscreenStatement,
  BACKGROUND_GRADIENT: BackgroundGradient, // If used as a main component, else it's a wrapper usually. But Schema allows it as 'component'.
  ACCENT_LINE_REVEAL: AccentLineReveal,
};

export const getComponent = (key: RegistryComponentType) => {
    return REGISTRY[key];
}
