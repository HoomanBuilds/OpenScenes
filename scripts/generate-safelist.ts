
import fs from 'fs';
import path from 'path';

const COLORS = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const OPACITIES = ['0', '5', '10', '20', '25', '30', '40', '50', '60', '70', '75', '80', '90', '95', '100'];

const SPACING = [
  '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', 
  '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96'
];

const FRACTIONS = ['1/2', '1/3', '2/3', '1/4', '2/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/6', '2/6', '3/6', '4/6', '5/6', '1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', 'full', 'screen', 'min', 'max', 'fit'];

function generateSafelist() {
  const classes: string[] = [];

  // 1. COLORS (bg, text, border, etc.)
  // We won't do EVERY combination of /opacity to save some size, but we'll do base colors.
  // AI usually outputs `bg-blue-500` or `bg-blue-500/10`.
  const colorPrefixes = ['bg', 'text', 'border', 'outline', 'shadow', 'ring', 'accent', 'decoration', 'fill', 'stroke'];
  
  classes.push('// --- COLORS ---');
  COLORS.forEach(color => {
    SHADES.forEach(shade => {
      colorPrefixes.forEach(prefix => {
        classes.push(`${prefix}-${color}-${shade}`);
        if (prefix === 'bg' || prefix === 'text' || prefix === 'border') {
             classes.push(`${prefix}-${color}-${shade}/5`);
             classes.push(`${prefix}-${color}-${shade}/10`);
             classes.push(`${prefix}-${color}-${shade}/20`);
             classes.push(`${prefix}-${color}-${shade}/30`);
             classes.push(`${prefix}-${color}-${shade}/40`);
             classes.push(`${prefix}-${color}-${shade}/50`);
             classes.push(`${prefix}-${color}-${shade}/60`);
             classes.push(`${prefix}-${color}-${shade}/70`);
             classes.push(`${prefix}-${color}-${shade}/80`);
             classes.push(`${prefix}-${color}-${shade}/90`);
        }
      });
    });
  });
  
  classes.push('// --- BASE COLORS ---');
  ['white', 'black', 'transparent', 'current'].forEach(col => {
     colorPrefixes.forEach(prefix => {
        classes.push(`${prefix}-${col}`);
        if(col !== 'transparent' && col !== 'current') {
             classes.push(`${prefix}-${col}/10`);
             classes.push(`${prefix}-${col}/20`);
             classes.push(`${prefix}-${col}/50`);
             classes.push(`${prefix}-${col}/80`);
        }
     });
  });

  // 2. SPACING (p, m, gap, -m)
  classes.push('// --- SPACING ---');
  const spacingPrefixes = ['p', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'pt', 'pr', 'pb', 'pl', 'px', 'py', 'gap', 'gap-x', 'gap-y', 'space-x', 'space-y', 'indent', 'scroll-p', 'scroll-m', 'top', 'right', 'bottom', 'left', 'inset'];
  
  spacingPrefixes.forEach(prefix => {
    SPACING.forEach(space => {
      classes.push(`${prefix}-${space}`);
    });
  });
  // Negative margins
  ['-m', '-mt', '-mr', '-mb', '-ml', '-mx', '-my', '-top', '-right', '-bottom', '-left'].forEach(prefix => {
      SPACING.forEach(space => {
          classes.push(`${prefix}-${space}`);
      });
  });

  // 3. SIZING (w, h, min-w, max-w, etc)
  classes.push('// --- SIZING ---');
  const sizePrefixes = ['w', 'h', 'min-w', 'max-w', 'min-h', 'max-h', 'basis'];
  sizePrefixes.forEach(prefix => {
    SPACING.forEach(space => {
      classes.push(`${prefix}-${space}`);
    });
    FRACTIONS.forEach(frac => {
       classes.push(`${prefix}-${frac}`); 
    });
  });

  // 4. TYPOGRAPHY
  classes.push('// --- TYPOGRAPHY ---');
  ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'].forEach(c => classes.push(c));
  ['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'].forEach(c => classes.push(c));
  ['leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose'].forEach(c => classes.push(c));
  ['tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest'].forEach(c => classes.push(c));
  ['text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end'].forEach(c => classes.push(c));
  ['uppercase', 'lowercase', 'capitalize', 'normal-case'].forEach(c => classes.push(c));
  ['truncate', 'text-ellipsis', 'text-clip'].forEach(c => classes.push(c));

  // 5. FLEX & GRID
  classes.push('// --- FLEX & GRID ---');
  classes.push('flex', 'inline-flex', 'grid', 'inline-grid', 'hidden', 'block', 'inline-block');
  ['flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse'].forEach(c => classes.push(c));
  ['flex-wrap', 'flex-wrap-reverse', 'flex-nowrap'].forEach(c => classes.push(c));
  ['items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'].forEach(c => classes.push(c));
  ['justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'].forEach(c => classes.push(c));
  ['content-start', 'content-end', 'content-center', 'content-between', 'content-around', 'content-evenly'].forEach(c => classes.push(c));
  ['self-auto', 'self-start', 'self-end', 'self-center', 'self-stretch', 'self-baseline'].forEach(c => classes.push(c));
  ['grow', 'grow-0', 'shrink', 'shrink-0'].forEach(c => classes.push(c));
  ['col-auto', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8', 'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12', 'col-span-full'].forEach(c => classes.push(c));
  ['row-auto', 'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4', 'row-span-5', 'row-span-6', 'row-span-full'].forEach(c => classes.push(c));
  ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11', 'grid-cols-12', 'grid-cols-none'].forEach(c => classes.push(c));
  ['grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5', 'grid-rows-6', 'grid-rows-none'].forEach(c => classes.push(c));

  // 6. BORDERS & EFFECTS (Defined in colors, but specific styles)
  classes.push('// --- BORDERS & EFFECTS ---');
  ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full'].forEach(c => classes.push(c));
  ['rounded-t-lg', 'rounded-r-lg', 'rounded-b-lg', 'rounded-l-lg', 'rounded-tl-lg', 'rounded-tr-lg', 'rounded-br-lg', 'rounded-bl-lg'].forEach(c => classes.push(c)); // Simplified to lg for brevity, AI uses standard mostly.
  ['border-0', 'border', 'border-2', 'border-4', 'border-8', 'border-x', 'border-y'].forEach(c => classes.push(c));
  ['border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-hidden', 'border-none'].forEach(c => classes.push(c));
  ['shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner', 'shadow-none'].forEach(c => classes.push(c));
  ['opacity-0', 'opacity-5', 'opacity-10', 'opacity-20', 'opacity-25', 'opacity-30', 'opacity-40', 'opacity-50', 'opacity-60', 'opacity-70', 'opacity-75', 'opacity-80', 'opacity-90', 'opacity-95', 'opacity-100'].forEach(c => classes.push(c));
  
  // 7. TRANSFORMS & TRANSITIONS
  classes.push('// --- TRANSFORMS & TRANSITIONS ---');
  ['transform', 'transform-gpu', 'transform-none'].forEach(c => classes.push(c));
  ['transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform', 'transition-none'].forEach(c => classes.push(c));
  ['duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000'].forEach(c => classes.push(c));
  ['ease-linear', 'ease-in', 'ease-out', 'ease-in-out'].forEach(c => classes.push(c));
  
  // 8. OTHER COMMONS
  classes.push('// --- MISC ---');
  ['overflow-auto', 'overflow-hidden', 'overflow-clip', 'overflow-visible', 'overflow-scroll'].forEach(c => classes.push(c));
  ['relative', 'absolute', 'fixed', 'sticky', 'static'].forEach(c => classes.push(c));
  ['z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto'].forEach(c => classes.push(c));
  ['cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move', 'cursor-help', 'cursor-not-allowed'].forEach(c => classes.push(c));
  ['pointer-events-none', 'pointer-events-auto'].forEach(c => classes.push(c));
  ['select-none', 'select-text', 'select-all', 'select-auto'].forEach(c => classes.push(c));

  // ARBITRARY VALUES (Commonly used by AI)
  classes.push('// --- COMMON ARBITRARY ---');
  classes.push('blur-[10px]', 'blur-[20px]', 'blur-[40px]', 'blur-[100px]', 'blur-[120px]', 'blur-[150px]');
  classes.push('backdrop-blur-[2px]', 'backdrop-blur-[4px]', 'backdrop-blur-[8px]', 'backdrop-blur-[10px]', 'backdrop-blur-[20px]');
  
  // Write to file
  const content = `// THIS FILE IS AUTO-GENERATED - DO NOT EDIT MANUALLY
// Generated by scripts/generate-safelist.ts
// It ensures Tailwind v4 generates CSS for all these classes.

// Total classes: ${classes.length}

/* 
${classes.join(' ')} 
*/

export const SAFELIST_VERSION = "${new Date().toISOString()}";
`;

  const outputPath = path.resolve(process.cwd(), 'app/safelist.ts');
  fs.writeFileSync(outputPath, content);
  console.log(`Generated ${classes.length} classes to ${outputPath}`);
}

generateSafelist();
