module.exports = {
  content: [
    './remotion/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/ai/prompts/*.ts', // Include prompt recipes
  ],
  safelist: [
    {
      pattern: /(bg|text|border|from|to|shadow|outline)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)(\/\d+)?/,
    },
  ],
  theme: { extend: {} },
  plugins: [],
}
