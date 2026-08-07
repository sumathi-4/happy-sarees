import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176
  },
  optimizeDeps: {
    include: ['axios', 'react', 'react-dom', 'react-router-dom', 'react-icons', 'react-hook-form', 'recharts']
  },
  build: {
    chunkSizeWarningLimit: 1500
  }
});
