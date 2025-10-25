import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  // For production build, load .env.production
  // For development, load .env
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // Production build settings
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },

    // Development server
    server: {
      port: 5173,
      host: true,
      cors: true,
    },

    // CSS optimizations
    css: {
      devSourcemap: false,
      preprocessorOptions: {
        css: {
          charset: false
        }
      }
    },

    // Define environment variables
    define: {
      __DEV__: JSON.stringify(mode === 'development'),
      __PROD__: JSON.stringify(mode === 'production'),
    }
  }
})
