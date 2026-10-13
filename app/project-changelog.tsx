import { getProjectChangelog } from "@/lib/index";
import type { ProjectIndex, ProjectVersion } from "@/lib/types";
import { ChangeCountsBadge } from "./change-counts";
import { LocalDate } from "./local-date";
import { VersionEntry } from "./project-changelog-entry";

type Row =
  | { type: "changed"; version: ProjectVersion; changedKinds: number }
  // consecutive versions without changes, newest first
  | { type: "unchanged"; versions: ProjectVersion[] }
  | { type: "oldest"; version: ProjectVersion };

// Every version from the one being viewed down to the oldest, newest first, with the kinds that were added,
// removed, moved to another apiVersion or had their fields changed compared to the version before it.
// Versions with changes start collapsed and load their changes when expanded.
// Runs of versions without changes are collapsed into one line.
export async function ProjectChangelogSection({ project, version }: { project: ProjectIndex; version: ProjectVersion }) {
  const changelog = await getProjectChangelog(project.slug);
  const versions = project.versions;
  const latest = versions[0].version;

  const rows: Row[] = [];
  for (const v of versions.slice(versions.indexOf(version), -1)) {
    const changedKinds = changelog[v.tag]?.length ?? 0;
    const last = rows.at(-1);
    if (v.added || v.removed || v.moved || changedKinds > 0) rows.push({ type: "changed", version: v, changedKinds });
    else if (last?.type === "unchanged") last.versions.push(v);
    else rows.push({ type: "unchanged", versions: [v] });
  }
  rows.push({ type: "oldest", version: versions.at(-1)! });

  return (
    <section id="changelog" className="mt-16 scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight">Changelog</h2>
      <p className="mt-1 text-sm text-gray-500">Kinds added, removed and changed in each {project.name} version, compared to the version before it.</p>

      <ol className="mt-4">
        {rows.map((row) =>
          row.type === "unchanged" ? (
            <li
              key={row.versions[0].tag}
              title={row.versions.map((v) => v.version).reverse().join(", ")}
              className="py-1 pl-5.5 text-sm text-gray-500"
            >
              {row.versions.length} {row.versions.length === 1 ? "version" : "versions"} with no changes
            </li>
          ) : (
            <VersionEntry
              key={row.version.tag}
              slug={project.slug}
              tag={row.version.tag}
              version={row.version.version}
              latestVersion={latest}
              title={
                <>
                  <span className="font-semibold">
                    {project.name} {row.version.version}
                  </span>
                  {row.type === "changed" && (
                    <ChangeCountsBadge
                      added={row.version.added?.length ?? 0}
                      removed={row.version.removed?.length ?? 0}
                      changed={(row.version.moved?.length ?? 0) + row.changedKinds}
                    />
                  )}
                </>
              }
              footer={
                <>
                  {row.type === "oldest" && <p className="text-sm text-gray-500">The oldest version of {project.name} on kubespec.dev</p>}
                  <p className="text-xs text-gray-500">
                    Released <LocalDate date={row.version.date} /> ·{" "}
                    <a href={`https://github.com/${project.repo}/releases/tag/${row.version.tag}`} className="underline hover:text-gray-900">
                      {project.repo}@{row.version.tag}
                    </a>
                  </p>
                </>
              }
            />
          ),
        )}
      </ol>
    </section>
  );
}
