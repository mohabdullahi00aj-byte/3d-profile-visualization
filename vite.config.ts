import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required
    react(),
    tailwindcss(),
  ],

  // 👇 ADD THIS (VERY IMPORTANT FOR GITHUB PAGES)
  base: '/3d-profile-visualization/',

  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
