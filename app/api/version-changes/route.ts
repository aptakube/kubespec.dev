import { getVersionChanges } from "@/lib/index";
import { CDN_MAX_AGE } from "@/lib/urls";

// Loaded when a version of the project changelog is expanded, since Kubernetes alone has over a thousand changed kinds.
// A GET rather than a server action, so the CDN caches it. Responds with null for the oldest version, which has no changes.
// /api/version-changes?project=kubernetes&tag=v1.31.0
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const slug = params.get("project");
  const tag = params.get("tag");
  if (!slug || !tag) return new Response("Bad Request", { status: 400 });

  const changes = (await getVersionChanges(slug, tag)) ?? null;
  return Response.json(changes, { headers: { "Cache-Control": `public, max-age=86400, s-maxage=${CDN_MAX_AGE}` } });
}
