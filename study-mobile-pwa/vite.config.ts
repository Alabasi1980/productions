import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/app-icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'مسار الدراسة المهنية',
        short_name: 'مسار الدراسة',
        description: 'تطبيق موبايل-أول لتصفح ودراسة محتوى موديول الإنتاج من أي مكان.',
        theme_color: '#a64b2a',
        background_color: '#f4ebdd',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/app-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json,md}'],
      },
    }),
  ],
})
