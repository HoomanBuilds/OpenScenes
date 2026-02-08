
import { TitleModernBoldSchema, FeatureGridSchema } from '../lib/ai/templates';

const testTitle = {
    title: "Future Presentation Unveiled", // 28 chars (was failing limit 25)
    subtitle: "Discover OpenScenes AI's Innovations and more cool stuff",
    bgImageQuery: "abstract dark cinematic",
    theme: 'modern'
};

const testFeature = {
    heading: "Key Innovations and Features",
    features: [
        {
            title: "AI-Powered Content Generation", // 29 chars (was failing limit 20)
            description: "Automates the creation of compelling marketing copy.",
            icon: "sparkles"
        },
        {
            title: "Dynamic Visual Storytelling",
            description: "Transforms data into engaging visual narratives.",
            icon: "gallery-vertical"
        },
        {
            title: "Seamless Workflow Integration",
            description: "Connects effortlessly with your existing tools.",
            icon: "workflow"
        }
    ],
    theme: 'modern'
};

try {
    TitleModernBoldSchema.parse(testTitle);
    console.log('Title Validation Passed');
} catch (e) {
    console.error('Title Validation Failed', e);
}

try {
    FeatureGridSchema.parse(testFeature);
    console.log('Feature Validation Passed');
} catch (e) {
    console.error('Feature Validation Failed', e);
}
