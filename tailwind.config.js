// tailwind.config.js

module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "fade-out": "fade-out 0.2s ease-in forwards",
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
  ],
};
