import type { APIRoute } from "astro";
import { listProjects, listAllResources } from "@lib/kube";

export const GET: APIRoute = async () => {
  const site = "https://kubespec.dev";
  const urls: string[] = [site];

  const projects = await listProjects();
  for (const project of projects) {
    if (!project.tags || project.tags.length === 0) continue;

    const latestTag = project.tags[0];

    urls.push(`${site}/${project.slug}`);

    const resources = await listAllResources(project.slug, latestTag);
    for (const resource of resources) {
      const gvkRef = [resource.gvk.group, resource.gvk.version, resource.gvk.kind]
        .filter(Boolean)
        .join("/");
      urls.push(`${site}/${project.slug}/${gvkRef}`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
