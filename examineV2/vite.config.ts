import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';     // правильний імпорт для Tailwind v4+
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      // якщо хочеш одним файлом тільки в production (опціонально)
      isProduction ? viteSingleFile() : null,
    ].filter(Boolean), // видаляє null з масиву

    base: '/', // стандартно, добре

    resolve: {
      alias: {
        // або більш надійно (рекомендую):
      },
    },

    // server налаштування — тільки для розробки, Vercel їх ігнорує
    server: {
      host: true,
      port: 5173,
      open: true, // опціонально: автоматично відкривати браузер
    },

    // Додаткові оптимізації білду (опціонально, але корисно)
    build: {
      // якщо використовуєш viteSingleFile — вже додано через plugins
      // якщо хочеш контролювати rollup окремо:
      // rollupOptions: {
      //   plugins: isProduction ? [viteSingleFile()] : [],
      // },
      sourcemap: !isProduction, // sourcemap тільки в dev
      minify: 'esbuild', // або 'terser' якщо хочеш сильніше стиснення
    },
  };
});