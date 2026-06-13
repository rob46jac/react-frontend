import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["react-frontend-d4bhu5.apps.labkita.site"],
  },
  preview: {
    allowedHosts: ["react-frontend-d4bhu5.apps.labkita.site"],
  },
});
