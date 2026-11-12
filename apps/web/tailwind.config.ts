import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#000000",
        brand: "#8B1F33",
        teal: "#0F8A68",
        canvas: "#F6F6F6",
        ink: "#000000",
        muted: "#626262",
        blue: {
          50: "#F9EEF1",
          100: "#F2D7DD",
          500: "#8B1F33",
          600: "#791A2D",
          700: "#651626",
        },
        slate: {
          50: "#F6F6F6",
          100: "#EEEEEE",
          200: "#DDDDDD",
          300: "#C6C6C6",
          400: "#989898",
          500: "#777777",
          600: "#626262",
          700: "#333333",
        },
      },
      boxShadow: { card: "0 18px 50px rgba(0, 0, 0, .07), 0 2px 8px rgba(0, 0, 0, .04)" },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};

export default config;
