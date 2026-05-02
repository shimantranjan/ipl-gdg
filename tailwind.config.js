export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0a0e1a", 2: "#111827", 3: "#1a2235", 4: "#1e2a3a" },
        accent: { DEFAULT: "#f97316", blue: "#3b82f6", green: "#22c55e", yellow: "#eab308" },
        border: { DEFAULT: "#1e2d40", 2: "#2a3f58" }
      },
      fontFamily: {
        rajdhani: ["Rajdhani", "sans-serif"],
        sans: ["DM Sans", "sans-serif"]
      }
    }
  },
  plugins: []
}
