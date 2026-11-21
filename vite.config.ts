import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://100.70.108.107:8000';
  const proxyEntry = { target: apiTarget, changeOrigin: true, secure: false };

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true,
      // Dev proxy: browser calls same-origin /api/*, Vite forwards to the FastAPI backend.
      // Avoids CORS errors during local development.
      proxy: {
        '/api': proxyEntry,
        '/health': proxyEntry,
        '/download': proxyEntry,
      },
    },
  };
});
