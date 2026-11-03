// Peta arsitektur yang ditampilkan ke publik. Isi hanya dengan alur yang dapat diverifikasi.
// Ganti/tambah slug setelah memeriksa URL proyek asli pada halaman Projects.

export type I18nText = { id: string; en: string };
export type NodeKind = "interface" | "route" | "service" | "external";

export type ArchitectureNode = {
  id: string;
  kind: NodeKind;
  title: I18nText;
  file?: string;
  description: I18nText;
};

export type ArchitectureFlow = {
  id: string;
  title: I18nText;
  description: I18nText;
  evidence: I18nText;
  nodes: ArchitectureNode[];
};

export type ArchitectureDefinition = {
  project: string;
  intro: I18nText;
  flows: ArchitectureFlow[];
};

const ZAEEON: ArchitectureDefinition = {
  project: "Zaeeon.site",
  intro: {
    id: "Jelajahi beberapa alur teknis yang digunakan website ini, dari komponen UI hingga layanan eksternal. Diagram ini bukan peta seluruh sistem.",
    en: "Explore selected technical flows behind this website, from UI components to external services. This is not a complete system map.",
  },
  flows: [
    {
      id: "project-page",
      title: { id: "Halaman Detail Proyek", en: "Project Detail Page" },
      description: {
        id: "Struktur route dan komponen UI untuk halaman proyek yang sedang dibuka.",
        en: "Route and UI component structure for the currently opened project page.",
      },
      evidence: {
        id: "Berdasarkan file tree proyek. Panggilan data internal belum divisualisasikan karena belum diverifikasi dari kode.",
        en: "Based on the project file tree. Internal data calls are omitted because their implementations have not been verified.",
      },
      nodes: [
        {
          id: "visitor",
          kind: "interface",
          title: { id: "Pengunjung", en: "Visitor" },
          description: {
            id: "Membuka halaman detail dari daftar proyek pada situs.",
            en: "Opens a project detail page from the website's project listing.",
          },
        },
        {
          id: "project-route",
          kind: "route",
          title: { id: "Next.js App Router", en: "Next.js App Router" },
          file: "app/[locale]/projects/[slug]/page.tsx",
          description: {
            id: "Route detail proyek dengan segmen bahasa dan slug dinamis.",
            en: "Project detail route with locale and dynamic slug segments.",
          },
        },
        {
          id: "project-view",
          kind: "interface",
          title: { id: "ProjectDetail", en: "ProjectDetail" },
          file: "modules/projects/components/ProjectDetail.tsx",
          description: {
            id: "Komponen detail proyek yang tersedia di struktur source code.",
            en: "Project detail component present in the source tree.",
          },
        },
      ],
    },
    {
      id: "github",
      title: { id: "Kontribusi GitHub", en: "GitHub Contributions" },
      description: {
        id: "Pengambilan data kalender kontribusi dari GitHub GraphQL melalui backend Next.js.",
        en: "Fetching the contribution calendar from GitHub GraphQL through the Next.js backend.",
      },
      evidence: {
        id: "Endpoint dan service pernah diuji; GraphQL mengembalikan array minggu dan hari kontribusi.",
        en: "The endpoint and service were tested; GraphQL returned contribution weeks and days.",
      },
      nodes: [
        {
          id: "github-ui",
          kind: "interface",
          title: { id: "Contributions UI", en: "Contributions UI" },
          file: "modules/dashboard/components/Contributions/",
          description: {
            id: "Komponen frontend yang menampilkan total dan kalender kontribusi.",
            en: "Frontend components rendering the contribution total and calendar.",
          },
        },
        {
          id: "github-route",
          kind: "route",
          title: { id: "Next.js API Route", en: "Next.js API Route" },
          file: "app/api/github/route.ts",
          description: {
            id: "Endpoint server-side /api/github yang dipanggil dari portofolio.",
            en: "Server-side /api/github endpoint called by the portfolio.",
          },
        },
        {
          id: "github-service",
          kind: "service",
          title: { id: "GitHub Service", en: "GitHub Service" },
          file: "services/github.ts",
          description: {
            id: "Lapisan service yang menyiapkan permintaan GitHub GraphQL.",
            en: "Service layer preparing the GitHub GraphQL request.",
          },
        },
        {
          id: "github-api",
          kind: "external",
          title: { id: "GitHub GraphQL", en: "GitHub GraphQL" },
          file: "api.github.com/graphql",
          description: {
            id: "Menyediakan contributionCalendar, weeks, dan contributionDays.",
            en: "Provides contributionCalendar, weeks, and contributionDays.",
          },
        },
      ],
    },
    {
      id: "wakatime",
      title: { id: "Aktivitas WakaTime", en: "WakaTime Activity" },
      description: {
        id: "Statistik coding yang diambil dari WakaTime melalui API server portofolio.",
        en: "Coding statistics retrieved from WakaTime through the portfolio server API.",
      },
      evidence: {
        id: "Data last_7_days dan total coding sudah pernah diverifikasi melalui Postman dan API portofolio.",
        en: "The last_7_days and all-time coding data were verified through Postman and the portfolio API.",
      },
      nodes: [
        {
          id: "waka-ui",
          kind: "interface",
          title: { id: "CodingActive UI", en: "CodingActive UI" },
          file: "modules/dashboard/components/CodingActive/",
          description: {
            id: "Menampilkan durasi coding, rata-rata, hari terbaik, dan bahasa.",
            en: "Displays coding duration, average, best day, and languages.",
          },
        },
        {
          id: "waka-route",
          kind: "route",
          title: { id: "Next.js API Route", en: "Next.js API Route" },
          file: "app/api/read-stats/route.ts",
          description: {
            id: "Endpoint server-side /api/read-stats.",
            en: "Server-side /api/read-stats endpoint.",
          },
        },
        {
          id: "waka-service",
          kind: "service",
          title: { id: "WakaTime Service", en: "WakaTime Service" },
          file: "services/wakatime.ts",
          description: {
            id: "Mengambil statistik WakaTime dari server dan menangani data respons.",
            en: "Fetches WakaTime statistics server-side and processes API responses.",
          },
        },
        {
          id: "waka-api",
          kind: "external",
          title: { id: "WakaTime REST API", en: "WakaTime REST API" },
          file: "api.wakatime.com/api/v1/",
          description: {
            id: "Sumber data aktivitas coding yang dicatat WakaTime.",
            en: "Source of coding activity recorded by WakaTime.",
          },
        },
      ],
    },
  ],
};

export const ARCHITECTURES: Record<string,ArchitectureDefinition> = {
  "zaeeon.site": ZAEEON,
  "zaeeon-site": ZAEEON,
  "zaeeon": ZAEEON,
  "zaeeon-site-portofolio-website": ZAEEON,
};


export function getArchitectureForSlug(value: string): ArchitectureDefinition | null {
  let slug = value;
  try {
    slug = decodeURIComponent(value);
  } catch {
    // Gunakan nilai slug apa adanya bila encoding URL tidak valid.
  }
  return ARCHITECTURES[slug.toLowerCase().trim()] ?? null;
}
