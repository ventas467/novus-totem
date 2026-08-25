/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        novus: {
          DEFAULT: "#1C5274",
          dark: "#0F3249",
          light: "#2A7BA0",
          accent: "#38A3D1",
          gold: "#FACC15",
          lime: "#4ADE80",
          danger: "#EF4444"
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'cursive'],
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 0, 0, 0.5)',
        'pixel-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.6)',
        'pixel-gold': '4px 4px 0px 0px #FACC15',
        'pixel-inset': 'inset 4px 4px 0px 0px rgba(0,0,0,0.3)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
