// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import { sync as globSync } from "fast-glob";

import vercel from "@astrojs/vercel";
import { astroExpressiveCode } from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://kubespec.dev",
  output: "server",
  trailingSlash: "never",

  integrations: [
    react(),
    astroExpressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `.${theme.type}`,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel({
    includeFiles: globSync("./content/**/*"),
  }),
});
