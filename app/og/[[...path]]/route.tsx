import { getProjectIndex, getProjectVersion, listProjectIndexes } from "@/lib/index";
import { resolveKindRoute } from "@/lib/kind-route";
import { CDN_MAX_AGE, HOME_PROJECT } from "@/lib/urls";
import { ogImage } from "../../og-image";

// Social preview images. The path mirrors the page's: /og is the home page, /og/{project} a project,
// /og/{project}/{version} an older version, and anything longer a kind (see ogImageUrl). /og/docs/mcp is the MCP server docs.
// Metadata image files can't live under the kind route's catch-all segment, hence a route handler.
export async function GET(_request: Request, { params }: RouteContext<"/og/[[...path]]">) {
  const path = (await params).path ?? [];
  const image = await render(path);
  if (!image) return new Response("Not Found", { status: 404 });
  // the content only changes with a new release, and a deploy purges the CDN cache anyway
  image.headers.set("Cache-Control", `public, max-age=${CDN_MAX_AGE}`);
  return image;
}

function render([slug, version, ...kind]: string[]) {
  if (!slug) {
    const kubernetes = getProjectIndex(HOME_PROJECT)!;
    const others = listProjectIndexes().length - 1;
    return ogImage({
      eyebrow: `Kubernetes ${kubernetes.versions[0].version} and ${others} CRD ${others === 1 ? "project" : "projects"}`,
      title: "Kubernetes API reference",
      subtitle: "Every field of every kind, across versions",
      logo: kubernetes.logo,
    });
  }

  if (slug === "docs" && version === "mcp" && kind.length === 0) {
    const kubernetes = getProjectIndex(HOME_PROJECT)!;
    return ogImage({ eyebrow: "MCP server", title: "Kubernetes specs for your AI assistant", subtitle: "Every kind and field, across versions", logo: kubernetes.logo });
  }

  if (!version) {
    const project = getProjectIndex(slug);
    if (!project) return undefined;
    return ogImage({ eyebrow: `${project.name} ${project.versions[0].version}`, title: `${project.name} API reference`, subtitle: "Every kind and field, across versions", logo: project.logo });
  }

  if (kind.length === 0) {
    const found = getProjectVersion(slug, version);
    if (!found) return undefined;
    const { project } = found;
    return ogImage({ eyebrow: `${project.name} ${found.version.version}`, title: `${project.name} API reference`, subtitle: "Every kind and field", logo: project.logo });
  }

  const found = resolveKindRoute({ project: slug, version, kind });
  if (!found) return undefined;
  const { project, ref } = found;
  return ogImage({ eyebrow: `${project.name} ${found.version.version}`, title: ref.kind, subtitle: `${ref.apiVersion} · ${ref.scope} resource`, logo: project.logo });
}
