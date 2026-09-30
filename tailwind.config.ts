import type { Config } from "tailwindcss";

// Paleta tirada do universo da erva-mate:
// folha seca (fundo), erva (verde), cuia (madeira, chimarrão), gelo (tererê)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#ECEFE4",
        espuma: "#F8F9F3",
        erva: { DEFAULT: "#2D4A2A", claro: "#DCE5D3" },
        cuia: { DEFAULT: "#8B5A2B", claro: "#F0E2D0" },
        gelo: { DEFAULT: "#2F7F86", claro: "#D6ECEE" },
        tinta: "#1F261C",
        estrela: "#D9971E",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "system-ui", "sans-serif"],
        sans: ["Figtree", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
