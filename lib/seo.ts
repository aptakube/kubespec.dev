// Helpers for page titles, descriptions and structured data

export const SITE_NAME = "kubespec.dev";

// Every URL matches one of the dynamic routes, so 404s come from their notFound() and take the title from their metadata
export const NOT_FOUND_METADATA = { title: "Page not found" };

// Search engines show about 155 characters of a description, so longer text is cut at a word
export function truncate(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:]+$/, "")}…`;
}

// "Deployment enables declarative updates for Pods and ReplicaSets. More text" -> the first sentence
export function firstSentence(text: string | undefined): string | undefined {
  const flat = text?.replace(/\s+/g, " ").trim();
  if (!flat) return undefined;
  const match = /^.*?[.!?](?=\s|$)/.exec(flat);
  return match ? match[0] : flat;
}

// The social preview image of a page, rendered by app/og/[[...path]]/route.tsx
export function ogImages(pagePath: string, alt: string) {
  return [{ url: `/og${pagePath === "/" ? "" : pagePath}`, width: 1200, height: 630, alt }];
}
