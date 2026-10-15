/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--accent-color)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
        },
      },
    },
  },
  plugins: [],
};
