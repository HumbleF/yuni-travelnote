import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "PingFang SC",
          "Microsoft YaHei",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bce0ff",
          300: "#8ecdff",
          400: "#58afff",
          500: "#308fff",
          600: "#1a72f5",
          700: "#155ce0",
          800: "#174cb5",
          900: "#1a448e",
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
