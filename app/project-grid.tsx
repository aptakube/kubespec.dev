import Link from "next/link";
import type { ProjectIndex } from "@/lib/types";
import { projectHref } from "@/lib/urls";

// Links to each project's latest version, with its logo
export function ProjectGrid({ projects }: { projects: ProjectIndex[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link href={projectHref(p.slug)} prefetch={false} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 hover:border-gray-300 hover:bg-gray-50">
            <img src={p.logo} alt="" width={20} height={20} className="rounded-sm" />
            <span className="font-medium">{p.name}</span>
            <span className="ml-auto font-mono text-xs text-gray-500">{p.versions[0].version}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
