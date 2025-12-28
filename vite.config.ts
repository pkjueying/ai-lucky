import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // If running in GitHub Actions, try to infer the repo name and set base to /<repo>/
    // This makes built asset URLs correct for GitHub Pages project sites.
    const ghRepo = process.env.GITHUB_REPOSITORY; // e.g. owner/repo
    const inferredBase = ghRepo ? `/${ghRepo.split('/')[1]}/` : '/';

    return {
      base: env.VITE_BASE || inferredBase,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
