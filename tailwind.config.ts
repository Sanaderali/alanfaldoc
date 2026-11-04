import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts}",
    "./lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette from the logo. Values live as CSS variables in app/globals.css (:root) so the theme is changed in ONE place.
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          dark: "rgb(var(--brand-dark) / <alpha-value>)",
          text: "rgb(var(--brand-text) / <alpha-value>)",
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          dark: "rgb(var(--accent-dark) / <alpha-value>)",
          50: "rgb(var(--accent-50) / <alpha-value>)",
          100: "rgb(var(--accent-100) / <alpha-value>)",
        },
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        // Dashboard (dark slate) tokens, values defined in .admin-theme in app/globals.css
        a: {
          canvas: "rgb(var(--a-canvas) / <alpha-value>)",
          bar: "rgb(var(--a-bar) / <alpha-value>)",
          bar2: "rgb(var(--a-bar2) / <alpha-value>)",
          surface: "rgb(var(--a-surface) / <alpha-value>)",
          raised: "rgb(var(--a-raised) / <alpha-value>)",
          line: "rgb(var(--a-line) / <alpha-value>)",
          line2: "rgb(var(--a-line2) / <alpha-value>)",
          text: "rgb(var(--a-text) / <alpha-value>)",
          muted: "rgb(var(--a-muted) / <alpha-value>)",
          subtle: "rgb(var(--a-subtle) / <alpha-value>)",
          red: "rgb(var(--a-red) / <alpha-value>)",
          on: "rgb(var(--a-on) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
