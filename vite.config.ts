import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Bundle size limits (in bytes)
const CHUNK_SIZE_WARNING = 250 * 1024; // 250KB
const CHUNK_SIZE_ERROR = 300 * 1024; // 300KB

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'bundle-size-checker',
      generateBundle(options, bundle) {
        const chunks = Object.values(bundle).filter(
          (chunk) => chunk.type === 'chunk'
        );
        
        chunks.forEach((chunk) => {
          const size = chunk.code.length;
          const sizeKB = (size / 1024).toFixed(2);
          
          if (size > CHUNK_SIZE_ERROR) {
            console.error(
              `❌ Chunk "${chunk.fileName}" exceeds ${CHUNK_SIZE_ERROR / 1024}KB limit: ${sizeKB}KB`
            );
          } else if (size > CHUNK_SIZE_WARNING) {
            console.warn(
              `⚠️  Chunk "${chunk.fileName}" exceeds ${CHUNK_SIZE_WARNING / 1024}KB warning: ${sizeKB}KB`
            );
          }
          
          // Specifically monitor lottie chunk
          if (chunk.fileName.includes('lottie-vendor')) {
            console.log(`📦 Lottie vendor chunk size: ${sizeKB}KB`);
          }
        });
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    // Enable HTML5 history mode for BrowserRouter
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Isolate lottie-react and jszip into separate chunk
          'lottie-vendor': ['lottie-react', 'jszip'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: CHUNK_SIZE_WARNING,
    // Custom plugin to warn/error on large chunks
    reportCompressedSize: true,
    minify: 'esbuild',
  },
});
