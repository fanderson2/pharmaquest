/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  corePlugins: {
    truncate: false, // Disable Tailwind's default truncate class
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.truncate': {
          overflow: 'hidden !important',
          textOverflow: 'ellipsis !important',
          whiteSpace: 'initial !important', // Explicitly override white-space
        },
      });
    },
  ],
};
