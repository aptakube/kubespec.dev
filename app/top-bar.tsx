"use client";

import Link from "next/link";
import { GITHUB_REPO, projectHref } from "@/lib/urls";
import { Dropdown } from "./dropdown";
import { LocalDate } from "./local-date";
import { ThemeToggle } from "./theme-toggle";

type Props = {
  projects: { slug: string; name: string; logo: string }[];
  // newest first
  versions: { version: string; date: string }[];
  project: string;
  version: string;
  // GitHub stars, when they could be fetched
  stars?: number;
};

export function TopBar({ projects, versions, project, version, stars }: Props) {
  const current = projects.find((p) => p.slug === project)!;
  const latest = versions[0].version;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-1 text-lg font-bold tracking-tighter">
          <img src="/kubespec.png" alt="Kubespec Logo" width={24} height={24} />
          kubespec.dev
        </Link>
        <Dropdown
          label="Project"
          searchable
          value={<ProjectLabel {...current} />}
          items={projects.map((p) => ({
            key: p.slug,
            href: projectHref(p.slug),
            content: <ProjectLabel {...p} />,
            searchText: `${p.name} ${p.slug}`,
            selected: p.slug === project,
          }))}
        />
        <span className="text-gray-300" aria-hidden>
          /
        </span>
        <Dropdown
          label="Version"
          value={version}
          items={versions.map((v) => ({
            key: v.version,
            href: projectHref(project, v.version, latest),
            content: (
              <>
                {v.version}
                <span className="ml-auto pl-4 text-xs text-gray-500">
                  <LocalDate date={v.date} relative />
                </span>
              </>
            ),
            selected: v.version === version,
          }))}
        />
        <ThemeToggle />
        <Link href="/docs/mcp" className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:flex">
          <span className="rounded bg-blue-600/10 px-1 py-px font-mono text-[11px] font-semibold text-blue-600">MCP</span>
          Use with AI
        </Link>
        <a
          href={`https://github.com/${GITHUB_REPO}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={stars === undefined ? "GitHub" : `GitHub, ${stars} stars`}
          className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-sm hover:bg-gray-100 sm:flex"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="size-4">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          {stars !== undefined && (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-3.5 text-amber-500">
                <path
                  fillRule="evenodd"
                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="tabular-nums">{new Intl.NumberFormat("en", { notation: "compact" }).format(stars)}</span>
            </>
          )}
        </a>
      </div>
    </header>
  );
}

function ProjectLabel({ name, logo }: { name: string; logo: string }) {
  return (
    <>
      <img src={logo} alt="" width={16} height={16} className="rounded-sm" />
      {name}
    </>
  );
}
