import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#13151A',
        fog: '#EEF2F7',
        accent: '#0F766E',
        hot: '#B91C1C'
      }
    }
  },
  plugins: []
};

export default config;
