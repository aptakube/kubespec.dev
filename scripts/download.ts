import { writeFile, mkdir, access, constants } from "node:fs/promises";
import ALL_PROJECTS, { type ProjectDef } from "@lib/crds/projects";

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

async function findTags(project: ProjectDef) {
  const response = await fetch(
    `https://api.github.com/repos/${project.repo}/git/refs/tags`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
      },
    }
  );

  const body = await response.json();
  return body
    .map((t: any) => t.ref.replace("refs/tags/", ""))
    .filter((t: string) => !tagsToIgnore.some((p) => t.includes(p)))
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
  let files = [];
  let pathsToLook = [project.pathToManifest ?? project.pathToManifests];

  while (pathsToLook.length > 0) {
    const path = pathsToLook.pop();
    const response = await fetch(
      `https://api.github.com/repos/${project.repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GH_TOKEN}`,
        },
      }
    );

    let blobs = await response.json();
    if (!Array.isArray(blobs)) {
      blobs = [blobs];
    }

    for (const blob of blobs) {
      if (blob.type === "dir") {
        pathsToLook.push(blob.path);
        continue;
      } else {
        files.push(blob);
      }
    }
  }

  for (const file of files) {
    const response = await fetch(file.download_url);
    const body = await response.text();
    await writeFile(`${outDir}/${file.name}`, body);
  }

  console.log(`- Downloaded ${project.slug}@${tag} (${files.length} files)`);
}

async function downloadManifestFromRelease(
  project: ProjectDef,
  tag: string,
  outDir: string
) {
  const response = await fetch(
    `https://github.com/${project.repo}/releases/download/${tag}/${project.releaseFileName}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
      },
    }
  );

  const body = await response.text();
  await writeFile(`${outDir}/${project.releaseFileName}`, body);
  console.log(`- Downloaded ${project.slug}@${tag} (1 file)`);
}

// Main
if (!process.env.GH_TOKEN) {
  throw new Error("GH_TOKEN environment variable is required");
}

for (const project of ALL_PROJECTS) {
  console.log(`Processing ${project.slug}...`);

  const tags = await findTags(project);
  for (const tag of tags) {
    const outDir = `./public/projects/${project.slug}/${tag}`;
    if (await fsExists(outDir)) {
      continue;
    }

    await mkdir(outDir, { recursive: true });
    if (project.releaseFileName) {
      await downloadManifestFromRelease(project, tag, outDir);
    } else {
      await downloadManifestsFromGit(project, tag, outDir);
    }
  }
}
