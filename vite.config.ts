import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "src/components/ui/**",
        "src/main.tsx",
        "src/App.tsx",
        "postcss.config.js",
        "tailwind.config.ts",
        "src/types/**",
        "src/hooks/use-mobile.tsx",
        "eslint.config.js",
        "vite.config.ts",
        "src/vite-env.d.ts",
        "src/hooks/use-toast.ts",
        "src/pages/About.tsx",
        "src/pages/NotFound.tsx",
        "src/components/Footer.tsx",
        "src/components/RestaurantMap.tsx",
        "src/components/AvailabilitySelector.tsx",
        "src/pages/RestaurantDetail.tsx",
      ],
    },
  },
}));