"use client";

import { useEffect, useState } from "react";

// Copies the given text, for the snippets on the docs pages and the examples of a kind
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      title={copied ? "Copied" : "Copy"}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900"
    >
      <span className={`size-3.5 ${copied ? "icon-check text-green-700" : "icon-copy"}`} />
    </button>
  );
}
