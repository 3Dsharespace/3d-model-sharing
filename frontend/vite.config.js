import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true
    })
  ],
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0', // Allow access from mobile devices on same network
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800, // Increased threshold for Firebase SDK
    minify: 'esbuild',
    // Mobile-optimized performance settings
    cssMinify: true,
    reportCompressedSize: false, // Faster builds
    rollupOptions: {
      output: {
        // Advanced chunking to optimize bundle sizes
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          firebaseExtras: ['firebase/functions', 'firebase/messaging', 'firebase/remote-config', 'firebase/analytics', 'firebase/performance', 'firebase/app-check'],
          lucide: ['lucide-react']
        },
        // Better file naming for mobile caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Mobile browser compatibility
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    // Optimize CSS for mobile
    cssCodeSplit: true,
    // Smaller inline limit for mobile
    assetsInlineLimit: 2048, // Inline smaller assets for mobile
  },
  // Mobile development optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@firebase/app-check']
  },
  // Better error handling for mobile debugging
  esbuild: {
    target: 'es2015',
    // Better mobile browser support
    supported: {
      'top-level-await': false // Disable for better mobile compatibility
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
  preview: {
    port: 3000,
    host: '0.0.0.0', // Allow mobile preview access
  },
})
