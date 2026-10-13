import Link from "next/link";
import { countChanges } from "@/lib/changelog";
import type { KindChanges, KindChangelog, ProjectIndex, ProjectVersion } from "@/lib/types";
import { kindHref } from "@/lib/urls";
import { ChangeCountsBadge } from "./change-counts";
import { ChangeItem } from "./change-item";
import { LocalDate } from "./local-date";

type Props = {
  project: ProjectIndex;
  // the version being viewed: only it and older versions are listed
  version: ProjectVersion;
  apiVersion: string;
  kind: string;
  changelog: KindChangelog;
  // the oldest version that has this kind at this apiVersion
  introducedIn: ProjectVersion;
};

type Row =
  | { type: "changed"; version: ProjectVersion }
  // consecutive versions without changes, newest first
  | { type: "unchanged"; versions: ProjectVersion[] }
  | { type: "introduced"; version: ProjectVersion };

// Every version from the one being viewed down to the one that introduced the kind, newest first.
// Versions with changes start collapsed and expand to them; runs of versions without changes are collapsed into one line.
export function KindChangelogSection({ project, version, apiVersion, kind, changelog, introducedIn }: Props) {
  const latest = project.versions[0].version;
  const href = (v: ProjectVersion) => kindHref(project.slug, v.version, apiVersion, kind, latest);
  const isOldest = introducedIn === project.versions.at(-1);

  const rows: Row[] = [];
  for (const v of project.versions.slice(project.versions.indexOf(version), project.versions.indexOf(introducedIn))) {
    const last = rows.at(-1);
    if (changelog[v.tag]) rows.push({ type: "changed", version: v });
    else if (last?.type === "unchanged") last.versions.push(v);
    else rows.push({ type: "unchanged", versions: [v] });
  }
  rows.push({ type: "introduced", version: introducedIn });

  return (
    <section id="changelog" className="mt-12 scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight">Changelog</h2>
      <p className="mt-1 text-sm text-gray-500">
        Changes to {kind} ({apiVersion}) in each {project.name} version, compared to the version before it.
      </p>

      <ol className="mt-4">
        {rows.map((row) =>
          row.type === "unchanged" ? (
            <li
              key={row.versions[0].tag}
              title={row.versions.map((v) => v.version).reverse().join(", ")}
              className="py-1 pl-5.5 text-sm text-gray-500"
            >
              {plural(row.versions.length, "version", "versions")} with no changes
            </li>
          ) : (
            <li key={row.version.tag}>
              <details className="group">
                <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded py-1 pr-2 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4 shrink-0 text-gray-500 transition-transform group-open:rotate-90">
                    <path
                      fillRule="evenodd"
                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">
                    {project.name} {row.version.version}
                  </span>
                  {row.type === "changed" && <Counts changes={changelog[row.version.tag]} />}
                </summary>
                <div className="mb-3 ml-[5.5px] space-y-3 border-l border-gray-200 pt-1 pl-4">
                  {row.type === "changed" ? (
                    <Changes changes={changelog[row.version.tag]} slug={project.slug} apiVersion={apiVersion} kind={kind} tag={row.version.tag} />
                  ) : isOldest ? (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-green-700">{kind}</span> was already present in this version of {project.name}, the
                      oldest one on kubespec.dev
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-green-700">{kind}</span> was first seen on this version of {project.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Released <LocalDate date={row.version.date} /> ·{" "}
                    <Link href={href(row.version)} className="underline hover:text-gray-900">
                      View {kind} in {row.version.version}
                    </Link>
                  </p>
                </div>
              </details>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Counts({ changes }: { changes: KindChanges }) {
  return <ChangeCountsBadge {...countChanges(changes)} />;
}

function Changes({ changes, ...ids }: { changes: KindChanges; slug: string; apiVersion: string; kind: string; tag: string }) {
  const added = Object.keys(changes.added ?? {});
  const removed = Object.keys(changes.removed ?? {});
  const typeChanged = Object.entries(changes.typeChanged ?? {});
  const required = changes.required ?? [];
  const optional = changes.optional ?? [];
  const descriptions = changes.descriptionChanged ?? [];

  return (
    <>
      {added.length > 0 && (
        <Group title={`${plural(added.length, "property has", "properties have")} been added`}>
          {added.map((path) => (
            <ChangeItem key={path} {...ids} field={path}>
              <Path path={path} color="text-green-700" />
            </ChangeItem>
          ))}
        </Group>
      )}
      {removed.length > 0 && (
        <Group title={`${plural(removed.length, "property has", "properties have")} been removed`}>
          {removed.map((path) => (
            <ChangeItem key={path} {...ids} field={path}>
              <Path path={path} color="text-red-700" />
            </ChangeItem>
          ))}
        </Group>
      )}
      {typeChanged.length > 0 && (
        <Group title={`${plural(typeChanged.length, "property has", "properties have")} changed type`}>
          {typeChanged.map(([path, [from, to]]) => (
            <ChangeItem key={path} {...ids} field={path}>
              <Path path={path} color="text-yellow-600" />{" "}
              <span className="font-mono text-xs text-gray-500">
                {from} → {to}
              </span>
            </ChangeItem>
          ))}
        </Group>
      )}
      {required.length > 0 && (
        <Group title={`${plural(required.length, "property is", "properties are")} now required`}>
          {required.map((path) => (
            <ChangeItem key={path} {...ids} field={path}>
              <Path path={path} color="text-yellow-600" />
            </ChangeItem>
          ))}
        </Group>
      )}
      {optional.length > 0 && (
        <Group title={`${plural(optional.length, "property is", "properties are")} no longer required`}>
          {optional.map((path) => (
            <ChangeItem key={path} {...ids} field={path}>
              <Path path={path} color="text-yellow-600" />
            </ChangeItem>
          ))}
        </Group>
      )}
      {changes.description && (
        <Group title={`The description of ${ids.kind} has changed`}>
          <ChangeItem {...ids} field="">
            <span className="font-medium text-yellow-600">{ids.kind}</span>
          </ChangeItem>
        </Group>
      )}
      {descriptions.length > 0 && (
        <Group title={`${plural(descriptions.length, "property has", "properties have")} changed the description`}>
          {descriptions.map((path) => (
            <ChangeItem key={path} {...ids} field={path}>
              <Path path={path} color="text-yellow-600" />
            </ChangeItem>
          ))}
        </Group>
      )}
    </>
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

// a dotted path with a leading dot, e.g. ".spec.replicas"; long paths wrap after a dot
function Path({ path, color }: { path: string; color: string }) {
  return (
    <code className={`font-mono font-medium wrap-anywhere ${color}`}>
      {path.split(".").map((p, i) => (
        <span key={i}>
          .{p}
          <wbr />
        </span>
      ))}
    </code>
  );
}
