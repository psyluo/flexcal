import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/flexcal/',
  build: {
    typescript: {
      noEmit: true,
      noCheck: true
    }
  },
  plugins: [
    react()
  ]
}); 