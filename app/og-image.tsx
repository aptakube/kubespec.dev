import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

type Props = {
  // small line above the title, e.g. "Kubernetes v1.37"
  eyebrow: string;
  title: string;
  subtitle?: string;
  // project logo URL
  logo?: string;
};

// The social preview shared by every route: the site's logo, a project logo and a big title
export async function ogImage({ eyebrow, title, subtitle, logo }: Props) {
  const site = `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", "kubespec.png"))).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 72, background: "white", color: "#111827" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34, fontWeight: 700 }}>
          <img src={site} width={48} height={48} alt="" />
          kubespec.dev
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, color: "#6b7280" }}>
            {logo && <img src={logo} width={44} height={44} style={{ borderRadius: 8 }} alt="" />}
            {eyebrow}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: title.length > 24 ? 76 : 104, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
          {subtitle && <div style={{ display: "flex", marginTop: 16, fontSize: 40, color: "#2563eb" }}>{subtitle}</div>}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
