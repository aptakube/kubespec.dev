"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { KindRef } from "@/lib/types";
import { kindHref } from "@/lib/urls";
import { KubernetesIcon } from "./icons";

export type KindGroup = {
  // "" for the core group
  group: string;
  // each kind with every apiVersion it's served at, most stable first
  kinds: { kind: string; scope: KindRef["scope"]; apiVersions: string[] }[];
};

type Props = { groups: KindGroup[]; project: string; version: string; latestVersion: string };

// Kinds grouped by API group, with a search box (Cmd/Ctrl+F) that filters by kind, group or apiVersion
export function KindList({ groups, project, version, latestVersion }: Props) {
  const [query, setQuery] = useState("");
  const [shortcut, setShortcut] = useState("⌘F");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) setShortcut("Ctrl F");

    // takes over the browser's find, since the search covers what people look for here
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const q = query.trim().toLowerCase();
  const visible = q
    ? groups
        .map(({ group, kinds }) => ({
          group,
          kinds: (group || "core").includes(q)
            ? kinds
            : kinds.filter((k) => k.kind.toLowerCase().includes(q) || k.apiVersions.some((v) => v.toLowerCase().includes(q))),
        }))
        .filter((g) => g.kinds.length > 0)
    : groups;

  const clear = () => {
    setQuery("");
    input.current?.focus();
  };

  return (
    <>
      <div className="relative mt-6">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400">
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l2.83 2.83a.75.75 0 1 1-1.06 1.06l-2.83-2.83A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={input}
          type="text"
          aria-label="Search kinds"
          placeholder="Search kinds…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("");
              e.currentTarget.blur();
            }
          }}
          className="w-full rounded-lg border border-gray-300 py-2 pr-16 pl-9 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-gray-200 px-1.5 py-0.5 font-sans text-[11px] text-gray-400">
          {shortcut}
        </kbd>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
          <p className="font-medium text-gray-900">No kinds match “{query.trim()}”</p>
          <p className="mt-1 text-sm text-gray-500">Try a kind name like Deployment, or an API version like apps/v1.</p>
          <button
            type="button"
            onClick={clear}
            className="mt-4 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {visible.map(({ group, kinds }) => (
            // remounted when a search starts or ends, so every matching group is open
            <details key={`${group}:${q ? "search" : "all"}`} open className="group">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm select-none [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4 -rotate-90 text-gray-400 transition group-open:rotate-0">
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
                <h2 className="font-semibold text-gray-900">{group || "core"}</h2>
                <span className="text-gray-400">{kinds.length}</span>
              </summary>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {kinds.map((k) => (
                  <li
                    key={k.kind}
                    className="relative rounded-lg border border-gray-200 px-3 py-2.5 transition hover:border-gray-400 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* the link covers the whole card; version chips sit above it */}
                      <Link
                        prefetch={false}
                        href={kindHref(project, version, k.apiVersions[0], k.kind, latestVersion)}
                        className="truncate font-medium after:absolute after:inset-0"
                      >
                        {k.kind}
                      </Link>
                      {k.scope === "Cluster" && <ClusterScopeBadge />}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {k.apiVersions.map((apiVersion, i) => (
                        <Link
                          key={apiVersion}
                          prefetch={false}
                          href={kindHref(project, version, apiVersion, k.kind, latestVersion)}
                          className={`relative rounded px-1.5 py-0.5 font-mono text-[11px] hover:bg-gray-200 ${i === 0 ? "bg-gray-100 text-gray-700" : "text-gray-400"}`}
                        >
                          {apiVersion.split("/").at(-1)}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </>
  );
}

// Kubernetes-style wheel marking cluster-scoped kinds, with a tooltip on hover and keyboard focus.
// Sits above the card's link overlay so it can be hovered.
function ClusterScopeBadge() {
  return (
    <span tabIndex={0} className="group/tip relative z-10 shrink-0 rounded outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <KubernetesIcon className="size-4" />
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-full mb-2 w-56 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100"
      >
        <strong className="font-semibold">Cluster-scoped</strong>: exists once for the whole cluster, not inside a namespace.
      </span>
    </span>
  );
}
