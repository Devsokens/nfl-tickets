import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // Serveur de dev limité à cette machine : vite 5 a une faille de lecture
    // de fichiers exploitable par tout appareil du réseau s'il écoute sur "::".
    // Pour tester sur téléphone : `npx vite --host` le temps du test.
    host: "localhost",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
