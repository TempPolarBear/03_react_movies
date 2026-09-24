import { cwd, env as processEnv } from 'node:process';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Vercel injects project variables into process.env. Local Vite .env files
  // are read here only for validation; Vite itself handles import.meta.env.
  const fileEnv = loadEnv(mode, cwd(), 'VITE_');
  const tmdbToken = processEnv.VITE_TMDB_TOKEN ?? fileEnv.VITE_TMDB_TOKEN;

  if (processEnv.VERCEL === '1' && !tmdbToken?.trim()) {
    throw new Error(
      `VITE_TMDB_TOKEN is missing from the Vercel ${processEnv.VERCEL_ENV ?? mode} build environment. Add it to the matching Vercel environment and redeploy.`,
    );
  }

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') defaultHandler(warning);
        },
      },
    },
  };
});
