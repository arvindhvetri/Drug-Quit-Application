import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@styles': resolve(__dirname, 'src/styles'),
      // You can add more aliases here if needed
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your Flask backend
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // Disable SSL verification (useful for dev)
        rewrite: (path) => path.replace(/^\/api/, ''), // Strip `/api` prefix
      },
    },
    port: 5173, // Matches your React dev server
  },
});