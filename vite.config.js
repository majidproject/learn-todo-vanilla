// vite.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // ⬅️ این JSDOM را فعال می‌کند
    globals: true, // ⬅️ این امکان استفاده از describe, it, expect بدون import را می‌دهد
    setupFiles: './vitest.setup.js', // ⬅️ برای اضافه کردن Matcherهای بیشتر
  },
});