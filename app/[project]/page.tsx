import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProjectIndex, listProjectIndexes } from "@/lib/index";
import { HOME_PROJECT } from "@/lib/urls";
import { NOT_FOUND_METADATA } from "@/lib/seo";
import { ProjectSkeleton, ProjectView, projectMetadata } from "../project-view";

// wait for the complete page instead of streaming a shell, so notFound() returns a real 404
export const ensureStatic = "navigation";

// every project is known at build time; anything else is a 404 from the page below
export function generateStaticParams() {
  // the home project redirects to / (see next.config.ts)
  return listProjectIndexes()
    .filter((p) => p.slug !== HOME_PROJECT)
    .map((p) => ({ project: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[project]">): Promise<Metadata> {
  const project = getProjectIndex((await params).project);
  return project ? projectMetadata(project, project.versions[0]) : NOT_FOUND_METADATA;
}

export default function ProjectPage({ params }: PageProps<"/[project]">) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectDetails params={params} />
    </Suspense>
  );
}

async function ProjectDetails({ params }: Pick<PageProps<"/[project]">, "params">) {
  const project = getProjectIndex((await params).project);
  if (!project) notFound();

  return <ProjectView project={project} version={project.versions[0]} />;
}
