/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        red: "0 0 30px rgba(239, 68, 68, 0.5)"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        progress: "progress 10s ease-out"
      }
    }
  },
  plugins: []
};
