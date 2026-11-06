import { METADATA, SITE_URL, pageUrl } from "@/common/constants/metadata";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function ProfileJsonLd({ locale, path = "" }: { locale: string; path?: string }) {
  const personId = SITE_URL + "/#person";
  const websiteId = SITE_URL + "/#website";
  return <JsonLd data={{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person", "@id": personId, name: "Najwa Syarif",
        alternateName: "Muhammad Najwa Syarif",
        url: pageUrl(locale, "about"), image: SITE_URL + METADATA.profile,
        jobTitle: "Full Stack Developer",
        sameAs: [
          "https://github.com/syarif32",
          "https://www.linkedin.com/in/muhammad-najwa-syarif/",
          "https://www.instagram.com/najwa_sarep/",
        ],
      },
      {
        "@type": "WebSite", "@id": websiteId, name: "Zaeeon",
        alternateName: "Zaeeon by Najwa Syarif", url: SITE_URL,
        image: SITE_URL + METADATA.logo,
        inLanguage: ["id", "en"], author: { "@id": personId },
      },
      {
        "@type": "ProfilePage", "@id": pageUrl(locale, path) + "#profile",
        url: pageUrl(locale, path), name: "Zaeeon by Najwa Syarif",
        inLanguage: locale, mainEntity: { "@id": personId },
        isPartOf: { "@id": websiteId },
      },
    ],
  }} />;
}
