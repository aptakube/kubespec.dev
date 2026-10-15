import type { NextConfig } from "next";
import { HOME_PROJECT } from "./lib/urls.ts";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingIncludes: {
    // read at startup by lib/index.ts
    "/**": ["./index/*/versions.json"],
    // read at runtime by getKindChangelog (kind pages) and getProjectChangelog (the home page and project pages).
    // Keys are globs, so the brackets and dots of the route are escaped.
    "/": ["./index/*/changelog/**/*.json"],
    "/\\[project\\]": ["./index/*/changelog/**/*.json"],
    "/\\[project\\]/\\[version\\]": ["./index/*/changelog/**/*.json"],
    "/sitemaps/\\[project\\]": ["./index/*/changelog/**/*.json"],
    // read by the changelog endpoints, called when a change or a version is expanded
    "/api/change-description": ["./index/*/changelog/**/*.json"],
    "/api/version-changes": ["./index/*/changelog/**/*.json"],
    // and the examples and links of each kind, read by getKindMetadata
    "/\\[project\\]/\\[version\\]/\\[\\.\\.\\.kind\\]": ["./index/*/changelog/**/*.json", "./index/*/examples/**/*.md", "./index/*/links/**/*.json"],
  },
  redirects() {
    // the home project's latest version is the home page; its older versions keep their /{project}/{version} URLs
    return [{ source: `/${HOME_PROJECT}`, destination: "/", permanent: true }];
  },
  rewrites() {
    // see app/sitemaps/[project]/route.ts
    return [{ source: "/:project/sitemap.xml", destination: "/sitemaps/:project" }];
  },
};

export default nextConfig;
