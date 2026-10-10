/** @type {import('tailwindcss').Config} */
export default {
  // THIS LINE IS WHY THE UI WAS UNSTYLED: an empty `content` array means
  // Tailwind scans no files and generates no utility classes at all.
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // toggled by adding/removing the "dark" class on <html>
  theme: {
    extend: {},
  },
  plugins: [],
};
