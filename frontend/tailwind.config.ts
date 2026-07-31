import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette: Turquoise #27B1AE · Blue #136F9A · Navy #2C3E50 · Pale #F8FBFD
        primary: {
          50:  "#f0fafa",
          100: "#d0f0ef",
          200: "#a0e0de",
          300: "#6ecece",
          400: "#44bcba",
          500: "#27b1ae",
          600: "#1e9e9b",
          700: "#167b79",
          800: "#0f5a58",
          900: "#083c3b",
          950: "#042524",
        },
        sage: {
          50:  "#f6f8f6",
          100: "#e8ede8",
          200: "#cfdacf",
          300: "#adc0ad",
          400: "#84a084",
          500: "#607456",
          600: "#27b1ae",   // remapped → turquoise so text-sage-600 = brand primary
          700: "#136f9a",
          800: "#2c3e50",
          900: "#1a2332",
        },
      },
    },
  },
  plugins: [],
};

export default config;
