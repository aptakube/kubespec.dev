import type { Metadata } from "next";
import Link from "next/link";
import { listProjectIndexes } from "@/lib/index";
import { tools } from "@/lib/mcp";
import { SITE_NAME, ogImages } from "@/lib/seo";
import { DOCS_PAGES } from "@/lib/sitemap";
import { SITE_URL, projectHref } from "@/lib/urls";
import { JsonLd } from "../../json-ld";
import { ThemeToggle } from "../../theme-toggle";
import { CopyButton } from "../../copy-button";

const MCP_URL = `${SITE_URL}/mcp`;

const PATH = "/docs/mcp";
const updated = DOCS_PAGES.find((p) => p.path === PATH)!.date;

const title = "Kubernetes MCP server for API and CRD specs";
const description =
  "A free, remote MCP server that gives AI assistants the exact schema of every Kubernetes kind and popular CRD, across versions. No sign-in needed.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    title,
    description,
    url: PATH,
    modifiedTime: updated,
    images: ogImages(PATH, title),
  },
  twitter: { card: "summary_large_image", title, description },
};

const clients: { name: string; steps: React.ReactNode; file?: string; snippet: string }[] = [
  {
    name: "Claude Code",
    steps: "Run this in your terminal:",
    snippet: `claude mcp add --transport http kubespec ${MCP_URL}`,
  },
  {
    name: "Claude (claude.ai and Claude Desktop)",
    steps: (
      <>
        Open <strong>Settings → Connectors</strong>, click <strong>Add custom connector</strong>, name it <em>kubespec</em> and paste the URL:
      </>
    ),
    snippet: MCP_URL,
  },
  {
    name: "Cursor",
    steps: "Add it to your MCP settings:",
    file: ".cursor/mcp.json",
    snippet: JSON.stringify({ mcpServers: { kubespec: { url: MCP_URL } } }, null, 2),
  },
  {
    name: "VS Code",
    steps: "Add it to your workspace's MCP settings:",
    file: ".vscode/mcp.json",
    snippet: JSON.stringify({ servers: { kubespec: { type: "http", url: MCP_URL } } }, null, 2),
  },
  {
    name: "Windsurf",
    steps: "Add it to your MCP settings:",
    file: "~/.codeium/windsurf/mcp_config.json",
    snippet: JSON.stringify({ mcpServers: { kubespec: { serverUrl: MCP_URL } } }, null, 2),
  },
];

const examples = [
  "Which fields were added to Deployment between Kubernetes v1.30 and v1.36?",
  "I'm upgrading cert-manager from v1.15 to v1.21. Did anything change in Certificate or ClusterIssuer that affects my manifests?",
  "Which project defines the HTTPRoute kind, and what does spec.rules.backendRefs look like?",
  "Write a KEDA ScaledObject that scales on a Kafka topic, and check every field against the schema.",
  "What changed in the latest Cilium release?",
  "Is spec.template.spec.hostUsers available in Kubernetes v1.28? Is it required?",
];

type Param = { type: string; description?: string };

export default function McpDocsPage() {
  const projects = listProjectIndexes();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TechArticle",
              headline: title,
              description,
              url: `${SITE_URL}${PATH}`,
              inLanguage: "en",
              dateModified: updated,
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
              about: { "@id": MCP_URL },
            },
            {
              "@type": "SoftwareApplication",
              "@id": MCP_URL,
              name: "kubespec.dev MCP server",
              description,
              url: `${SITE_URL}${PATH}`,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              featureList: tools.map((t) => t.name),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "MCP server", item: `${SITE_URL}${PATH}` },
              ],
            },
          ],
        }}
      />
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-1 text-lg font-bold tracking-tighter">
            <img src="/kubespec.png" alt="Kubespec Logo" width={24} height={24} />
            kubespec.dev
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pt-10 pb-16">
        <div className="max-w-3xl">
          <p className="font-mono text-sm font-semibold text-blue-600">Kubernetes specs for your AI assistant</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Kubernetes MCP server</h1>
          <p className="mt-4 text-gray-600">
            Models often guess at Kubernetes fields, or remember them from an older version. The kubespec.dev MCP server lets your assistant
            look up the exact schema of every kind in Kubernetes and {projects.length - 1} CRD projects, at the version you run, and see what
            changed between versions. It&apos;s free, read-only, and needs no API key or sign-in.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-1.5 pl-3">
            <code className="flex-1 truncate font-mono text-sm">{MCP_URL}</code>
            <CopyButton text={MCP_URL} />
          </div>
          <p className="mt-2 text-sm text-gray-500">A remote server using MCP's Streamable HTTP transport, supported by Claude, Cursor, VS Code, Windsurf and most current clients.</p>

          <h2 id="install" className="mt-14 scroll-mt-6 text-2xl font-semibold tracking-tight">
            Install
          </h2>
          <div className="mt-4 space-y-8">
            {clients.map((c) => (
              <section key={c.name}>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {c.steps}
                  {c.file && (
                    <>
                      {" "}
                      <code className="font-mono text-[13px]">{c.file}</code>
                    </>
                  )}
                </p>
                <Snippet text={c.snippet} />
              </section>
            ))}
          </div>

          <h2 id="examples" className="mt-14 scroll-mt-6 text-2xl font-semibold tracking-tight">
            Things to ask
          </h2>
          <p className="mt-2 text-sm text-gray-600">Once it&apos;s installed, ask your assistant things like:</p>
          <ul className="mt-4 space-y-2">
            {examples.map((e) => (
              <li key={e} className="rounded-lg border border-gray-200 px-4 py-2.5 text-[15px]">
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            It covers{" "}
            {projects.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && (i === projects.length - 1 ? " and " : ", ")}
                <Link href={projectHref(p.slug)} className="underline hover:text-gray-900">
                  {p.name}
                </Link>
              </span>
            ))}
            .
          </p>

          <h2 id="tools" className="mt-14 scroll-mt-6 text-2xl font-semibold tracking-tight">
            Tools
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your assistant picks the tools on its own. Versions are accepted with or without the leading <code className="font-mono">v</code>,
            kind names are case-insensitive, and every answer links back to the page on kubespec.dev.
          </p>
          <div className="mt-6 space-y-10">
            {tools.map((tool) => {
              const params = Object.entries(tool.inputSchema.properties) as [string, Param][];
              const required = new Set(tool.inputSchema.required ?? []);
              return (
                <section key={tool.name} id={tool.name} className="scroll-mt-6">
                  <h3 className="font-mono text-lg font-semibold">
                    <a href={`#${tool.name}`} className="hover:underline">
                      {tool.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-[15px] text-gray-600">{tool.description}</p>
                  {params.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-500">No parameters.</p>
                  ) : (
                    <dl className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 text-sm">
                      {params.map(([name, p]) => (
                        <div key={name} className="px-4 py-2.5 sm:flex sm:gap-4">
                          <dt className="shrink-0 sm:w-44">
                            <code className="font-mono font-semibold">{name}</code>
                            <span className="ml-1.5 font-mono text-xs text-gray-500">{p.type}</span>
                            {required.has(name) && <span className="ml-1.5 text-xs font-medium text-red-600">required</span>}
                          </dt>
                          <dd className="mt-0.5 text-gray-600 sm:mt-0">{p.description}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

function Snippet({ text }: { text: string }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-1.5 pl-3">
      <pre className="flex-1 overflow-x-auto py-1 font-mono text-[13px] leading-relaxed">{text}</pre>
      <CopyButton text={text} />
    </div>
  );
}
