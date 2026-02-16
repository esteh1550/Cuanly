import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "Cuanly - Catatan Keuangan UMKM",
        short_name: "Cuanly",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#10b981",
        orientation: "portrait",
        icons: [
          {
            src: "https://lucide.dev/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          },
          {
            src: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            type: "image/png",
            sizes: "192x192"
          },
          {
            src: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            type: "image/png",
            sizes: "512x512"
          }
        ]
      },
      workbox: {
        // Define runtime caching strategies for external resources
        runtimeCaching: [
          // Cache Google Fonts (CSS & WOFF2)
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache Tailwind CDN script
          {
            urlPattern: ({ url }) => url.origin === 'https://cdn.tailwindcss.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tailwind-cdn-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache External Icons (Flaticon & Lucide favicons)
          {
            urlPattern: ({ url }) => url.href.includes('cdn-icons-png.flaticon.com') || url.href.includes('lucide.dev'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-icons-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
  }
});