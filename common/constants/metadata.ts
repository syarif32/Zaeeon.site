import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
export const SITE_URL = "https://www.najwasyarif.my.id";
export const METADATA = {
  creator: "Najwa Syarif",
  description: "Zaeeon by Najwa Syarif — Web & Mobile Developer Portfolio",
  keyword: "Najwa Syarif, Zaeeon, Full Stack Developer",
  authors: { name: "Najwa Syarif", url: SITE_URL },
  openGraph: { url: SITE_URL, siteName: "Zaeeon by Najwa Syarif", locale: "en_US" },
  exTitle: "| Najwa Syarif — Zaeeon",
  profile: "/images/najwa.png",
};
// [Indonesian, English], each containing [title, description].
export const PAGE_SEO: Record<string, [[string, string], [string, string]]> = {
  "": [
    [
      "Najwa Syarif | Full Stack Developer — Zaeeon",
      "Portofolio Najwa Syarif, Full Stack Developer di Semarang. Jelajahi proyek web dan mobile serta keahlian Laravel, React, Next.js, dan Flutter."
    ],
    [
      "Najwa Syarif | Full Stack Developer Portfolio — Zaeeon",
      "Explore the web and mobile portfolio of Najwa Syarif, a Full Stack Developer in Semarang working with Laravel, React, Next.js, and Flutter."
    ]
  ],
  "about": [
    [
      "Tentang Najwa Syarif",
      "Kenali Najwa Syarif, developer di balik Zaeeon: profil, pengalaman web dan mobile, pendidikan, dan keahlian teknis."
    ],
    [
      "About Najwa Syarif",
      "Meet Najwa Syarif, the developer behind Zaeeon. Explore his background, web and mobile experience, education, and technical skills."
    ]
  ],
  "projects": [
    [
      "Proyek Web & Mobile",
      "Jelajahi proyek web dan mobile Najwa Syarif, teknologi yang digunakan, detail implementasi, serta demo dan kode yang tersedia."
    ],
    [
      "Web & Mobile Projects",
      "Explore web and mobile projects by Najwa Syarif, with technology stacks, implementation details, and available demos and source code."
    ]
  ],
  "achievements": [
    [
      "Sertifikat & Pencapaian",
      "Lihat sertifikat dan pencapaian Najwa Syarif dalam pengembangan perangkat lunak dan pembelajaran teknologi."
    ],
    [
      "Certificates & Achievements",
      "Browse certificates and achievements of Najwa Syarif in software development and technology learning."
    ]
  ],
  "layanan": [
    [
      "Layanan Digital & Kuliner",
      "Layanan website, aplikasi Android, dan sistem kasir UMKM dari Najwa Syarif, serta Mie Kopyok, catering, dan kemitraan."
    ],
    [
      "Digital & Culinary Services",
      "Explore website, Android app, and small-business POS services, alongside Mie Kopyok dining, catering, and partnerships."
    ]
  ],
  "assistant": [
    [
      "Asisten AI",
      "Tanyakan pengalaman, keahlian, layanan, dan proyek Najwa Syarif kepada Zaeeon AI, asisten virtual portofolio ini."
    ],
    [
      "AI Assistant",
      "Ask Zaeeon AI about the experience, skills, services, and projects of Najwa Syarif."
    ]
  ],
  "contact": [
    [
      "Kontak",
      "Hubungi Najwa Syarif untuk membahas proyek web dan mobile, kolaborasi, atau pertanyaan mengenai portofolio Zaeeon."
    ],
    [
      "Contact",
      "Contact Najwa Syarif to discuss web and mobile projects, collaboration, or the Zaeeon portfolio."
    ]
  ],
  "contents": [
    [
      "Konten",
      "Jelajahi konten video publik Najwa Syarif di portofolio Zaeeon."
    ],
    [
      "Content",
      "Explore public video content by Najwa Syarif featured in the Zaeeon portfolio."
    ]
  ],
  "dashboard": [
    [
      "Dashboard Aktivitas",
      "Lihat dashboard publik aktivitas coding dan kontribusi pengembangan Najwa Syarif."
    ],
    [
      "Activity Dashboard",
      "View the public dashboard of coding activity and development contributions by Najwa Syarif."
    ]
  ],
  "chat": [
    [
      "Ruang Chat",
      "Bergabung dalam ruang percakapan publik di portofolio Zaeeon by Najwa Syarif."
    ],
    [
      "Chat Room",
      "Join the public chat room on the Zaeeon by Najwa Syarif portfolio."
    ]
  ],
  "smart-talk": [
    [
      "Smart Talk",
      "Smart Talk sedang dipersiapkan untuk portofolio Zaeeon by Najwa Syarif."
    ],
    [
      "Smart Talk",
      "Smart Talk is coming soon to the Zaeeon by Najwa Syarif portfolio."
    ]
  ],
  "terminal": [
    [
      "Terminal Interaktif",
      "Jelajahi portofolio Najwa Syarif melalui mode terminal interaktif Zaeeon."
    ],
    [
      "Interactive Terminal",
      "Explore the portfolio of Najwa Syarif through the interactive Zaeeon terminal."
    ]
  ],
  "legal/privacy-policy": [
    [
      "Kebijakan Privasi",
      "Kebijakan privasi portofolio Najwa Syarif terkait TikTok API. Isi kebijakan tersedia dalam bahasa Inggris."
    ],
    [
      "Privacy Policy",
      "Privacy policy for the portfolio of Najwa Syarif and its TikTok API integration."
    ]
  ],
  "legal/terms-of-service": [
    [
      "Ketentuan Layanan",
      "Ketentuan penggunaan portofolio Najwa Syarif dan TikTok API. Isi ketentuan tersedia dalam bahasa Inggris."
    ],
    [
      "Terms of Service",
      "Terms of service for the portfolio of Najwa Syarif and its use of the TikTok API."
    ]
  ]
};
export const publicPaths = Object.keys(PAGE_SEO).filter(path => path !== "smart-talk");
export const pageUrl = (locale: string, path = "") => SITE_URL + "/" + locale + (path ? "/" + path : "");
export function socialImage(image?: string | null): string {
  try {
    const url = new URL(image || METADATA.profile, SITE_URL);
    if (["https:", "http:"].includes(url.protocol) && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return url.href;
  } catch { /* Use the existing portrait for invalid thumbnails. */ }
  return SITE_URL + METADATA.profile;
}
export function pageMetadata(locale: string, path: string, content?: { title: string; description: string; image?: string | null }): Metadata {
  const [title, description] = content ? [content.title, content.description] : PAGE_SEO[path][locale === "id" ? 0 : 1];
  const fullTitle = path ? title + " | Najwa Syarif — Zaeeon" : title;
  const image = { url: socialImage(content?.image), alt: content?.title || "Najwa Syarif — Zaeeon" };
  return {
    title: { absolute: fullTitle }, description,
    ...(path === "smart-talk" ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: pageUrl(locale, path),
      languages: { ...Object.fromEntries(routing.locales.map(language => [language, pageUrl(language, path)])), "x-default": pageUrl(routing.defaultLocale, path) },
    },
    openGraph: { title: fullTitle, description, url: pageUrl(locale, path), siteName: METADATA.openGraph.siteName, locale: locale === "id" ? "id_ID" : "en_US", alternateLocale: [locale === "id" ? "en_US" : "id_ID"], type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}
