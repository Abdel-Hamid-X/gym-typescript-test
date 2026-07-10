/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "var(--color-text-strong)",
        "gray-20": "var(--color-bg)",
        "gray-50": "var(--color-surface)",
        "gray-100": "var(--color-border)",
        "gray-300": "var(--color-text-soft)",
        "gray-400": "var(--color-text-muted)",
        "gray-500": "var(--color-text-muted)",
        "primary-100": "var(--color-panel)",
        "primary-300": "var(--color-accent-cyan)",
        "primary-500": "var(--color-accent-red)",
        "secondary-400": "var(--color-accent-orange-soft)",
        "secondary-500": "var(--color-accent-orange)",
      },
      backgroundImage: (theme) => ({
        "gradient-yellowred":
          "linear-gradient(90deg, #FF616A 0%, #FFC837 100%)",
        "mobile-home": "url('./assets/HomePageImg.png')",
      }),
      fontFamily: {
        dmsans: ["Oswald", "sans-serif"],
        montserrat: ["Bebas Neue", "Oswald", "sans-serif"],
      },
      content: {
        evolvetext: "url('./assets/EvolveText.png')",
        abstractwaves: "url('./assets/AbstractWaves.png')",
        sparkles: "url('./assets/Sparkles.png')",
        circles: "url('./assets/Circles.png')",
      },
    },
    screens: {
      xs: "480px",
      sm: "768px",
      md: "1060px",
    },
  },
  plugins: [],
};
