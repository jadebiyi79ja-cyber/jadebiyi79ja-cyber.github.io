import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // https://jadebiyi79ja-cyber.github.io is a GitHub Pages *user site*: it is
  // served from the root of the domain, so asset URLs start at "/".
  // (A project site like .../portfolio/ would need base: '/portfolio/'.)
  base: '/',
  plugins: [react(), tailwindcss()],
  // "@/..." imports resolve to src/ (matches "paths" in tsconfig.json)
  resolve: { alias: { '@': resolve(root, 'src') } },
  build: {
    rolldownOptions: {
      // Two pages: the landing page (/) and the Work page (/work/)
      input: {
        main: resolve(root, 'index.html'),
        work: resolve(root, 'work/index.html'),
      },
    },
  },
})
