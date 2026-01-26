import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ring: "var(--ring)",
        "ring-offset": "var(--ring-offset)",
        "focus-outline": "var(--focus-outline)",
      },
      transitionDuration: {
        "motion-fast": "var(--motion-duration-fast)",
        "motion": "var(--motion-duration)",
        "motion-slow": "var(--motion-duration-slow)",
      },
      transitionTimingFunction: {
        "motion-out": "var(--motion-ease-out)",
        "motion-in": "var(--motion-ease-in)",
        "motion-in-out": "var(--motion-ease-in-out)",
      },
    },
  },
  plugins: [],
};
export default config;