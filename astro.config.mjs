// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  image: {
    // 画像最適化を無効化 - 高品質維持
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // アセット圧縮を最小限に
      assetsInlineLimit: 0
    }
  }
});
