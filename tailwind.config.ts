import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        display: [
          "var(--font-bricolage)",
          '"Bricolage Grotesque"',
          "sans-serif",
        ],
        body: ["var(--font-bengali)", "system-ui", "sans-serif"],
      },

      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        soft: "var(--soft)",
        ink: "var(--ink)",
        mute: "var(--mute)",
        line: "var(--line)",
        wine: "var(--wine)",
        teal: "var(--teal)",
      },
    },
  },

  plugins: [],
};

export default config;
