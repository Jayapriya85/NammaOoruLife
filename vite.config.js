import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
  // NOTE: Do NOT add '**/*.json' to assetsInclude — that makes Vite
  // serve JSON as raw file URLs instead of parsed JS module objects.
  // Vite natively supports JSON imports as ES modules by default.
});
