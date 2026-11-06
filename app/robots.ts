import type { MetadataRoute } from "next";
import { SITE_URL } from "@/common/constants/metadata";
export default function robots(): MetadataRoute.Robots {
 // Leave private routes crawlable so their noindex directives can be read.
 return { rules: { userAgent: "*", allow: "/" }, sitemap: SITE_URL + "/sitemap.xml", host: SITE_URL };
}
