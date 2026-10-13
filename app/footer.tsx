import { GITHUB_REPO } from "@/lib/urls";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between px-4 py-6 text-sm text-gray-500">
        <p>
          kubespec.dev is open source on{" "}
          <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-700 underline-offset-4 hover:underline">
            GitHub
          </a>
          .
        </p>
        <a href="https://aptakube.com" className="flex items-center gap-2 hover:text-gray-900">
          Sponsored by
          {/* the wordmark is dark, so it's turned white in dark mode */}
          <img src="https://aptakube.com/aptakube.svg" alt="Aptakube" width={92} height={20} className="h-5 w-auto dark:brightness-0 dark:invert" />
        </a>
      </div>
    </footer>
  );
}
