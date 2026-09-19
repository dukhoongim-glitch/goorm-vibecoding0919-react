import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/goorm-vibecoding0919-react/' : '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
