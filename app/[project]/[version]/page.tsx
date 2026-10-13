import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectIndex, getProjectVersion } from "@/lib/index";
import { NOT_FOUND_METADATA } from "@/lib/seo";
import { HOME_PROJECT } from "@/lib/urls";
import { ProjectView, projectMetadata } from "../../project-view";

// wait for the complete page instead of streaming a shell, so notFound() returns a real 404
export const ensureStatic = "navigation";

// Too many versions to prerender: each page renders on its first visit and is cached from then on.
// Cache Components requires at least one prerendered path, so the build renders the home project's latest version.
export function generateStaticParams() {
  const project = getProjectIndex(HOME_PROJECT)!;
  return [{ project: project.slug, version: project.versions[0].version }];
}

async function load(params: PageProps<"/[project]/[version]">["params"]) {
  const { project, version } = await params;
  return getProjectVersion(project, version);
}

export async function generateMetadata({ params }: PageProps<"/[project]/[version]">): Promise<Metadata> {
  const found = await load(params);
  return found ? projectMetadata(found.project, found.version) : NOT_FOUND_METADATA;
}

export default async function ProjectVersionPage({ params }: PageProps<"/[project]/[version]">) {
  const found = await load(params);
  if (!found) notFound();

  return <ProjectView project={found.project} version={found.version} />;
}
