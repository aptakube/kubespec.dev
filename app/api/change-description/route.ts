import { getChangeDescription } from "@/lib/index";
import type { ChangeDescription } from "@/lib/types";
import { CDN_MAX_AGE } from "@/lib/urls";
import { diffWords } from "@/lib/word-diff";

// Loaded when a change is expanded, since sending every description with the page would make it several MB.
// A GET rather than a server action, so the CDN caches it.
// /api/change-description?project=kubernetes&apiVersion=apps/v1&kind=Deployment&tag=v1.31.0&field=spec.replicas
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const [slug, apiVersion, kind, tag, field] = ["project", "apiVersion", "kind", "tag", "field"].map((p) => params.get(p));
  if (!slug || !apiVersion || !kind || !tag || field === null) return new Response("Bad Request", { status: 400 });

  const { before, after } = await getChangeDescription(slug, apiVersion, kind, tag, field);
  const body: ChangeDescription = before !== undefined && after !== undefined ? { diff: diffWords(before, after) } : { text: after ?? before };
  return Response.json(body, { headers: { "Cache-Control": `public, max-age=86400, s-maxage=${CDN_MAX_AGE}` } });
}
