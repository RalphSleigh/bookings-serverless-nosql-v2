import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'


// https://vitejs.dev/config/


export default defineConfig({
  root: 'src/front',
  //plugins: [react({})],
  plugins: [
    TanStackRouterVite({
      routesDirectory: 'src/front/src/routes',
      target: 'react',
      autoCodeSplitting: true,
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
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  },
  define: {
    BUILD_DATE: JSON.stringify(new Date().valueOf()),
  },

})
