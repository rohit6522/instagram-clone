export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0095F6',
        'primary-hover': '#1877F2',
        dark: '#262626',
        muted: '#8e8e8e',
        border: '#dbdbdb',
        surface: '#ffffff',
        background: '#fafafa',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}