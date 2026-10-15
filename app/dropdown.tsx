"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type DropdownItem = {
  key: string;
  href: string;
  content: ReactNode;
  selected?: boolean;
  rel?: string;
  // matched against the search query, when the dropdown is searchable
  searchText?: string;
};

type Props = {
  label: string;
  value: ReactNode;
  items: DropdownItem[];
  // shows a search box that filters items by searchText
  searchable?: boolean;
};

// A button that opens a list of links; closes on selection, Escape or a click outside
export function Dropdown({ label, value, items, searchable }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((item) => item.searchText?.toLowerCase().includes(q)) : items;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;

    list.current?.querySelector("[aria-current]")?.scrollIntoView({ block: "nearest" });

    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-sm hover:bg-gray-50"
      >
        {value}
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4 text-gray-400">
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-1 min-w-full rounded-md border border-gray-200 bg-white text-sm shadow-lg">
          {searchable && (
            <div className="relative border-b border-gray-200 p-1">
              <input
                ref={search}
                type="search"
                autoFocus
                aria-label={`Search ${label.toLowerCase()}`}
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Enter goes to the first match
                  if (e.key === "Enter" && visible[0]) {
                    router.push(visible[0].href);
                    close();
                  }
                }}
                className="w-full min-w-48 rounded py-1 pr-7 pl-2 outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              {/* replaces the native clear button, which can't be styled */}
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    search.current?.focus();
                  }}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-900"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="size-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <ul ref={list} className="max-h-80 space-y-0.5 overflow-auto p-0.5">
            {visible.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  rel={item.rel}
                  prefetch={false}
                  aria-current={item.selected ? "page" : undefined}
                  onClick={close}
                  className="flex items-center gap-2 whitespace-nowrap rounded px-2.5 py-1.5 outline-none hover:bg-gray-100 focus-visible:bg-gray-100 aria-[current=page]:bg-gray-100 aria-[current=page]:font-medium"
                >
                  {item.content}
                </Link>
              </li>
            ))}
            {visible.length === 0 && <li className="px-2.5 py-1.5 text-gray-500">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
