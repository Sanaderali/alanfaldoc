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
        // Brand palette taken from the logo (green #04c366, red #f2030b). Change here to re-theme the whole site.
        brand: {
          DEFAULT: "#04c366",
          dark: "#03a356",
          text: "#039a50", // green for text/links on white (better contrast)
          50: "#effcf5",
          100: "#d9f7e7",
          200: "#b3efd0",
        },
        accent: { DEFAULT: "#f2030b", 50: "#fff1f1", 100: "#ffe0e1" }, // logo red, available for highlights
      },
    },
  },
  plugins: [],
};
export default config;
