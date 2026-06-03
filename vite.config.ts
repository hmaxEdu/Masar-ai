// vite.config.ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 👇 Stops Vite from eagerly preloading lazy chunks on first paint
    modulePreload: {
      resolveDependencies: () => [],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep framework core cached in its own bundle
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            // Keep icon library separate
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Keep database adapter separate
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // ❌ Removed shiki, recharts, @tiptap, and @dnd-kit from here.
            // Letting Rollup automatically chunk them keeps them completely out of the first load.
          }
        }
      }
    }
  }
})