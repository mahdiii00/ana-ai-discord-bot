/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f0f0f5',
          100: '#d9dae3',
          200: '#b3b5c7',
          300: '#8d8fab',
          400: '#676a8f',
          500: '#4a4d73',
          600: '#3a3d5c',
          700: '#2a2d45',
          800: '#1a1d2e',
          900: '#0d0f1a',
          950: '#080a12',
        },
        blurple: '#5865F2',
        green: '#57F287',
        yellow: '#FEE75C',
        red: '#ED4245',
        fuchsia: '#EB459E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
