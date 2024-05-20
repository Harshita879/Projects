/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        "purple-1": "#6251a3",
        dimgray: "#505050",
        black: "#000",
        "purple-3": "#d8d0ee",
        gray: {
          "100": "#757575",
          "200": "rgba(255, 255, 255, 0)",
          "300": "rgba(255, 255, 255, 0.74)",
        },
        mediumseagreen: "#5ad192",
        darkslategray: "#443d41",
        mediumpurple: "#b08af4",
        silver: "#bfb7b7",
        ghostwhite: "#f7f5fc",
        darkslateblue: "#5a4fac",
        tomato: "#f35431",
        lavender: "#e9e3ff",
        darkgray: "#9a9a9a",
        "purple-2": "#bdb3df",
        gainsboro: "#e1e1e1",
      },
      spacing: {},
      fontFamily: {
        "rounded-mplus-1c": "'Rounded Mplus 1c'",
        chillax: "Chillax",
        inter: "Inter",
      },
      borderRadius: {
        "3xs": "10px",
        "11xs-3": "1.3px",
        "24xl": "43px",
      },
    },
    fontSize: {
      "6xl": "1.563rem",
      "18xl": "2.313rem",
      "5xl": "1.5rem",
      "13xl-3": "2.019rem",
      "21xl": "2.5rem",
      "9xl": "1.75rem",
      "38xl": "3.563rem",
      "15xl": "2.125rem",
      "9xs-7": "0.231rem",
      "6xs-9": "0.431rem",
      base: "1rem",
      mid: "1.063rem",
      "11xl": "1.875rem",
      "2xl": "1.313rem",
      inherit: "inherit",
    },
    screens: {
      lg: {
        max: "1200px",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
