/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ডার্ক মোডের জন্য
  theme: {
    extend: {
      // 🔥 কাস্টম ফন্ট ফ্যামিলি কনফিগারেশন
      fontFamily: {
        montserrat: ['"Montserrat"', 'sans-serif'],
        almendra: ['"Almendra"', 'serif'],
        bangla: ['"Noto Serif Bengali"', 'serif'],
      },
    },
  },
  plugins: [],
}