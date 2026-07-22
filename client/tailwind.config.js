/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0095F6',      // Instagram's signature blue (buttons, links)
        'primary-hover': '#1877F2',
        dark: '#262626',         // main text color
        muted: '#8e8e8e',        // secondary/gray text
        border: '#dbdbdb',       // borders, dividers
        surface: '#ffffff',      // cards, inputs
        background: '#fafafa',  // page background
      },
    },
  },
  plugins: [],
}