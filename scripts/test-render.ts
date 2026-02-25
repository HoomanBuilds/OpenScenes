/**
 * test-render.ts — Standalone Remotion render test.
 * Renders a short video to the project root using a minimal template
 * that intentionally uses Roboto Mono with fontWeight 900 (the crash case).
 *
 * Usage:  npx tsx scripts/test-render.ts
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const ROOT = process.cwd();
const ENTRY = path.join(ROOT, 'remotion', 'index.tsx');
const OUTPUT = path.join(ROOT, 'test-output.mp4');

// ── Minimal template that exercises the bug: Roboto Mono @ weight 900 ──
const templateData = {
  name: 'Font Weight Test',
  slides: [
    {
      id: 'slide-1',
      type: 'content',
      duration: 3000,
      background: { type: 'color', value: '#0f172a' },
      transition: { type: 'fade', duration: 0.3 },
      elements: [
        {
          id: 'el-headline',
          type: 'headline',
          content: 'Font Weight Fix ✅',
          x: 50, y: 60, width: 900, height: 80,
          fontSize: 52,
          fontWeight: '900',            // <-- was crashing
          fontFamily: 'Roboto Mono',    // <-- only supports 400, 700
          textColor: '#e2e8f0',
          textAlign: 'center',
          animation: { type: 'fade', duration: 0.6, delay: 0 },
        },
        {
          id: 'el-sub',
          type: 'subheadline',
          content: 'Roboto Mono @ weight 900 → clamped to 700',
          x: 50, y: 180, width: 900, height: 50,
          fontSize: 22,
          fontWeight: 'bold',
          fontFamily: 'Roboto Mono',
          textColor: '#94a3b8',
          textAlign: 'center',
          animation: { type: 'fade', duration: 0.6, delay: 0.2 },
        },
        {
          id: 'el-body',
          type: 'text',
          content: 'If you see this video, the fix works.',
          x: 50, y: 280, width: 900, height: 100,
          fontSize: 28,
          fontWeight: '900',
          fontFamily: 'Inter',
          textColor: '#64748b',
          textAlign: 'center',
          animation: { type: 'slide', duration: 0.5, delay: 0.4, direction: 'up' },
        },
        {
          id: 'el-shape',
          type: 'shape',
          content: 'rect',
          x: 200, y: 420, width: 600, height: 6,
          color: '#3b82f6',
          borderRadius: 3,
          animation: { type: 'scale', duration: 0.5, delay: 0.6 },
        },
      ],
    },
  ],
};

async function main() {
  console.log('🎬  Test Render Script');
  console.log('━'.repeat(50));

  // 1. Bundle
  console.log('\n📦  Bundling Remotion project...');
  const bundleStart = Date.now();

  const bundleLocation = await bundle({
    entryPoint: ENTRY,
    rootDir: ROOT,
    enableCaching: true,
    webpackOverride: (config: any) => {
      const cssPath = path.resolve(ROOT, 'remotion', 'style.css');
      if (typeof config.entry === 'string') {
        config.entry = [cssPath, config.entry];
      } else if (Array.isArray(config.entry)) {
        config.entry.unshift(cssPath);
      }
      return {
        ...config,
        module: {
          ...config.module,
          rules: [
            ...(config.module?.rules ?? []).filter((rule: any) => {
              return !(rule && rule.test && rule.test.toString().includes('css'));
            }),
            {
              test: /\.css$/i,
              use: [
                eval('require.resolve')('style-loader'),
                eval('require.resolve')('css-loader'),
                {
                  loader: eval('require.resolve')('postcss-loader'),
                  options: {
                    postcssOptions: {
                      plugins: [eval('require')('@tailwindcss/postcss')],
                    },
                  },
                },
              ],
            },
          ],
        },
      };
    },
  });

  console.log(`   Done in ${((Date.now() - bundleStart) / 1000).toFixed(1)}s`);

  // 2. Select composition
  console.log('\n🎯  Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'SlideVideo',
    inputProps: { templateData },
  });

  const fps = 30;
  const totalFrames = templateData.slides.reduce(
    (acc, s) => acc + Math.ceil((s.duration / 1000) * fps), 0
  );

  const finalComposition = {
    ...composition,
    durationInFrames: totalFrames,
    fps,
    width: 1000,
    height: 563,
  };

  console.log(`   Composition: ${totalFrames} frames @ ${fps}fps`);

  // 3. Render
  console.log('\n🎥  Rendering...');
  const renderStart = Date.now();

  await renderMedia({
    composition: finalComposition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: OUTPUT,
    inputProps: { templateData },
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      process.stdout.write(`\r   Progress: ${'█'.repeat(Math.floor(pct / 2))}${'░'.repeat(50 - Math.floor(pct / 2))} ${pct}%`);
    },
  });

  const renderTime = ((Date.now() - renderStart) / 1000).toFixed(1);
  const fileSize = (fs.statSync(OUTPUT).size / (1024 * 1024)).toFixed(2);

  console.log('\n');
  console.log('━'.repeat(50));
  console.log(`✅  Render complete!`);
  console.log(`   Output:  ${OUTPUT}`);
  console.log(`   Size:    ${fileSize} MB`);
  console.log(`   Time:    ${renderTime}s`);
  console.log('━'.repeat(50));
}

main().catch((err) => {
  console.error('\n❌  Render FAILED:', err.message);
  process.exit(1);
});
