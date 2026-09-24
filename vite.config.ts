import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { env as processEnv } from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const tmdbToken = processEnv.VITE_TMDB_TOKEN ?? env.VITE_TMDB_TOKEN;

  if (processEnv.VERCEL === '1' && !tmdbToken?.trim()) {
    throw new Error(
      `VITE_TMDB_TOKEN is missing from the Vercel ${processEnv.VERCEL_ENV ?? mode} build environment. Add it to the matching Vercel environment and redeploy.`,
    );
  }

  const plugins = [react()];
  if (mode === 'production' && tmdbToken?.trim()) {
    plugins.push({
      name: 'verify-tmdb-search-in-production-bundle',
      apply: 'build',
      generateBundle(_options, bundle) {
        const hasTmdbEndpoint = Object.values(bundle).some(
          output => output.type === 'chunk' && output.code.includes('https://api.themoviedb.org/3/search/movie'),
        );

        if (!hasTmdbEndpoint) {
          this.error('TMDB search endpoint was not included in the production bundle.');
        }
      },
    });
  }

  return {
    define: tmdbToken?.trim()
      ? { 'import.meta.env.VITE_TMDB_TOKEN': JSON.stringify(tmdbToken) }
      : undefined,
    plugins,
    build: {
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') defaultHandler(warning);
        },
      },
    },
  };
});
