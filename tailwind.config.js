/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Manrope", "sans-serif"],
        heading: ["Syne", "sans-serif"],
        serif:   ["Playfair Display", "serif"],
        mono:    ["Manrope", "monospace"],
      },
      colors: {
        "brand-teal": "#2ec4b6",
        "brand-lime": "#d4e157",
        "bg-dark":    "#050505",
      },
      transitionTimingFunction: {
        "expo":     "cubic-bezier(0.19, 1, 0.22, 1)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "in-expo":  "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #2ec4b6, #45b7aa, #7ec88a, #c5d94a, #d4e157)",
      },
    },
  },
  plugins: [],
};
