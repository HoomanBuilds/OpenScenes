export interface Theme {
    id: string;
    name: string;
    description: string;
    preview_gradient: string;
    tags: string[];
    colors: Record<string, any>;
    typography: Record<string, any>;
    prompt_injection: string;
}

export const themes: Record<string, Theme> = {
    "minimal_dark": {
      "id": "minimal_dark",
      "name": "Minimal Dark",
      "description": "Clean, sophisticated dark theme. Emphasis on whitespace and typography.",
      "preview_gradient": "linear-gradient(135deg, #0a0a0a 0%, #18181b 100%)",
      "tags": ["professional", "tech", "saas", "startup"],
      "colors": {
        "background_primary": "#0a0a0a",
        "background_secondary": "#18181b",
        "text_primary": "#ffffff",
        "accent_primary": "#6366f1"
      },
      "typography": {
        "font_headline": "Inter",
        "font_body": "Inter"
      },
      "prompt_injection": "## THEME: MINIMAL DARK\n\n### Visual Philosophy\nLess is more. Use generous whitespace. Let the content breathe. Dark backgrounds with high-contrast text. Subtle accents, never overwhelming.\n\n### Color Rules\n- Background: Use #0a0a0a or #18181b for solid, or gradients between them\n- Primary text: #ffffff for headlines, #a1a1aa for body\n- Accent: #6366f1 (indigo) for highlights, buttons, accent lines\n- Secondary accent: #22c55e (green) for success states, positive metrics\n- Use accent colors sparingly - one accent element per 3-4 content elements\n\n### Typography Rules\n- Headlines: Inter Bold, 48-96px depending on importance\n- Body: Inter Regular, 18-24px\n- Keep headlines under 8 words\n- Body text max 20 words per block\n\n### Layout Patterns\n- Center-align hero content on title slides\n- Left-align body content with 60px margin\n- Use Rule of Thirds for element placement\n- Decorative shapes: circles with 0.1 opacity, positioned at edges\n\n### Animation Style\n- Smooth, subtle entrances\n- Fade and pop for text, scale for shapes\n- Stagger delays: 0.15s between elements\n- Never use more than 3 animated elements per slide\n\n### DO\n- Use glow orbs (circles, opacity 0.1-0.15) as background decoration\n- Add thin accent lines (height: 3-4px) as dividers\n- Keep element count low (3-6 per slide)\n\n### DON'T\n- Use colors outside the palette\n- Add more than 2 accent colors per slide\n- Over-animate (keep total delay under 2s)\n- Place text below y: 480 (unsafe zone)"
    },

    "minimal_light": {
      "id": "minimal_light",
      "name": "Minimal Light",
      "description": "Clean, airy light theme. Perfect for corporate and educational content.",
      "preview_gradient": "linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)",
      "tags": ["corporate", "education", "clean", "professional"],
      "colors": {
        "background_primary": "#ffffff",
        "background_secondary": "#f4f4f5",
        "text_primary": "#18181b",
        "accent_primary": "#2563eb"
      },
      "typography": {
        "font_headline": "Inter",
        "font_body": "Inter"
      },
      "prompt_injection": "## THEME: MINIMAL LIGHT\n\n### Visual Philosophy\nBright, clean, trustworthy. Ample whitespace. Soft shadows over hard borders. Professional without being sterile.\n\n### Color Rules\n- Background: #ffffff or #f4f4f5\n- Primary text: #18181b for headlines, #52525b for body\n- Accent: #2563eb (blue) for primary actions and highlights\n- Use soft gray (#e4e4e7) for card backgrounds and dividers\n- Shadows instead of borders for depth\n\n### Typography Rules\n- Headlines: Inter SemiBold, 44-80px\n- Body: Inter Regular, 18-22px\n- Slightly larger margins than dark themes (80px sides)\n- More line height (1.6) for readability\n\n### Layout Patterns\n- Generous top margins (60px+)\n- Cards with subtle shadows (no borders)\n- Content islands - group related elements in subtle containers\n- Accent lines under headings, not above\n\n### Animation Style\n- Slide animations preferred over pop\n- Shorter durations (0.5-0.7s)\n- Direction: up or right for positive content\n- Minimal decoration animation\n\n### DO\n- Use subtle shadows for depth (rgba(0,0,0,0.08))\n- Add thin accent underlines to headlines\n-Keep backgrounds simple (solid or very subtle gradients)\n\n### DON'T\n- Use dark backgrounds\n- Add glow effects (those are for dark themes)\n- Use saturated colors for large areas\n- Create low-contrast text situations"
    },

    "neon_cyberpunk": {
      "id": "neon_cyberpunk",
      "name": "Neon Cyberpunk",
      "description": "Bold, futuristic with vibrant neon accents. High energy, high contrast.",
      "preview_gradient": "linear-gradient(135deg, #0f0f23 0%, #1a0a2e 50%, #2d1f3d 100%)",
      "tags": ["gaming", "tech", "futuristic", "bold", "creative"],
      "colors": {
        "background_primary": "#0f0f23",
        "background_secondary": "#1a0a2e",
        "text_primary": "#ffffff",
        "accent_primary": "#f0abfc"
      },
      "typography": {
        "font_headline": "Outfit",
        "font_body": "Inter"
      },
      "prompt_injection": "## THEME: NEON CYBERPUNK\n\n### Visual Philosophy\nBold, electric, futuristic. Neon colors pop against deep purple-black backgrounds. Glows, gradients, and geometric shapes. Think Blade Runner meets modern UI.\n\n### Color Rules\n- Background: Deep purple-blacks (#0f0f23, #1a0a2e)\n- Primary accents: Hot pink (#f0abfc), Cyan (#22d3ee), Lime (#a3e635)\n- Text: Pure white or soft purple (#c4b5fd)\n- Use gradients freely for backgrounds\n- Glow effects on accent elements (0.2-0.3 opacity)\n\n### Typography Rules\n- Headlines: Outfit Bold, 52-100px - make them BIG\n- Body: Inter Regular, 18-24px\n- Headlines can be ALL CAPS for impact\n- Use accent colors for headline text\n\n### Layout Patterns\n- Asymmetric layouts work well\n- Geometric decorations (circles, angled lines)\n- Glowing orbs as background elements (opacity 0.2-0.3)\n- Grid patterns for tech feel\n\n### Animation Style\n- Pop and scale for impact\n- Faster animations (0.4-0.6s)\n- More elements can animate (4-5 per slide)\n- Sequential reveals work great\n\n### DO\n- Use multiple accent colors (2-3 per slide is fine)\n- Add glowing shapes as decoration\n- Use gradient backgrounds\n- Go bold with typography size\n- Add tech-inspired grid patterns\n\n### DON'T\n- Use muted or pastel colors\n- Make things look corporate or safe\n- Use light backgrounds\n- Under-animate (this theme wants energy)"
    },

    "nature_organic": {
      "id": "nature_organic",
      "name": "Nature Organic",
      "description": "Earthy, warm, natural tones. Perfect for sustainability, wellness, and lifestyle.",
      "preview_gradient": "linear-gradient(135deg, #fef3c7 0%, #d9f99d 100%)",
      "tags": ["sustainability", "wellness", "organic", "eco", "lifestyle"],
      "colors": {
        "background_primary": "#fefce8",
        "background_secondary": "#f0fdf4",
        "text_primary": "#1c1917",
        "accent_primary": "#16a34a"
      },
      "typography": {
        "font_headline": "Outfit",
        "font_body": "Inter"
      },
      "prompt_injection": "## THEME: NATURE ORGANIC\n\n### Visual Philosophy\nWarm, inviting, natural. Soft curves replace sharp corners. Earth tones with pops of green. Feels like a breath of fresh air.\n\n### Color Rules\n- Backgrounds: Warm creams (#fefce8), soft greens (#f0fdf4)\n- Text: Warm darks (#1c1917, #44403c) - never pure black\n- Primary accent: Forest green (#16a34a)\n- Secondary: Goldenrod (#ca8a04), Teal (#0d9488)\n- Gradients should be subtle, between similar warm tones\n\n### Typography Rules\n- Headlines: Outfit Medium, 40-72px - friendly, not aggressive\n- Body: Inter Regular, 18-22px\n- Higher line height (1.7) for calm reading\n- Never use ALL CAPS - feels too aggressive\n\n### Layout Patterns\n- Generous whitespace (margin: 80px)\n- Rounded corners everywhere (24px+)\n- Organic shapes as decorations (blob-like circles)\n- Image-heavy layouts work well\n\n### Animation Style\n- Slow, gentle fades (0.8-1.2s)\n- Longer stagger delays (0.2s)\n- Scale animations for growth metaphor\n- Avoid sharp, punchy animations\n\n### DO\n- Use natural image backgrounds when possible\n- Round all corners generously\n- Include nature imagery (plants, water, sky)\n- Keep contrast lower than dark themes\n- Use soft shadows\n\n### DON'T\n- Use neon or electric colors\n- Make sharp corners or hard edges\n- Use pure black or white\n- Create high-energy, aggressive layouts"
    },

    "corporate_modern": {
      "id": "corporate_modern",
      "name": "Corporate Modern",
      "description": "Professional, trustworthy, structured. Ideal for business, finance, and enterprise.",
      "preview_gradient": "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
      "tags": ["business", "finance", "enterprise", "professional", "formal"],
      "colors": {
        "background_primary": "#0f172a",
        "background_secondary": "#1e293b",
        "text_primary": "#f8fafc",
        "accent_primary": "#3b82f6"
      },
      "typography": {
        "font_headline": "Inter",
        "font_body": "Inter"
      },
      "prompt_injection": "## THEME: CORPORATE MODERN\n\n### Visual Philosophy\nTrust, clarity, competence. Structured layouts, data-driven visuals, conservative color usage. Every element has purpose.\n\n### Color Rules\n- Backgrounds: Dark blues (#0f172a, #1e293b)\n- Text: Off-white (#f8fafc) for headlines, light gray (#cbd5e1) for body\n- Primary accent: Corporate blue (#3b82f6)\n- Use success green for positive metrics, error red sparingly\n- Never use more than 2 accent colors per slide\n\n### Typography Rules\n- Headlines: Inter SemiBold, 36-64px - clear, not flashy\n- Body: Inter Regular, 16-20px\n- Data should be prominently sized\n- Labels slightly smaller than body text\n\n### Layout Patterns\n- Grid-based, structured layouts\n- Charts and data visualizations should be prominent\n- Left-aligned content for readability\n- Cards with subtle borders (#334155)\n- Clean separation between sections\n\n### Animation Style\n- Professional slide-ins (left to right)\n- Shorter durations (0.4-0.6s)\n- Minimal animation per slide (2-3 elements)\n- No playful or bouncy animations\n\n### DO\n- Use charts and data prominently\n- Create clear visual hierarchy\n- Add subtle borders to cards\n- Use icons to support text\n- Keep layouts symmetrical\n\n### DON'T\n- Use playful animations or decorations\n- Add unnecessary ornamental shapes\n- Use creative/artistic layouts\n- Break the grid structure"
    },

    "gradient_sunset": {
      "id": "gradient_sunset",
      "name": "Gradient Sunset",
      "description": "Warm, vibrant gradients with orange and pink tones. Creative and bold.",
      "preview_gradient": "linear-gradient(135deg, #f97316 0%, #db2777 50%, #7c3aed 100%)",
      "tags": ["creative", "marketing", "social", "vibrant", "bold"],
      "colors": {
        "background_primary": "#18181b",
        "background_secondary": "#27272a",
        "text_primary": "#ffffff",
        "accent_primary": "#f97316"
      },
      "typography": {
        "font_headline": "Outfit",
        "font_body": "Inter"
      },
      "prompt_injection": "## THEME: GRADIENT SUNSET\n\n### Visual Philosophy\nBold, warm, memorable. Gradients are the star. Orange-to-pink-to-purple creates visual journey. Dark backgrounds make gradients pop.\n\n### Color Rules\n- Backgrounds: Dark (#18181b) to let gradients shine\n- Gradient elements: Orange (#f97316) → Pink (#db2777) → Purple (#7c3aed)\n- Text: Pure white on dark, can use gradient colors for headlines\n- Use gradients for: buttons, accent shapes, headline backgrounds\n\n### Typography Rules\n- Headlines: Outfit Bold, 44-88px\n- Body: Inter Regular, 18-22px\n- Headlines can use gradient backgrounds with text on top\n- Warm colors (#fda4af, #fb7185) for secondary text\n\n### Layout Patterns\n- Asymmetric layouts encouraged\n- Large gradient shapes as decoration\n- Cards with gradient borders or backgrounds\n- Hero content can span full width\n\n### Animation Style\n- Scale and pop for impactful reveals\n- Medium speed (0.6-0.8s)\n- More elements can animate (4-5)\n- Stagger for rhythm\n\n### DO\n- Use gradient backgrounds on shapes\n- Create large, bold headlines\n- Layer multiple gradient elements\n- Use warm tones throughout\n- Add glow effects (0.2-0.3 opacity)\n\n### DON'T\n- Use cold colors (blue, green) as primary\n- Make gradients too subtle\n- Use light backgrounds\n- Keep things too minimal - this theme wants presence"
    },

    "retro_bit": {
      "id": "retro_bit",
      "name": "Retro 8-Bit",
      "description": "Minecraft-inspired voxel aesthetics. Blocky fonts, high contrast, vibrant primitive colors.",
      "preview_gradient": "linear-gradient(135deg, #182813 0%, #3e2723 100%)",
      "tags": ["gaming", "retro", "minecraft", "fun", "creative"],
      "colors": {
        "background_primary": "#182813",
        "background_secondary": "#3e2723",
        "text_primary": "#ffffff",
        "accent_primary": "#48d0b0"
      },
      "typography": {
        "font_headline": "Press Start 2P",
        "font_body": "VT323"
      },
      "prompt_injection": "## THEME: RETRO 8-BIT\n\n### Visual Philosophy\nThink blocks. Voxel art. Minecraft. Hard edges, no curves. Everything snaps to a grid. Vibrant, primitive colors against dirt and grass tones.\n\n### Color Rules\n- Backgrounds: Dark Dirt Brown (#3e2723) or Deep Grass Green (#182813)\n- Accents: Diamond Blue (#48d0b0), Gold Ingot Yellow (#e2a939), Emerald Green (#5a9e2f)\n- Text: White pixel text. Use Green (#a5d6a7) for secondary text.\n- High contrast is key.\n\n### Typography Rules\n- Headlines: 'Press Start 2P', 16-48px (Keep it smaller, this font is wide)\n- Body: 'VT323', 20-24px (scrolling terminal style)\n- IMPORTANT: 'Press Start 2P' only sustains weight 400. NEVER use 'bold'. Always use fontWeight: 'normal'.\n- Text should look like chat logs or item labels.\n\n### Layout Patterns\n- STRICT GRID. Align everything perfectly.\n- Containers MUST have 0px border radius.\n- Use thick borders (4px+) for cards.\n- Shadows should be solid (no blur) and offset by 4-8px.\n\n### Animation Style\n- Instant appearances or quick pops (0.3-0.4s).\n- No smooth fades. Things should 'chunk' into existence.\n- Stagger elements quickly.\n\n### DO\n- Use square/rectangular shapes exclusively.\n- Mention 'blocks', 'chunks', 'crafting', 'mining' in visual descriptions.\n- Use 4px solid borders.\n- Center hero text like a game title screen.\n\n### DON'T\n- Use rounded corners (borderRadius: 0 always).\n- Use smooth gradients.\n- Use thin, elegant fonts.\n- Make animations slow and floaty."
    },

    "manga_pop": {
      "id": "manga_pop",
      "name": "Manga Pop",
      "description": "High-energy Japanese comic style. Dramatic angles, speed lines, black & white with punchy accents.",
      "preview_gradient": "linear-gradient(135deg, #ffffff 50%, #fee2e2 50%)",
      "tags": ["comic", "manga", "bold", "action", "storytelling"],
      "colors": {
        "background_primary": "#ffffff",
        "background_secondary": "#171717",
        "text_primary": "#171717",
        "accent_primary": "#dc2626"
      },
      "typography": {
        "font_headline": "Bebas Neue",
        "font_body": "Lato"
      },
      "prompt_injection": "## THEME: MANGA POP\n\n### Visual Philosophy\nHigh impact. Comic book panels. Asymmetry. Action lines. Think 'Akira' meets modern web design. Black and white base with intensely vibrant red/yellow accents.\n\n### Color Rules\n- Backgrounds: Mostly White (#ffffff) or Jet Black (#171717).\n- Accents: Hero Red (#dc2626) and Action Yellow (#fcd34d).\n- Text: Black on White, White on Black. Huge contrast.\n\n### Typography Rules\n- Headlines: 'Bebas Neue'. HUGE. Uppercase only. Tilted or overlapping.\n- Body: 'Lato' or 'Roboto'. Clean, legible inside bubbles.\n- Use text as texture (e.g. giant '01' in background).\n\n### Layout Patterns\n- COMIC PANELS. Use thick black borders (6px+) to frame content.\n- Overlap elements wildly. Break the grid.\n- Speech bubbles for key text.\n- 'Speed lines' or diagonal slices.\n\n### Animation Style\n- FAST. 0.3s max for entrances.\n- Slide in from wild angles (corners).\n- Scale punches (bam!).\n\n### DO\n- Use black borders on everything.\n- Tilt images or text slightly (rotation).\n- Use 'halftone' dots if possible.\n- Make it feel like a page turn.\n\n### DON'T\n- Be subtle.\n- Use pastel colors.\n- Center align everything (prefer asymmetry).\n- Use slow fades."
    }
};

export const getTheme = (id: string): Theme | undefined => themes[id];
export const getAllThemes = (): Theme[] => Object.values(themes);
