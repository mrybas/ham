import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(() => ({
  // Served as a GitHub Pages PROJECT page: https://mrybas.github.io/ham/
  // (the user page mrybas.github.io is taken by another app). Project pages
  // live under a sub-path, so the base must be '/ham/'.
  base: '/ham/',
  plugins: [
    react(),
    // Installable PWA + offline: precaches the build, auto-updates on deploy.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'] },
      manifest: {
        name: 'ham.',
        short_name: 'ham.',
        description: 'Vocal warm-ups that transpose themselves — no pianist, no account, offline.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#15171c',
        theme_color: '#15171c',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    headers: { 'Cache-Control': 'no-store' },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
}))
