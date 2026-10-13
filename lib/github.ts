import { cacheLife } from "next/cache";
import { GITHUB_REPO } from "./urls";

// The repo's star count, refreshed every few hours. Undefined when GitHub can't be reached,
// so a failed lookup never breaks the page (or the build).
export async function getStarCount(): Promise<number | undefined> {
  "use cache";
  cacheLife({ revalidate: 6 * 60 * 60 });

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return undefined;
    const { stargazers_count } = (await response.json()) as { stargazers_count: number };
    return stargazers_count;
  } catch {
    return undefined;
  }
}
