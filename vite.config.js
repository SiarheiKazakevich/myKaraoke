import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For https://USERNAME.github.io/REPOSITORY/ set base to "/REPOSITORY/".
// For https://USERNAME.github.io/ or a custom domain, use "/".
export default defineConfig({
  plugins: [react()],
  base: "myKaraoke",
});