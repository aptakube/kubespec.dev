import { getProjectIndex, listProjectIndexes } from "@/lib/index";
import { projectSitemap } from "@/lib/sitemap";

// Served at /{project}/sitemap.xml through a rewrite in next.config.ts. It can't live at app/[project]/sitemap.xml:
// Next.js takes a route ending in /sitemap.xml for a static metadata file, prerenders it once as /-/sitemap.xml
// and ignores generateStaticParams, so on Vercel the requests fall through to /[project]/[version].

export function generateStaticParams() {
  return listProjectIndexes().map((p) => ({ project: p.slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/sitemaps/[project]">) {
  const project = getProjectIndex((await params).project);
  if (!project) return new Response("Not Found", { status: 404 });
  return projectSitemap(project);
}
