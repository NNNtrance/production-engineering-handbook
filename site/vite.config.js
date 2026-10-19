import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { countWord } from './src/config.js';

// scripts/build-data.mjs runs before dev/build, so the index already exists here.
// Counts come from it, so the page text never goes stale when cases are added.
const index = JSON.parse(fs.readFileSync(new URL('./public/data/index.json', import.meta.url), 'utf8'));
const counts = {
  BOOK_COUNT_WORD: countWord(index.length),
  CASE_COUNT: index.reduce((sum, b) => sum + b.cases.length, 0),
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'handbook-counts',
      transformIndexHtml: (html) => html.replace(/%(BOOK_COUNT_WORD|CASE_COUNT)%/g, (_, key) => counts[key]),
    },
  ],
  define: {
    __BOOK_COUNT_WORD__: JSON.stringify(counts.BOOK_COUNT_WORD),
    __CASE_COUNT__: JSON.stringify(counts.CASE_COUNT),
  },
});
