import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#00163A",
        brand: "#009DE7",
        teal: "#0F9D72",
        canvas: "#F7F9FC",
        ink: "#00163A",
        muted: "#5B687A",
        blue: {
          50: "#EAF7FC",
          100: "#D6F0FA",
          500: "#009DE7",
          600: "#0087C7",
          700: "#006EA4",
        },
        slate: {
          50: "#F7F9FC",
          100: "#EEF2F6",
          200: "#DDE4EC",
          300: "#C4CFDC",
          400: "#8B99AA",
          500: "#6C7A8C",
          600: "#5B687A",
          700: "#354258",
        },
      },
      boxShadow: { card: "0 18px 45px rgba(0, 22, 58, .08), 0 2px 8px rgba(0, 22, 58, .04)" },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};

export default config;
