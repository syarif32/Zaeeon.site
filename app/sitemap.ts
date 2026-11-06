import type { MetadataRoute } from "next";
import { pageUrl, publicPaths } from "@/common/constants/metadata";
import { routing } from "@/i18n/routing";
import { getPublicProjectsForSitemap } from "@/services/projects";

export const revalidate = 3600;

function validDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublicProjectsForSitemap();
  const entries: MetadataRoute.Sitemap = routing.locales.flatMap(locale =>
    publicPaths.map(path => ({ url: pageUrl(locale, path) }))
  );
  const seen = new Set<string>();
  for (const project of projects) {
    const slug = project.slug;
    if (typeof slug !== "string" || !slug.trim() || slug !== slug.trim() || /[/?#\\\\]/.test(slug) || slug === "." || slug === ".." || seen.has(slug)) continue;
    seen.add(slug);
    const lastModified = validDate(project.updated_at) || validDate(project.created_at);
    for (const locale of routing.locales) {
      entries.push({ url: pageUrl(locale, "projects/" + encodeURIComponent(slug)), ...(lastModified ? { lastModified } : {}) });
    }
  }
  return entries;
}
