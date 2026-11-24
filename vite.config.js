import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { jsonStoragePlugin } from './vite-plugins/jsonStoragePlugin.js';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    jsonStoragePlugin(),
  ],
});
