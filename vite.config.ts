import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// On GitHub Pages the app lives under /<repo>/; the deploy workflow passes it in.
const base = process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, '')}/` : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Coffee Shelf',
        short_name: 'Coffee Shelf',
        description: 'Scan specialty coffee bags, rate them, and get predictions for new ones.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBF8F4',
        theme_color: '#FBF8F4',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
