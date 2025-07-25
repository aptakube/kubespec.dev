// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://kubespec.dev",
  trailingSlash: "never",
  integrations: [
    sitemap({
      filter: (page) => !page.startsWith("https://kubespec.dev/v1."),
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
