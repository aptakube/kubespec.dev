import { getKindChangelog, listProjectIndexes } from "./index";
import { findKind, lastChangedIn } from "./kind-route";
import { groupOf, resolveKinds, sortKinds, versionRank } from "./kinds";
import type { ProjectIndex } from "./types";
import { SITE_URL, kindHref, projectHref } from "./urls";

// /sitemap.xml is an index of the per-project sitemaps at /{project}/sitemap.xml, and of /docs/sitemap.xml
export const projectSitemapUrl = (slug: string) => `${SITE_URL}/${slug}/sitemap.xml`;

// Pages outside the projects, with the date their content last changed. Update the date when editing a page.
export const DOCS_PAGES = [{ path: "/docs/mcp", date: "2026-10-08" }];

function xml(body: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`, {
    headers: { "Content-Type": "application/xml" },
  });
}

export function sitemapIndex(): Response {
  const docsDate = DOCS_PAGES.map((p) => p.date).sort().at(-1)!;
  const entries = [
    ...listProjectIndexes().map((p) => ({ loc: projectSitemapUrl(p.slug), date: p.versions[0].date })),
    { loc: `${SITE_URL}/docs/sitemap.xml`, date: docsDate },
  ].map(({ loc, date }) => `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${date}</lastmod>\n  </sitemap>`);
  return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</sitemapindex>`);
}

// Only the project's latest version: its kind list and every kind page, each kind dated by the
// last version that changed it. A kind served at several apiVersions is listed once, at its most stable one.
// Older versions and apiVersions stay reachable through the site, but aren't worth crawling.
export async function projectSitemap(project: ProjectIndex): Promise<Response> {
  const latest = project.versions[0];
  const kinds = sortKinds([
    ...new Map(
      resolveKinds(project.versions)
        .get(latest.tag)!
        .sort((a, b) => versionRank(a.apiVersion) - versionRank(b.apiVersion))
        .map((k) => [`${groupOf(k.apiVersion)}/${k.kind}`, k]),
    ).values(),
  ]);
  const pages = [
    { path: projectHref(project.slug), date: latest.date },
    ...(await Promise.all(
      kinds.map(async (k) => {
        const route = findKind(project, latest, k.apiVersion, k.kind)!;
        const changelog = await getKindChangelog(project.slug, k.apiVersion, k.kind);
        return { path: kindHref(project.slug, latest.version, k.apiVersion, k.kind, latest.version), date: lastChangedIn(route, changelog).date };
      }),
    )),
  ];

  const entries = pages.map(({ path, date }) => `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`);
  return xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`);
}

export function docsSitemap(): Response {
  const entries = DOCS_PAGES.map(({ path, date }) => `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`);
  return xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`);
}
