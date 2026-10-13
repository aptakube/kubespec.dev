import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { parse } from "yaml";
import { isIndexedKind } from "./index";

export type KindExample = { title: string; description?: string; yaml: string };
export type KindLink = { name: string; href: string };
export type KindMetadata = { examples: KindExample[]; links: KindLink[] };

// Hand-written examples and links of a kind, kept next to the generated index (scripts/build-index.ts leaves them alone):
//   index/<project>/examples/<apiVersion>/<Kind>/<n>-<name>.md  frontmatter with a title and description, then a ```yaml block; sorted by file name
//   index/<project>/links/<apiVersion>/<Kind>.json              [{ "name": "...", "href": "..." }]
// The same files apply to every version of the project. They're traced into the build in next.config.ts.
export async function getKindMetadata(slug: string, apiVersion: string, kind: string): Promise<KindMetadata> {
  "use cache";
  cacheLife("max");

  // the arguments become a file path, so only kinds from the index are read
  if (!isIndexedKind(slug, apiVersion, kind)) return { examples: [], links: [] };
  const dir = path.join(process.cwd(), "index", slug);

  const examplesDir = path.join(dir, "examples", apiVersion, kind);
  const files = (await readdir(examplesDir).catch(() => [])).filter((f) => f.endsWith(".md")).sort();
  const examples = await Promise.all(files.map(async (f) => parseExample(await readFile(path.join(examplesDir, f), "utf-8"))));

  const links: KindLink[] = await readFile(path.join(dir, "links", apiVersion, `${kind}.json`), "utf-8")
    .then(JSON.parse)
    .catch(() => []);
  return { examples, links };
}

function parseExample(content: string): KindExample {
  const [, frontmatter = "", body = content] = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const { title, description } = parse(frontmatter) ?? {};
  const yaml = body.match(/```ya?ml\n([\s\S]*?)```/)?.[1] ?? body;
  return { title, description, yaml: yaml.trimEnd() };
}
