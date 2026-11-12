import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#00103D",
        brand: "#009DE7",
        teal: "#13D4AE",
        canvas: "#F9FAFB",
        ink: "#00163A",
        muted: "#69708F",
        blue: {
          50: "#EAF8FE",
          100: "#C7EEFC",
          500: "#009DE7",
          600: "#008ACB",
          700: "#0075AD",
        },
        slate: {
          50: "#F9FAFB",
          100: "#F1F4F6",
          200: "#ECF0F1",
          300: "#D8E0E5",
          400: "#A1B1BC",
          500: "#8295A3",
          600: "#69708F",
          700: "#2C3E50",
        },
      },
      boxShadow: { card: "0 1px 2px rgba(0, 16, 61, .04), 0 12px 32px rgba(0, 16, 61, .07)" },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};

export default config;
