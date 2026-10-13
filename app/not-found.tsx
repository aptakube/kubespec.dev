import type { Metadata } from "next";
import Link from "next/link";
import { listProjectIndexes } from "@/lib/index";
import { NOT_FOUND_METADATA } from "@/lib/seo";
import { ProjectGrid } from "./project-grid";
import { ThemeToggle } from "./theme-toggle";

export const metadata: Metadata = NOT_FOUND_METADATA;

// Shown for unknown URLs and for notFound() in any page, e.g. a kind that doesn't exist in a version
export default function NotFound() {
  const projects = listProjectIndexes();

  return (
    <>
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-1 text-lg font-bold tracking-tighter">
            <img src="/kubespec.png" alt="Kubespec Logo" width={24} height={24} />
            kubespec.dev
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pt-16 pb-12">
        <p className="font-mono text-sm font-semibold text-blue-600">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 max-w-xl text-gray-600">
          This kind, version or project doesn&apos;t exist. It may have been removed or renamed in a newer version, or the link has a
          typo.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
          Browse Kubernetes
        </Link>

        <h2 className="mt-12 text-sm font-medium text-gray-500">Or pick a project</h2>
        <div className="mt-3">
          <ProjectGrid projects={projects} />
        </div>
      </main>
    </>
  );
}
