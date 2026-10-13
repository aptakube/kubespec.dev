"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { Field, SchemaTypes } from "@/lib/kind-schema";

// The fields of a kind as a compact tree. Expanding a field shows its description and children.
// Collapsed fields are still in the HTML (hidden="until-found"), so search engines and find-in-page see
// every description; a type nested inside itself is the exception and only renders once expanded.
export function FieldTree({ root, types }: { root: string; types: SchemaTypes }) {
  const ancestors = new Set([root]);
  const [query, setQuery] = useState("");
  const [shortcut, setShortcut] = useState("⌘F");
  const input = useRef<HTMLInputElement>(null);
  // big kinds have thousands of fields, so typing stays responsive while the tree catches up
  const q = useDeferredValue(query.trim().toLowerCase());
  const filter = useMemo(() => (q ? findMatches(root, types, q) : undefined), [root, types, q]);

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) setShortcut("Ctrl F");

    // takes over the browser's find, but a second press while the filter has focus still opens it,
    // which searches the descriptions too
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f" && document.activeElement !== input.current) {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <input
            ref={input}
            type="text"
            aria-label="Filter fields"
            placeholder="Filter fields, e.g. replicas or spec.template…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                e.currentTarget.blur();
              }
            }}
            className="w-full rounded-md border border-gray-300 py-1 pr-16 pl-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 rounded border border-gray-200 px-1.5 py-0.5 font-sans text-[11px] text-gray-400">
            {shortcut}
          </kbd>
        </div>
        {filter && (
          <span className="shrink-0 text-sm text-gray-500">
            {filter.matches.size === 0 ? "No matching fields" : `${filter.matches.size} ${filter.matches.size === 1 ? "match" : "matches"}`}
          </span>
        )}
      </div>
      <ul className="font-mono text-sm leading-5.5">
        {types[root].map((field) => (
          // spec is what readers usually come for, so it starts open
          <FieldNode
            key={field.name}
            field={field}
            path={`.${field.name}`}
            types={types}
            ancestors={ancestors}
            filter={filter}
            defaultOpen={field.name === "spec"}
          />
        ))}
      </ul>
    </>
  );
}

type Filter = {
  // paths of the fields that match
  matches: Set<string>;
  // paths of the fields with a match somewhere below them, which open to reveal it
  parents: Set<string>;
};

// A query with a dot matches anywhere in the path (".spec.template.spec"), anything else just the field name.
// Recursive types aren't searched below their first level, as they only render one level at a time.
function findMatches(root: string, types: SchemaTypes, q: string): Filter {
  const filter: Filter = { matches: new Set(), parents: new Set() };
  const byPath = q.includes(".");

  const walk = (type: string, path: string, ancestors: Set<string>): boolean => {
    let found = false;
    for (const field of types[type] ?? []) {
      const p = `${path}.${field.name}`;
      if ((byPath ? p : field.name).toLowerCase().includes(q)) {
        filter.matches.add(p);
        found = true;
      }
      if (field.ref && !ancestors.has(field.ref) && walk(field.ref, p, new Set(ancestors).add(field.ref))) {
        filter.parents.add(p);
        found = true;
      }
    }
    return found;
  };

  walk(root, "", new Set([root]));
  return filter;
}

// primitives by their base type (ignoring [] and map[...]), everything else is an object type
function typeColor(type: string): string {
  const base = type.replace(/\[\]$/, "").replace(/^map\[string\]/, "");
  if (base === "string") return "text-orange-600";
  if (base === "integer" || base === "number" || base === "boolean" || base === "int | string") return "text-sky-600";
  return "text-pink-600";
}

type NodeProps = {
  field: Field;
  // e.g. ".spec.template.spec.containers.image"
  path: string;
  types: SchemaTypes;
  // the types this field is nested in, to stop a recursive type from rendering forever
  ancestors: Set<string>;
  // the active filter, if any
  filter?: Filter;
  // whether a field above this one matches the filter, so this one isn't faded
  inMatch?: boolean;
  defaultOpen?: boolean;
};

function FieldNode({ field, path, types, ancestors, filter, inMatch = false, defaultOpen = false }: NodeProps) {
  const [open, setOpen] = useState(defaultOpen);

  // a new filter opens the fields leading to a match and closes the rest; clearing it leaves them as they are
  const [prevFilter, setPrevFilter] = useState(filter);
  if (filter !== prevFilter) {
    setPrevFilter(filter);
    if (filter) setOpen(filter.parents.has(path));
  }
  const match = !!filter?.matches.has(path);
  const parent = !!filter?.parents.has(path);
  const filterState = !filter || inMatch ? undefined : match ? "match" : parent ? "parent" : "dim";
  const body = useRef<HTMLDivElement>(null);
  const children = field.ref ? types[field.ref] : undefined;
  const expandable = !!children || !!field.description;
  const recursive = !!field.ref && ancestors.has(field.ref);
  const childAncestors = field.ref ? new Set(ancestors).add(field.ref) : ancestors;

  // Collapsed bodies are rendered with hidden, which React can't set to "until-found". Upgrading it after
  // hydration lets find-in-page reveal them: the browser fires beforematch and removes the attribute itself.
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    if (!open) el.setAttribute("hidden", "until-found");
    const reveal = () => setOpen(true);
    el.addEventListener("beforematch", reveal);
    return () => el.removeEventListener("beforematch", reveal);
  }, [open]);

  return (
    <li data-filter={filterState}>
      <div className="ft-line">
        <button type="button" aria-expanded={expandable ? open : undefined} onClick={() => expandable && setOpen((o) => !o)} className="ft-row">
          <span className="ft-chevron" data-children={children ? "" : undefined} />
          <span className="ft-required" aria-label={field.required ? "required" : undefined}>
            {field.required ? "*" : ""}
          </span>
          <span className="ft-name">{field.name}</span>
          <span className={`ft-type ${typeColor(field.type)}`}>{field.type}</span>
        </button>
        <CopyPath path={path} />
      </div>
      {expandable && (open || !recursive) && (
        <div ref={body} hidden={!open} className="ft-body">
          {field.description && <p className="ft-description">{field.description}</p>}
          {children && (
            <ul>
              {children.map((child) => (
                <FieldNode
                  key={child.name}
                  field={child}
                  path={`${path}.${child.name}`}
                  types={types}
                  ancestors={childAncestors}
                  filter={filter}
                  inMatch={inMatch || match}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

// Copies the field's path, shown when hovering its row
function CopyPath({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      title={copied ? "Copied" : `Copy ${path}`}
      aria-label={copied ? "Copied" : `Copy path ${path}`}
      data-copied={copied ? "" : undefined}
      onClick={() => navigator.clipboard.writeText(path).then(() => setCopied(true))}
      className="ft-copy"
    />
  );
}
