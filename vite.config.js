import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  // For production build, load .env.production
  // For development, load .env
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'favicon.ico'],
        manifest: {
          name: 'Vertinova Finance',
          short_name: 'Vertinova',
          description: 'Sistem Manajemen Keuangan Vertinova',
          theme_color: '#1e293b',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait-primary',
          icons: [
            {
              src: '/logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.vertinova\.id\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/simpaskor\.id\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'simpaskor-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 // 1 hour
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    
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
