
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.03)', filter: 'brightness(1.05)' },
        },
      },
      animation: { breath: 'breath 2.2s ease-in-out infinite' },
    },
  },
  plugins: [],
}
