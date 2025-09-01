import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ mode }) => {
  // Load env vars
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [svelte()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BackEnd_URL,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
