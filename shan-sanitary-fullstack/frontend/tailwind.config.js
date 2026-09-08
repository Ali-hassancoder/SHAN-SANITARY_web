/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: "#722F37",
          light: "#8C3A44",
          dark: "#4E1F25",
        },
        carbon: {
          DEFAULT: "#1A1A1A",
          light: "#2A2A2A",
        },
        offwhite: "#F7F5F3",
      },
      fontFamily: {
        heading: ["'Poppins'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};