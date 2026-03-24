import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/emilia-pixel-adventure/',
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'Cute_Fantasy_Free', dest: '.' },
        { src: 'Farm RPG FREE 16x16 - Tiny Asset Pack', dest: '.' },
        { src: 'Game Assets', dest: '.' },
      ]
    })
  ]
});
