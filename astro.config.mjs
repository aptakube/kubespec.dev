// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

import node from "@astrojs/node";

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

  server: {
    port: 4321,
    host: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: "standalone",
  }),
});
