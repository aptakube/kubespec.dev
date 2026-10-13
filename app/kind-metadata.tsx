import type { ReactNode } from "react";
import type { KindExample, KindLink } from "@/lib/metadata";
import { GITHUB_REPO } from "@/lib/urls";
import { CopyButton } from "./copy-button";

const CONTRIBUTE_URL = `https://github.com/${GITHUB_REPO}/tree/main/index`;

// The examples of a kind, the first one expanded. Uses <details>, so it needs no client JavaScript.
export function KindExamplesSection({ kind, examples }: { kind: string; examples: KindExample[] }) {
  return (
    <section id="examples" className="mt-12 scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight">Examples</h2>
      {examples.length === 0 ? (
        <p className="mt-1 text-sm text-gray-500">
          No examples of {kind} yet.{" "}
          <a href={CONTRIBUTE_URL} className="underline hover:text-gray-900">
            Contribute one on GitHub
          </a>
          .
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-gray-500">
            {examples.length === 1 ? "A ready-to-use manifest" : `${examples.length} ready-to-use manifests`} of {kind} to start from.
          </p>
          <div className="mt-4 space-y-3">
            {examples.map((e, i) => (
              <details key={i} open={i === 0} className="group rounded-lg border border-gray-200">
                <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {i + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-gray-900">{e.title}</span>
                    {e.description && <span className="mt-0.5 block text-sm text-gray-500">{inlineCode(e.description)}</span>}
                  </span>
                  <span className="icon-chevron-down mt-1 size-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="relative border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <div className="absolute top-2 right-2">
                    <CopyButton text={e.yaml} />
                  </div>
                  <pre className="overflow-x-auto px-4 py-3 pr-12 font-mono text-[13px] leading-relaxed">
                    <YamlCode code={e.yaml} />
                  </pre>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// Further reading on a kind. Names like "Kubernetes Official Docs: Deployment" are split into the source and the title.
export function KindLinksSection({ links }: { links: KindLink[] }) {
  if (links.length === 0) return null;
  return (
    <section id="resources" className="mt-12 scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-tight">Learn more</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => {
          const at = link.name.indexOf(": ");
          const source = at > 0 ? link.name.slice(0, at) : new URL(link.href).hostname.replace(/^www\./, "");
          const title = at > 0 ? link.name.slice(at + 2) : link.name;
          return (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener"
                className="group flex h-full items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 hover:bg-gray-50"
              >
                <span className="flex-1">
                  <span className="block text-xs text-gray-500">{source}</span>
                  <span className="mt-0.5 block font-medium text-gray-900 group-hover:underline">{title}</span>
                </span>
                <span aria-hidden className="text-gray-400 group-hover:text-gray-900">
                  ↗
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// `code` spans in example descriptions
function inlineCode(text: string): ReactNode {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i} className="rounded bg-gray-100 px-1 font-mono text-[12px] text-gray-700">{part}</code> : part));
}

// A small YAML highlighter for the examples: keys, scalars, comments and document separators
function YamlCode({ code }: { code: string }) {
  return code.split("\n").map((line, i) => (
    <span key={i} className="block">
      {highlightLine(line)}
      {"\n"}
    </span>
  ));
}

function highlightLine(line: string): ReactNode {
  if (line === "---") return <span className="text-gray-400">---</span>;

  // a comment is a # at the start or after whitespace; examples don't put # inside strings
  const hash = line.search(/(^|\s)#/);
  const comment = hash < 0 ? "" : line.slice(hash);
  const code = hash < 0 ? line : line.slice(0, hash);

  const [, indent, dash = "", key = "", rest] = code.match(/^(\s*)(-\s+)?(?:([\w./-]+:)(?=\s|$))?(.*)$/)!;
  return (
    <>
      {indent}
      {dash && <span className="text-gray-400">{dash}</span>}
      {key && <span className="text-blue-600">{key}</span>}
      <Scalar text={rest} />
      {comment && <span className="text-gray-400 italic">{comment}</span>}
    </>
  );
}

function Scalar({ text }: { text: string }) {
  const value = text.trim();
  if (!value) return text;
  if (/^(-?\d+(\.\d+)?|true|false|null)$/.test(value)) return <span className="text-orange-600">{text}</span>;
  if (/^["'|>]/.test(value)) return <span className="text-green-700">{text}</span>;
  return <span className="text-gray-700">{text}</span>;
}
