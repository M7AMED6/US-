import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blush: "#FFB6C1",
        softRose: "#F472B6",
        deepRose: "#E11D48",
        pastelBg: "#FFF0F3",
        warmWhite: "#FFFAFA",
        peachStart: "#FFE4E1",
        peachEnd: "#FADADD",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        dancing: ["var(--font-dancing)", "cursive"],
        greatvibes: ["var(--font-great-vibes)", "cursive"],
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-medium': 'floatMedium 4s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
        'wave-1': 'wave 1s ease-in-out infinite alternate',
        'wave-2': 'wave 1.2s ease-in-out infinite alternate 0.2s',
        'wave-3': 'wave 0.8s ease-in-out infinite alternate 0.4s',
        'wave-4': 'wave 1.4s ease-in-out infinite alternate 0.1s',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(3deg)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-3deg)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.08)' },
          '40%': { transform: 'scale(1.03)' },
          '60%': { transform: 'scale(1.12)' },
        },
        wave: {
          '0%': { height: '15%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
