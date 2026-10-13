# Kubernetes Spec Explorer

👉 Live at https://kubespec.dev

- Tree view of every field of all Kubernetes resources, with search
- Changelog of each kind and each project version, since Kubernetes v1.10
- Examples that you can copy and modify, and links to official docs and useful resources
- Support for popular CRDs (Argo CD, cert-manager, Cilium, Flux, Istio, Karpenter, KEDA, and many more)
- MCP server at https://kubespec.dev/mcp, so AI agents can look up specs (see https://kubespec.dev/docs/mcp)

## Contributing

Contributions are welcome!

- clone the repo
- run `pnpm install`
- run `pnpm dev`

### Adding examples and links

Examples and links live next to the generated index of each project, with the same `<apiVersion>/<Kind>` paths as its changelog:

- `index/<project>/links/<apiVersion>/<Kind>.json`, e.g. `index/kubernetes/links/apps/v1/Deployment.json`: `[{ "name": "Kubernetes Official Docs: Deployment", "href": "https://..." }]`
- `index/<project>/examples/<apiVersion>/<Kind>/<n>-<name>.md`, one file per example, ordered by file name, with a `title` and `description` in the frontmatter and the manifest in a ` ```yaml ` block

### Adding a new project (source of CRD specs)

- add a new entry at the end of the list of projects in `lib/projects.ts`
- run `GH_TOKEN=$(gh auth token) pnpm build-index <slug>` to build the index for that project
- create a pull request

### Updating the index

- run either of the following
  - `GH_TOKEN=$(gh auth token) pnpm build-index` to update all projects
  - `GH_TOKEN=$(gh auth token) pnpm build-index <slug>` to update a specific project
  - add `--full` to re-resolve versions that are already in the index
- create a pull request

Downloaded spec files are cached in `.cache/specs/`; delete it to force a re-download.

## 📃 License

MIT

## ❤️ Sponsored by

<a href="https://aptakube.com">
    <img src="https://aptakube.com/og.png" alt="Aptakube">
</a>
