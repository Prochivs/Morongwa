import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#14243A",
        brand: "#2563EB",
        teal: "#14B8A6",
        canvas: "#F8FAFC",
        ink: "#172033",
        muted: "#64748B",
      },
      boxShadow: { card: "0 1px 2px rgba(15, 23, 42, .04), 0 12px 32px rgba(15, 23, 42, .06)" },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};

export default config;
