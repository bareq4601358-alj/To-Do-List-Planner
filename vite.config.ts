import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project URL: /<repo-name>/ (must match repository name)
const repoBase = '/To-Do-List-Planner/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? repoBase : '/',
  // Makes the “Local / Network” dev URLs work more reliably (Cursor preview, phone, etc.)
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    // Forwarded / tunnel / LAN hosts (Cursor port view, Simple Browser, etc.)
    allowedHosts: true,
    // Embedded previews may use a different browser origin than the dev server.
    cors: true,
    hmr: {
      // A failed WS + full-screen error overlay can look like a blank page in embedded browsers.
      overlay: false,
      timeout: 120_000,
    },
    warmup: {
      clientFiles: ['./index.html', './src/main.tsx', './src/App.tsx'],
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    allowedHosts: true,
    cors: true,
  },
}))
