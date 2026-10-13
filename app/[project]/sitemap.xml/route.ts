import { getProjectIndex, listProjectIndexes } from "@/lib/index";
import { projectSitemap } from "@/lib/sitemap";

export function generateStaticParams() {
  return listProjectIndexes().map((p) => ({ project: p.slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/[project]/sitemap.xml">) {
  const project = getProjectIndex((await params).project);
  if (!project) return new Response("Not Found", { status: 404 });
  return projectSitemap(project);
}
