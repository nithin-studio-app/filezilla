import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  plugins: [react(), libInjectCss(), dts({ include: ["src"], rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "filezilla",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-router-dom", "@nithin-studio-app/ui-components"],
    },
  },
});
