"use server";

import { getChangeDescription, getVersionChanges } from "@/lib/index";
import type { VersionChanges } from "@/lib/types";
import { diffWords, type DiffPart } from "@/lib/word-diff";

export type ChangeDescription = { text?: string; diff?: DiffPart[] };

// Loaded when a change is expanded, since sending every description with the page would make it several MB
export async function loadChangeDescription(slug: string, apiVersion: string, kind: string, tag: string, field: string): Promise<ChangeDescription> {
  const { before, after } = await getChangeDescription(slug, apiVersion, kind, tag, field);
  if (before !== undefined && after !== undefined) return { diff: diffWords(before, after) };
  return { text: after ?? before };
}

// Loaded when a version of the project changelog is expanded, since Kubernetes alone has over a thousand changed kinds
export async function loadVersionChanges(slug: string, tag: string): Promise<VersionChanges | undefined> {
  return getVersionChanges(slug, tag);
}
