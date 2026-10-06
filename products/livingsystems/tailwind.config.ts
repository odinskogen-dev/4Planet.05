import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        brand: "#2E2EFF",
        line: "#E6E6E6",
        muted: "#6B6B6B",
        paper: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-dm)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        micro: "0.14em",
      },
      maxWidth: {
        page: "1180px",
      },
    },
  },
  plugins: [],
};
export default config;
