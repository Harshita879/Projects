import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mplus: ["var(--mplus)"]
      },
      colors: {
        'custom-purple': '#6251A3',
        'custom-green': '#5AD192'
      },
      
    },
  },
  plugins: [],
};
export default config;

