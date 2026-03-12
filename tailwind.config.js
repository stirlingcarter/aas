/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#06060a',
        surface: { DEFAULT: '#0f0f14', hover: '#16161d' },
        border: { DEFAULT: '#1a1a24', bright: '#2a2a38' },
        text: { DEFAULT: '#e8e4e0', muted: '#8a8690', dim: '#5a5660' },
        accent: { DEFAULT: '#22c55e', hover: '#16a34a', dim: '#166534' },
        warning: { DEFAULT: '#f59e0b', hover: '#d97706', dim: '#92400e' },
        danger: { DEFAULT: '#ef4444', hover: '#dc2626', dim: '#991b1b' },
      },
      letterSpacing: {
        dramatic: '0.15em',
      },
    },
  },
  plugins: [],
}
