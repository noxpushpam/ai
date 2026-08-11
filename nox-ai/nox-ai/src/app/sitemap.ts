import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://nox-ai.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/chat`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/study`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/files`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/settings`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
