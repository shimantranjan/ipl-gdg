import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/cricbuzz-proxy": {
        target: "https://cric-api.vercel.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cricbuzz-proxy/, "")
      },
      "/cricbuzz-site": {
        target: "https://www.cricbuzz.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cricbuzz-site/, "")
      }
    }
  }
})
