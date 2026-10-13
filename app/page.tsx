import type { Metadata } from "next";
import { getProjectIndex, listProjectIndexes } from "@/lib/index";
import { SITE_NAME } from "@/lib/seo";
import { HOME_PROJECT, SITE_URL } from "@/lib/urls";
import { JsonLd } from "./json-ld";
import { ProjectView } from "./project-view";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const project = getProjectIndex(HOME_PROJECT)!;
  const others = listProjectIndexes().length - 1;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          alternateName: "Kubernetes Spec Explorer",
          url: SITE_URL,
          description: `API reference for Kubernetes and ${others} popular CRD ${others === 1 ? "project" : "projects"}, across versions.`,
        }}
      />
      <ProjectView project={project} version={project.versions[0]} />
    </>
  );
}
