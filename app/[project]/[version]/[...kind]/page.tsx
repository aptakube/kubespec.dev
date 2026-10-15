import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getKindChangelog, getProjectIndex } from "@/lib/index";
import { lastChangedIn, resolveKindRoute, type KindRoute } from "@/lib/kind-route";
import { getKindSchema, type KindSchema } from "@/lib/kind-schema";
import { groupOf, resolveKinds, versionRank } from "@/lib/kinds";
import { getKindMetadata } from "@/lib/metadata";
import { NOT_FOUND_METADATA, SITE_NAME, firstSentence, ogImages, truncate } from "@/lib/seo";
import { HOME_PROJECT, SITE_URL, kindHref, projectHref } from "@/lib/urls";
import { FieldTree } from "../../../field-tree";
import { JsonLd } from "../../../json-ld";
import { KindChangelogSection } from "../../../kind-changelog";
import { KubernetesIcon } from "../../../icons";
import { KindExamplesSection, KindLinksSection } from "../../../kind-metadata";
import { ProjectTopBar } from "../../../project-view";

// wait for the complete page instead of streaming a shell, so notFound() returns a real 404
export const ensureStatic = "navigation";

// Too many kinds to prerender: each page renders on its first visit and is cached from then on.
// Cache Components requires at least one prerendered path, so the build renders the first kind
// of the home project's latest version.
export function generateStaticParams() {
  const project = getProjectIndex(HOME_PROJECT)!;
  const latest = project.versions[0];
  const kind = resolveKinds(project.versions).get(latest.tag)![0];
  // the latest version has no version segment, so the URL's segments shift left by one
  const [first, ...rest] = [...kind.apiVersion.split("/"), kind.kind];
  return [{ project: project.slug, version: first, kind: rest }];
}

// the page's own URL; older versions of a kind that still exists point search engines at the latest one
function urls({ project, version, ref, inLatest }: KindRoute) {
  const latest = project.versions[0].version;
  const self = kindHref(project.slug, version.version, ref.apiVersion, ref.kind, latest);
  return { self, canonical: inLatest ? kindHref(project.slug, latest, ref.apiVersion, ref.kind, latest) : self };
}

function describe({ project, version, ref }: KindRoute, schema: KindSchema | undefined): string {
  const summary = firstSentence(schema?.description);
  return truncate(`${ref.kind} (${ref.apiVersion}) in ${project.name} ${version.version}. ${summary ? `${summary} ` : ""}Browse every field, type and change across versions.`);
}

export async function generateMetadata({ params }: PageProps<"/[project]/[version]/[...kind]">): Promise<Metadata> {
  const found = resolveKindRoute(await params);
  if (!found) return NOT_FOUND_METADATA;
  const { project, version, ref } = found;
  const schema = await getKindSchema(version.urls, ref.apiVersion, ref.kind);

  // the latest version leaves the version out, so the title stays the same across releases
  const title = `${ref.kind} spec (${ref.apiVersion}) – ${project.name}${version === project.versions[0] ? "" : ` ${version.version}`}`;
  const description = describe(found, schema);
  const { self, canonical } = urls(found);
  return {
    title,
    description,
    alternates: { canonical },
    // older versions aren't worth indexing, nor crawling the kinds they link to
    ...(version !== project.versions[0] && { robots: { index: false, follow: false } }),
    openGraph: { type: "article", siteName: SITE_NAME, title, description, url: canonical, images: ogImages(self, title) },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function KindPage({ params }: PageProps<"/[project]/[version]/[...kind]">) {
  return (
    <Suspense fallback={<KindSkeleton />}>
      <KindDetails params={params} />
    </Suspense>
  );
}

async function KindDetails({ params }: Pick<PageProps<"/[project]/[version]/[...kind]">, "params">) {
  const found = resolveKindRoute(await params);
  if (!found) notFound();

  const { project, version, ref } = found;
  if (found.explicitLatest) {
    permanentRedirect(kindHref(project.slug, version.version, ref.apiVersion, ref.kind, project.versions[0].version));
  }

  const [schema, changelog, metadata] = await Promise.all([
    getKindSchema(version.urls, ref.apiVersion, ref.kind),
    getKindChangelog(project.slug, ref.apiVersion, ref.kind),
    getKindMetadata(project.slug, ref.apiVersion, ref.kind),
  ]);
  const latest = project.versions[0].version;
  const lastChanged = lastChangedIn(found, changelog);
  const topLevel = schema?.types[schema.root] ?? [];
  const url = `${SITE_URL}${urls(found).self}`;
  const listUrl = `${SITE_URL}${projectHref(project.slug, version.version, latest)}`;

  // other kinds of the same API group in this version, each at its most stable apiVersion
  const related = [
    ...new Map(
      resolveKinds(project.versions)
        .get(version.tag)!
        .filter((k) => groupOf(k.apiVersion) === groupOf(ref.apiVersion) && k.kind !== ref.kind)
        .sort((a, b) => versionRank(a.apiVersion) - versionRank(b.apiVersion))
        .map((k) => [k.kind, k]),
    ).values(),
  ].sort((a, b) => a.kind.localeCompare(b.kind));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TechArticle",
              headline: `${ref.kind} (${ref.apiVersion})`,
              description: describe(found, schema),
              url,
              inLanguage: "en",
              datePublished: found.introducedIn.date,
              dateModified: lastChanged.date,
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
              about: {
                "@type": "SoftwareApplication",
                name: project.name,
                softwareVersion: version.version,
                url: `https://github.com/${project.repo}`,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: `${project.name} ${version.version}`, item: listUrl },
                { "@type": "ListItem", position: 2, name: ref.apiVersion, item: listUrl },
                { "@type": "ListItem", position: 3, name: ref.kind, item: url },
              ],
            },
          ],
        }}
      />
      <ProjectTopBar project={project} version={version} />
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12">
        <Link
          href={projectHref(project.slug, version.version, project.versions[0].version)}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← All {project.name} {version.version} kinds
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-blue-600">{ref.apiVersion}</span>
          <span className="text-gray-400">·</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-600">
            <ScopeIcon scope={ref.scope} />
            {ref.scope} Resource
          </span>
          <span className="text-gray-400">·</span>
          <a href="#changelog" className="text-gray-500 hover:text-gray-900">
            Changelog
          </a>
          {metadata.examples.length > 0 && (
            <>
              <span className="text-gray-400">·</span>
              <a href="#examples" className="text-gray-500 hover:text-gray-900">
                Examples
              </a>
            </>
          )}
        </div>
        <h1 className="mt-1 text-4xl font-bold tracking-tight">{ref.kind}</h1>

        {schema ? (
          <>
            {schema.description && (
              <p className="mt-4 max-w-3xl border-l-2 border-gray-300 pl-4 text-[15px] leading-relaxed whitespace-pre-wrap text-gray-600">
                {schema.description}
              </p>
            )}
            <p className="mt-4 text-sm text-gray-500">
              {topLevel.length} top-level {topLevel.length === 1 ? "field" : "fields"}
              {topLevel.some((f) => f.required) && <>, {topLevel.filter((f) => f.required).length} required</>} ·{" "}
              {lastChanged === found.introducedIn ? "unchanged since " : "last changed in "}
              <a href="#changelog" className="underline hover:text-gray-900">
                {project.name} {lastChanged.version}
              </a>
            </p>

            <div className="mt-4">
              {schema.types[schema.root] ? (
                <FieldTree root={schema.root} types={schema.types} />
              ) : (
                <p className="text-gray-500">This kind has no field schema.</p>
              )}
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Source:{" "}
              <a
                href={schema.url.replace(`https://raw.githubusercontent.com/${project.repo}/`, `https://github.com/${project.repo}/blob/`)}
                className="underline"
              >
                {schema.url.split("/").at(-1)}
              </a>
            </p>
          </>
        ) : (
          <p className="mt-6 text-gray-500">No schema available.</p>
        )}

        <KindChangelogSection
          project={project}
          version={version}
          apiVersion={ref.apiVersion}
          kind={ref.kind}
          changelog={changelog}
          introducedIn={found.introducedIn}
        />

        <KindExamplesSection kind={ref.kind} examples={metadata.examples} />
        <KindLinksSection links={metadata.links} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight">More in {groupOf(ref.apiVersion) || "the core API group"}</h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {related.map((k) => (
                <li key={k.kind}>
                  <Link
                    prefetch={false}
                    href={kindHref(project.slug, version.version, k.apiVersion, k.kind, latest)}
                    className="block rounded-md border border-gray-200 px-2.5 py-1 hover:border-gray-300 hover:bg-gray-50"
                  >
                    {k.kind}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

// mirrors the layout of the top bar and the kind header, so nothing shifts when the page streams in
function KindSkeleton() {
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
        <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
        <div className="mt-5 h-6 w-64 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-10 w-56 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-16 max-w-3xl animate-pulse rounded bg-gray-100" />
      </main>
    </>
  );
}

// a cube for namespaced kinds, the Kubernetes wheel for cluster-scoped ones
function ScopeIcon({ scope }: { scope: "Namespaced" | "Cluster" }) {
  if (scope === "Cluster") return <KubernetesIcon className="size-4" />;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden className="size-4 text-gray-500">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
      />
    </svg>
  );
}
