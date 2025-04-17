import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/front',
  //plugins: [react({})],
  plugins: [
    TanStackRouterVite({
      routesDirectory: 'src/front/src/routes',
    }),
    react({}),
  ],
  server: {
    //  hmr: false,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
      },
    },
  },
  resolve: {
    conditions: ['mui-modern'],
  },
});
