import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f8f7",
          100: "#dff0ec",
          200: "#b7ded5",
          300: "#87c6b8",
          400: "#58ad9c",
          500: "#2f8f7f",
          600: "#236d63",
          700: "#1c564f",
          800: "#16443f",
          900: "#103531"
        }
      }
    }
  },
  plugins: []
};

export default config;
