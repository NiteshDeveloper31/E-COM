/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#1F3B2D",
          greenDark: "#15281E",
          greenLight: "#2C5441",
          gold: "#C8A25D",
          goldLight: "#DFB875",
          goldDark: "#A6823F",
          cream: "#F8F5EF",
          creamDark: "#EEECE5",
          ivory: "#FDFAF6",
          charcoal: "#2A2A2A",
          charcoalLight: "#4A4A4A",
        }
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'premium': '0 10px 30px -15px rgba(31, 59, 45, 0.1)',
        'premium-hover': '0 20px 40px -20px rgba(31, 59, 45, 0.2)',
        'gold-glow': '0 4px 14px 0 rgba(200, 162, 93, 0.3)',
      }
    },
  },
  plugins: [],
}
