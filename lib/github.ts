import { cacheLife } from "next/cache";
import { GITHUB_REPO } from "./urls";

// The repo's star count, refreshed on each deploy: a shorter cache life would make every page that shows it
// render again when it expires. Undefined when GitHub can't be reached, so a failed lookup never breaks the page (or the build).
export async function getStarCount(): Promise<number | undefined> {
  "use cache";
  cacheLife("max");

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
