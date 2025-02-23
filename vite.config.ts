import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/front',
  plugins: [TanStackRouterVite({
    routesDirectory: 'src/front/routes',
  }), react({})],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
      }
    }
  }
})
