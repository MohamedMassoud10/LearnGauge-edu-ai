/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#014D89",
        "primary-hover": "#6E99BC",
      },
    },
  },
  plugins: [],
};
