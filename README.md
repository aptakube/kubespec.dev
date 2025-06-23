# Kubernetes Spec Explorer

👉 Live at https://kubespec.dev

- Tree view of all Kubernetes resources
- History changes since Kubernetes v1.12
- Examples that you can use copy and modify
- Links to official Kubernetes documentation and useful resources
- Support for popular CRDs

![](./screenshot.png)

## Contributing

Contributions are welcome!

- clone the repo
- run `npm install`
- run `npm run dev`

### Adding/Updating projects

- add the project to the [`src/lib/kube/projects.ts`](src/lib/kube/projects.ts) file(skip for just updating)

```ts
{
  name: "New Project",
  slug: "new-project",
  logo: "https://example.com/logo.png",
  repo: "new-org/new-project",
  pathToManifests: ["path/to/manifests"],
}
```

- run `GH_TOKEN=... npm run download` to download the manifests
- run `npm run dev` to check

## 📃 License

MIT

## ❤️ Sponsored by

<a href="https://aptakube.com">
    <img src="https://aptakube.com/og.png" alt="Aptakube">
</a>
