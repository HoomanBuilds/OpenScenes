import GalacticGrind from '../../public/templates/example/GalacticGrind.json';
import CosmicCoffee from '../../public/templates/example/CosmicCoffee.json';
import NeoTokyoComics from '../../public/templates/example/NeoTokyoComics.json';

import ThreeCard from '../../public/templates/example/custom_template/3card.json';
import GuidedCursor from '../../public/templates/example/custom_template/apiKey_guide.json';
import Cloud from '../../public/templates/example/cloud.json';

export const GENERIC_COMPONENTS: Record<string, any> = {
    'GalacticGrind': GalacticGrind,
    'CosmicCoffee': CosmicCoffee,
    'NeoTokyoComics': NeoTokyoComics
};

export const CUSTOM_COMPONENTS: Record<string, any> = {
    '3card': ThreeCard,
    'guided_cursor': GuidedCursor,
    'cloud': Cloud
};

export const COMPONENT_REGISTRY = {
    ...GENERIC_COMPONENTS,
    ...CUSTOM_COMPONENTS
};

export type ComponentId = keyof typeof COMPONENT_REGISTRY;
