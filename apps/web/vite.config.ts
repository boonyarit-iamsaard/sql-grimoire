import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // sql.js ships CommonJS; it must be prebundled to ESM or the dev-mode
  // module worker fails to import it (prod builds work either way).
  optimizeDeps: { include: ["sql.js"] },
});
