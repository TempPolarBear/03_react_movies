import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { env as processEnv } from 'node:process';

export default defineConfig(({ mode }) => {
  let hasTmdbToken = false;
  const plugins = [react()];
  plugins.push({
    name: 'validate-tmdb-environment-and-bundle',
    configResolved(config) {
      const env = loadEnv(mode, config.envDir, config.envPrefix);
      const tmdbToken = processEnv.VITE_TMDB_TOKEN ?? env.VITE_TMDB_TOKEN;
      hasTmdbToken = Boolean(tmdbToken?.trim());

      if (processEnv.VERCEL === '1' && !hasTmdbToken) {
        this.error(
          `VITE_TMDB_TOKEN is missing from the Vercel ${processEnv.VERCEL_ENV ?? mode} build environment. Add it to the matching Vercel environment and redeploy.`,
        );
      }
    },
    generateBundle(_options, bundle) {
      if (mode !== 'production' || !hasTmdbToken) return;

      const hasTmdbEndpoint = Object.values(bundle).some(
        output => output.type === 'chunk' && output.code.includes('https://api.themoviedb.org/3/search/movie'),
      );

      if (!hasTmdbEndpoint) {
        this.error('TMDB search endpoint was not included in the production bundle.');
      }
    },
  });

  return {
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
