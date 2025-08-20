import { writeFile, mkdir, access, constants } from "node:fs/promises";
import { default as ALL_PROJECTS, type ProjectDef } from "@lib/kube/projects";

const tagsToIgnore = [
  "rc",
  "test",
  "alpha",
  "dev",
  "snapshot",
  "beta",
  "pre",
  "chart",
  "helm",
];

function isYamlFile(name: string) {
  const n = name.toLowerCase();
  // only accept .yaml/.yml and skip common non-CRD files like kustomization.yaml
  return (n.endsWith(".yaml") || n.endsWith(".yml")) && !n.includes("kustomization");
}

async function findTags(project: ProjectDef) {
  const response = await fetch(
    `https://api.github.com/repos/${project.repo}/git/refs/tags`,
    {
      headers: { Authorization: `Bearer ${process.env.GH_TOKEN}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list tags for ${project.repo}: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  return body
    .map((t: any) => String(t.ref || "").replace("refs/tags/", ""))
    .filter((t: string) => t && !tagsToIgnore.some((p) => t.includes(p)))
    .filter(project.filterTag ?? (() => true));
}

async function fsExists(path: string) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function downloadManifestsFromGit(
  project: ProjectDef,
  tag: string,
  outDir: string
) {
  const files: Array<{ name: string; download_url: string }> = [];
  const pathsToLook = project.pathToManifests ? [...project.pathToManifests] : [];

  while (pathsToLook.length > 0) {
    const path = pathsToLook.pop()!;
    const resp = await fetch(
      `https://api.github.com/repos/${project.repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(tag)}`,
      {
        headers: { Authorization: `Bearer ${process.env.GH_TOKEN}` },
      }
    );

    if (!resp.ok) {
      // ignore missing paths in some versions; just continue
      continue;
    }

    let blobs = await resp.json();
    if (!Array.isArray(blobs)) {
      blobs = [blobs];
    }

    for (const blob of blobs) {
      // blob: { type: "file" | "dir", path, name, download_url? }
      if (blob.type === "dir") {
        // dive deeper
        pathsToLook.push(blob.path);
        continue;
      }
      if (blob.type === "file" && blob.download_url && isYamlFile(blob.name)) {
        files.push({ name: blob.name, download_url: blob.download_url });
      }
      // otherwise: skip non-yaml/unsupported items
    }
  }

  // write files
  for (const f of files) {
    const r = await fetch(f.download_url);
    if (!r.ok) continue;
    const body = await r.text();
    await writeFile(`${outDir}/${f.name}`, body);
  }

  console.log(`- Downloaded ${project.slug}@${tag} (${files.length} files)`);
}

// ---- Main ----
if (!process.env.GH_TOKEN) {
  throw new Error("GH_TOKEN environment variable is required");
}

for (const project of ALL_PROJECTS) {
  console.log(`Processing ${project.slug}...`);

  const tags = await findTags(project);
  for (const tag of tags) {
    const tagFolder = project.mapTag ? project.mapTag(tag) : tag;
    const outDir = `./content/projects/${project.slug}/${tagFolder}`;
    if (await fsExists(outDir)) continue;

    await mkdir(outDir, { recursive: true });
    await downloadManifestsFromGit(project, tag, outDir);
  }
}


