import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  optimizeDeps: {
    include: ["swiper/react", "swiper/modules"],
  },
  plugins: [
    react(),
    visualizer({ filename: "reports/bundle-analysis.html", template: "treemap", gzipSize: true, brotliSize: true }),
    visualizer({ filename: "reports/bundle-analysis.json", template: "raw-data", gzipSize: true, brotliSize: true }),
  ],
build: { cssCodeSplit: true, reportCompressedSize: true },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5031",
        changeOrigin: true,
      },
    },
  },
});
