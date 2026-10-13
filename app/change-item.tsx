"use client";

import { useState, useTransition } from "react";
import { loadChangeDescription, type ChangeDescription } from "./changelog-actions";

type Props = {
  slug: string;
  apiVersion: string;
  kind: string;
  tag: string;
  // dotted path of the field, "" for the kind itself
  field: string;
  children: React.ReactNode;
};

// A change in the changelog that expands to the field's description, or a word diff when the description changed.
// The description is fetched on the first expand.
export function ChangeItem({ slug, apiVersion, kind, tag, field, children }: Props) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState<ChangeDescription>();
  const [loading, startLoading] = useTransition();

  const toggle = () => {
    setOpen((o) => !o);
    if (!description && !loading) {
      startLoading(async () => {
        const loaded = await loadChangeDescription(slug, apiVersion, kind, tag, field);
        startLoading(() => setDescription(loaded));
      });
    }
  };

  return (
    <li>
      <button type="button" aria-expanded={open} onClick={toggle} className="-mx-1 cursor-pointer rounded px-1 text-left hover:bg-gray-100">
        {children}
      </button>
      {open && (
        <div className="mt-0.5 mb-2 max-w-3xl font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-700">
          {!description ? (
            <span className="text-gray-500">Loading…</span>
          ) : description.diff ? (
            description.diff.map((part, i) =>
              part.change === "removed" ? (
                <del key={i} className="rounded-sm bg-red-50 px-0.5 text-red-700">
                  {part.text}
                </del>
              ) : part.change === "added" ? (
                <ins key={i} className={`rounded-sm bg-green-50 px-0.5 text-green-700 no-underline ${description.diff![i - 1]?.change === "removed" ? "ml-1" : ""}`}>
                  {part.text}
                </ins>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )
          ) : (
            (description.text ?? <span className="text-gray-500">No description.</span>)
          )}
        </div>
      )}
    </li>
  );
}
