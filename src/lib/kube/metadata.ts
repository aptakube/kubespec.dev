import { readFile, access, constants } from "node:fs/promises";
import type { GVK, Project } from "./types";

const All_EXAMPLES = import.meta.glob<any>(
  `../../../content/metadata/**/*.md`,
  {
    eager: true,
  }
);

export type GVKMetadata = {
  examples: any[];
  links: { name: string; href: string }[];
};

async function fsExists(path: string) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readMetadata(
  project: Project,
  gvk: GVK
): Promise<GVKMetadata> {
  const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;
  const baseDir = `./content/metadata/${project.slug}/${apiVersion}/${gvk.kind.toLowerCase()}`;
  const examples = Object.entries(All_EXAMPLES)
    .filter(([path]) => path.includes(baseDir))
    .map(([, value]) => value);

  const exists = await fsExists(baseDir);
  if (!exists) {
    return { examples, links: [] };
  }

  const content = await readFile(`${baseDir}/${gvk.kind}.json`, "utf-8");
  const { links } = JSON.parse(content);
  return { examples, links };
}
