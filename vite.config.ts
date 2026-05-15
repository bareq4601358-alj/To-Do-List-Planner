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
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
}))
