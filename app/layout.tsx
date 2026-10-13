import type { Metadata } from "next";
import { SITE_NAME, ogImages } from "@/lib/seo";
import { SITE_URL } from "@/lib/urls";
import { Footer } from "./footer";
import { themeScript } from "./theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: `Kubernetes API reference & CRD spec explorer | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  description:
    "Browse every field of Kubernetes resources and popular CRDs like cert-manager, Istio and Cilium, across versions, with a changelog for each kind.",
  openGraph: { type: "website", siteName: SITE_NAME, url: "/", images: ogImages("/", "kubespec.dev: Kubernetes API reference") },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // the theme script may set data-theme before React hydrates
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {process.env.VERCEL_ENV === "production" && <script async data-domain="kubespec.dev" data-api="/e" src="/p.js" />}
      </head>
      <body className="flex min-h-full flex-col bg-white text-gray-900">
        {children}
        <Footer />
      </body>
    </html>
  );
}
