import type { Metadata } from "next";
import Link from "next/link";
import { groupOf, resolveKinds, versionRank } from "@/lib/kinds";
import { getStarCount } from "@/lib/github";
import { listProjectIndexes } from "@/lib/index";
import { SITE_NAME, ogImages, truncate } from "@/lib/seo";
import type { KindRef, ProjectIndex, ProjectVersion } from "@/lib/types";
import { SITE_URL, projectHref } from "@/lib/urls";
import { JsonLd } from "./json-ld";
import { KindList, type KindGroup } from "./kind-list";
import { LocalDate } from "./local-date";
import { ProjectChangelogSection } from "./project-changelog";
import { ProjectGrid } from "./project-grid";
import { TopBar } from "./top-bar";

// Groups kinds by API group (core first, then alphabetical), merging a kind's apiVersions into one entry
function groupKinds(kinds: KindRef[]): KindGroup[] {
  const groups = new Map<string, Map<string, KindGroup["kinds"][number]>>();
  for (const k of kinds) {
    const group = groupOf(k.apiVersion);
    const byKind = groups.get(group) ?? groups.set(group, new Map()).get(group)!;
    const entry = byKind.get(k.kind) ?? byKind.set(k.kind, { kind: k.kind, scope: k.scope, apiVersions: [] }).get(k.kind)!;
    entry.apiVersions.push(k.apiVersion);
  }

  return [...groups]
    .sort(([a], [b]) => (a === "" ? -1 : b === "" ? 1 : a.localeCompare(b)))
    .map(([group, byKind]) => ({
      group,
      kinds: [...byKind.values()]
        .sort((a, b) => a.kind.localeCompare(b.kind))
        .map((k) => ({ ...k, apiVersions: k.apiVersions.sort((a, b) => versionRank(b) - versionRank(a)) })),
    }));
}

function describe(project: ProjectIndex, version: ProjectVersion): string {
  const groups = groupKinds(resolveKinds(project.versions).get(version.tag)!);
  const kinds = groups.flatMap((g) => g.kinds.map((k) => k.kind));
  return truncate(
    `All ${kinds.length} kinds in ${project.name} ${version.version}, including ${kinds.slice(0, 4).join(", ")}. Browse every field, type and description, and what changed between versions.`,
  );
}

// Metadata of a project's kind list. The latest version leaves the version out of the title, so it stays the same across releases.
export function projectMetadata(project: ProjectIndex, version: ProjectVersion): Metadata {
  const title = version === project.versions[0] ? `${project.name} API reference – every kind and field` : `${project.name} ${version.version} API reference`;
  const description = describe(project, version);
  const canonical = projectHref(project.slug, version.version, project.versions[0].version);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", siteName: SITE_NAME, title, description, url: canonical, images: ogImages(canonical, title) },
    twitter: { card: "summary_large_image", title, description },
  };
}

// All kinds of a project at one version, with a top bar to switch project and version
export function ProjectView({ project, version }: { project: ProjectIndex; version: ProjectVersion }) {
  const groups = groupKinds(resolveKinds(project.versions).get(version.tag)!);
  const kindCount = groups.reduce((n, g) => n + g.kinds.length, 0);
  const url = `${SITE_URL}${projectHref(project.slug, version.version, project.versions[0].version)}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${project.name} ${version.version} API reference`,
          description: describe(project, version),
          url,
          dateModified: version.date,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          about: { "@type": "SoftwareApplication", name: project.name, softwareVersion: version.version, url: `https://github.com/${project.repo}` },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [{ "@type": "ListItem", position: 1, name: `${project.name} ${version.version}`, item: url }],
          },
        }}
      />
      <ProjectTopBar project={project} version={version} />
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12">
        <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <img src={project.logo} alt="" width={32} height={32} className="rounded" />
          {project.name}
          <span className="font-mono text-xl font-normal text-gray-500">{version.version}</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {kindCount} kinds in {groups.length} API {groups.length === 1 ? "group" : "groups"} · released <LocalDate date={version.date} /> ·{" "}
          <a href={`https://github.com/${project.repo}/releases/tag/${version.tag}`} className="underline">
            {project.repo}@{version.tag}
          </a>
        </p>

        <KindList
          groups={groups}
          project={project.slug}
          version={version.version}
          latestVersion={project.versions[0].version}
        />

        <ProjectChangelogSection project={project} version={version} />

        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight">Explore other projects</h2>
          <div className="mt-4">
            <ProjectGrid projects={listProjectIndexes().filter((p) => p.slug !== project.slug)} />
          </div>
        </section>
      </main>
    </>
  );
}

// The top bar with only what it needs from the index, so the full index isn't sent to the client
export async function ProjectTopBar({ project, version }: { project: ProjectIndex; version: ProjectVersion }) {
  return (
    <TopBar
      stars={await getStarCount()}
      projects={listProjectIndexes().map(({ slug, name, logo }) => ({ slug, name, logo }))}
      versions={project.versions.map(({ version, date }) => ({ version, date }))}
      project={project.slug}
      version={version.version}
    />
  );
}


// mirrors the layout of the top bar, the heading and the kind search, so nothing shifts when the page streams in
export function ProjectSkeleton() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="mr-2 flex shrink-0 items-center gap-1 text-lg font-bold tracking-tighter">
            <img src="/kubespec.png" alt="Kubespec Logo" width={24} height={24} />
            kubespec.dev
          </Link>
          <div className="h-7.5 w-32 animate-pulse rounded-md bg-gray-100" />
          <div className="h-7.5 w-20 animate-pulse rounded-md bg-gray-100" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12" aria-busy>
        <div className="h-9 w-72 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-5 w-96 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-6 h-9.5 animate-pulse rounded-lg bg-gray-100" />
        <div className="mt-6 h-64 animate-pulse rounded bg-gray-100" />
      </main>
    </>
  );
}
