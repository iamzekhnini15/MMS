import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Activer le dark mode avec la classe
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
