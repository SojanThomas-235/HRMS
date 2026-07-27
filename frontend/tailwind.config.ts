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
        primary: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb8f4a",
          500: "#f9701a",
          600: "#ea5a10",
          700: "#c2440e",
          800: "#9a3714",
          900: "#7c2f13",
          950: "#431407",
        },
      },
    },
  },
  plugins: [],
};

export default config;
