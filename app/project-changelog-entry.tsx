"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { KindRef, VersionChanges } from "@/lib/types";
import { kindHref } from "@/lib/urls";
import { ChangeCountsBadge } from "./change-counts";

type Props = {
  slug: string;
  tag: string;
  version: string;
  latestVersion: string;
  // the summary line and what goes below the changes
  title: React.ReactNode;
  footer: React.ReactNode;
};

// A version in the project changelog, whose changes are fetched on the first expand.
// The oldest version has no changes to load, only its footer.
export function VersionEntry({ slug, tag, version, latestVersion, title, footer }: Props) {
  const [changes, setChanges] = useState<VersionChanges>();
  const [loading, startLoading] = useTransition();
  const [loaded, setLoaded] = useState(false);

  const onToggle = (e: React.ToggleEvent<HTMLDetailsElement>) => {
    if (!e.currentTarget.open || loaded || loading) return;
    startLoading(async () => {
      const query = new URLSearchParams({ project: slug, tag });
      const result: VersionChanges | null = await fetch(`/api/version-changes?${query}`).then((r) => r.json());
      startLoading(() => {
        setChanges(result ?? undefined);
        setLoaded(true);
      });
    });
  };

  return (
    <li>
      <details onToggle={onToggle} className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded py-1 pr-2 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4 shrink-0 text-gray-500 transition-transform group-open:rotate-90">
            <path
              fillRule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
          {title}
        </summary>
        <div className="mb-3 ml-[5.5px] space-y-3 border-l border-gray-200 pt-1 pl-4">
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {changes && <Changes slug={slug} version={version} latestVersion={latestVersion} changes={changes} />}
          {footer}
        </div>
      </details>
    </li>
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const key = (k: Pick<KindRef, "apiVersion" | "kind">) => `${k.apiVersion}/${k.kind}`;

type ChangesProps = { slug: string; version: string; latestVersion: string; changes: VersionChanges };

// Kinds link to the version where they exist: removed ones to the version before, changed ones to their changelog
function Changes({ slug, version, latestVersion, changes: { olderVersion, added, removed, moved, changed } }: ChangesProps) {
  const href = (v: string, apiVersion: string, kind: string, hash = "") => kindHref(slug, v, apiVersion, kind, latestVersion) + hash;
  // older versions are noindex, so crawlers needn't follow links to them
  const rel = (v: string) => (v === latestVersion ? undefined : "nofollow");

  return (
    <>
      {added.length > 0 && (
        <Group title={`${plural(added.length, "kind has", "kinds have")} been added`}>
          {added.map((k) => (
            <KindLink key={key(k)} href={href(version, k.apiVersion, k.kind)} rel={rel(version)} kind={k.kind} apiVersion={k.apiVersion} color="text-green-700" />
          ))}
        </Group>
      )}
      {removed.length > 0 && (
        <Group title={`${plural(removed.length, "kind has", "kinds have")} been removed`}>
          {removed.map((k) => (
            <KindLink key={key(k)} href={href(olderVersion, k.apiVersion, k.kind)} rel={rel(olderVersion)} kind={k.kind} apiVersion={k.apiVersion} color="text-red-700" />
          ))}
        </Group>
      )}
      {moved.length > 0 && (
        <Group title={`${plural(moved.length, "kind has", "kinds have")} moved to another apiVersion`}>
          {moved.map((m) => (
            <KindLink key={`${m.from}/${m.kind}`} href={href(version, m.to, m.kind)} rel={rel(version)} kind={m.kind} apiVersion={`${m.from} → ${m.to}`} color="text-yellow-600" />
          ))}
        </Group>
      )}
      {changed.length > 0 && (
        <Group title={`${plural(changed.length, "kind has", "kinds have")} changed`}>
          {changed.map((c) => (
            <KindLink key={key(c)} href={href(version, c.apiVersion, c.kind, "#changelog")} rel={rel(version)} kind={c.kind} apiVersion={c.apiVersion} color="text-yellow-600">
              <ChangeCountsBadge {...c} />
            </KindLink>
          ))}
        </Group>
      )}
    </>
  );
}

type KindLinkProps = { href: string; rel?: string; kind: string; apiVersion: string; color: string; children?: React.ReactNode };

function KindLink({ href, rel, kind, apiVersion, color, children }: KindLinkProps) {
  return (
    <li>
      <Link href={href} rel={rel} prefetch={false} className="-mx-1 inline-flex items-baseline rounded px-1 hover:bg-gray-100">
        <span className={`font-medium ${color}`}>{kind}</span>
        <span className="ml-1.5 font-mono text-xs text-gray-500">{apiVersion}</span>
        {children}
      </Link>
    </li>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm">
      <p className="text-gray-500">{title}</p>
      <ul className="mt-0.5 space-y-0.5">{children}</ul>
    </div>
  );
}
