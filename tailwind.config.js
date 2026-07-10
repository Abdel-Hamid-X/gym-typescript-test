/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "gray-20": "#121212",
        "gray-50": "#1A1A1A",
        "gray-100": "#2A2A2A",
        "gray-500": "#B8B8B8",
        "primary-100": "#1F1F1F",
        "primary-300": "#00E5FF",
        "primary-500": "#E50914",
        "secondary-400": "#FF8A00",
        "secondary-500": "#FF5A00",
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
