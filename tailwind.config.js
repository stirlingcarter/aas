/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#09090b',
        surface: { DEFAULT: '#18181b', hover: '#1f1f23' },
        border: { DEFAULT: '#27272a', bright: '#3f3f46' },
        text: { DEFAULT: '#fafafa', muted: '#a1a1aa', dim: '#71717a' },
        accent: { DEFAULT: '#22c55e', hover: '#16a34a', dim: '#166534' },
        warning: { DEFAULT: '#f59e0b', hover: '#d97706', dim: '#92400e' },
        danger: { DEFAULT: '#ef4444', hover: '#dc2626', dim: '#991b1b' },
      },
    },
  },
  plugins: [],
}
