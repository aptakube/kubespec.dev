// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

import vercel from "@astrojs/vercel";
import { valid } from "semver";

// https://astro.build/config
export default defineConfig({
  site: "https://kubespec.cicd.swissblock.tech",
  trailingSlash: "never",

  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        const parts = path.split("/").filter(Boolean);
        if (parts.length >= 2) {
          if (parts[1].startsWith("v1.") || valid(parts[1])) {
            return false; // Skip versioned pages, only include latest (which doesn't have a version in the path)
          }
        }

        return true;
      },
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
