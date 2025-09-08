import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          openai: ['openai'],
          stripe: ['@stripe/stripe-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
