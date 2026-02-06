import GalacticGrind from '../../app/generate/templates/example/jsonTemplate/GalacticGrind.json';
import CosmicCoffee from '../../app/generate/templates/example/jsonTemplate/CosmicCoffee.json';
import NeoTokyoComics from '../../app/generate/templates/example/jsonTemplate/NeoTokyoComics.json';

// Simple registry mapping component IDs to their full JSON structure
// This allows the AI to "see" the component it is supposed to copy.
export const COMPONENT_REGISTRY: Record<string, any> = {
    'GalacticGrind': GalacticGrind,
    'CosmicCoffee': CosmicCoffee,
    'NeoTokyoComics': NeoTokyoComics
};

export type ComponentId = keyof typeof COMPONENT_REGISTRY;
