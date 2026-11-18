
export type CVTemplate = "professional" | "classic" | "academic";
export type CVLanguage = "en" | "id";

// pilihan kepadatan CV
// normal tetap didukung agar draft lama tidak rusak
export type Density =
  | "normal"
  | "compact"
  | "balanced"
  | "spacious";

// pilihan font dokumen
export type CVFont = "default" | "helvetica" | "times" | "courier";
export type CVTextAlign = "left" | "right" | "justify";

export type SectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "awards"
  | "leadership"
  | "certifications"
  | "research"
  | "publications";

export type Profile = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
};

export type SkillGroup = {
  id: string;
  category: string;
  values: string;
};

export type Experience = {
  id: string;
  role: string;
  organization: string;
  period: string;
  details: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  period: string;
  details: string;
};

export type Project = {
  id: string;
  name: string;
  period: string;
  details: string;
};

export type ResumeData = {
  version: 1;
  template: CVTemplate;
  language: CVLanguage;
  density: Density;

  // opsional agar draft versi lama tetap kompatibel
  font?: CVFont;
  textAlign?: CVTextAlign;

  profile: Profile;
  summary: string;
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  awards: string;
  leadership: string;
  certifications: string;
  research: string;
  publications: string;
  order: SectionKey[];
  hidden: SectionKey[];
};

export const ALL_SECTIONS: SectionKey[] = [
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "awards",
  "leadership",
  "certifications",
  "research",
  "publications",
];

export const DEFAULT_ORDER: Record<CVTemplate, SectionKey[]> = {
  professional: [
    "summary",
    "skills",
    "experience",
    "education",
    "awards",
    "leadership",
    "certifications",
    "projects",
    "research",
    "publications",
  ],

  classic: [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "leadership",
    "awards",
    "certifications",
    "research",
    "publications",
  ],

  academic: [
    "education",
    "research",
    "publications",
    "projects",
    "experience",
    "awards",
    "certifications",
    "leadership",
    "skills",
    "summary",
  ],
};

export const SECTION_TITLES: Record<
  CVLanguage,
  Record<SectionKey, string>
> = {
  en: {
    summary: "Professional Summary",
    skills: "Skills",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    awards: "Awards",
    leadership: "Leadership Experience",
    certifications: "Certifications",
    research: "Research Interests",
    publications: "Publications",
  },

  id: {
    summary: "Ringkasan Profesional",
    skills: "Keahlian",
    experience: "Pengalaman",
    education: "Pendidikan",
    projects: "Proyek",
    awards: "Penghargaan",
    leadership: "Pengalaman Organisasi",
    certifications: "Sertifikasi",
    research: "Minat Penelitian",
    publications: "Publikasi",
  },
};

// membuat data CV kosong
export function createBlankResume(): ResumeData {
  return {
    version: 1,
    template: "professional",
    language: "en",

    // default tata letak seimbang
    density: "balanced",
    font: "default",

    profile: {
      name: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },

    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    awards: "",
    leadership: "",
    certifications: "",
    research: "",
    publications: "",

    order: [...DEFAULT_ORDER.professional],
    hidden: [],
  };
}

// membuat data CV contoh

export function createSampleResume(): ResumeData {
  return {
    ...createBlankResume(),

    template: "professional",
    language: "en",
    density: "balanced",

    profile: {
      name: "Alex Morgan",
      headline: "Full Stack Web Developer",
      email: "alex.morgan@example.com",
      phone: "+62 812 0000 0000",
      location: "Semarang, Indonesia",
      linkedin: "linkedin.com/in/alexmorgan",
      website: "alexmorgan.dev",
    },

    summary:
      "Full Stack Web Developer with experience building web applications using Laravel, React, and Next.js. Skilled in developing REST APIs, managing databases, and creating responsive interfaces. Interested in solving real-world problems through practical and user-friendly digital solutions.",

    skills: [
      {
        id: "sample-skill-1",
        category: "Programming Languages",
        values: "PHP, JavaScript, TypeScript, SQL, HTML, CSS",
      },
      {
        id: "sample-skill-2",
        category: "Frameworks & Databases",
        values: "Laravel, Next.js, React, Tailwind CSS, MySQL, PostgreSQL",
      },
      {
        id: "sample-skill-3",
        category: "Tools & Technologies",
        values: "Git, GitHub, Docker, Postman, REST API, Figma",
      },
    ],

    experience: [
      {
        id: "sample-exp-1",
        role: "Full Stack Developer Intern",
        organization: "Example Digital Studio",
        period: "Jan 2026 – Jun 2026",
        details: [
          "Developed 10+ features for a Laravel-based management system, including user authentication, dashboards, and reporting.",
          "Built REST APIs and integrated PostgreSQL to support data management and application functionality.",
          "Collaborated with developers to fix bugs, improve code quality, and deliver responsive interfaces.",
        ].join("\n"),
      },
      {
        id: "sample-exp-2",
        role: "Frontend Developer Intern",
        organization: "Example Creative Agency",
        period: "Jul 2025 – Dec 2025",
        details: [
          "Built responsive website interfaces using React, Next.js, and Tailwind CSS.",
          "Translated Figma designs into reusable components with consistent layouts across devices.",
          "Improved page performance and accessibility through component optimization and testing.",
        ].join("\n"),
      },
    ],

    projects: [
      {
        id: "sample-project-1",
        name: "Personal Finance Management App",
        period: "2026",
        details:
          "Developed a personal finance application with transaction tracking, budgeting, and financial summaries using Flutter and SQLite.",
      },
      {
        id: "sample-project-2",
        name: "Small Business Management System",
        period: "2025",
        details:
          "Built a Laravel-based system for inventory management, sales transactions, and automated reporting for small businesses.",
      },
    ],

    education: [
      {
        id: "sample-edu-1",
        institution: "Universitas Dian Nuswantoro",
        degree: "Diploma in Informatics Engineering",
        period: "2023 – 2026",
        details:
          "GPA: 3.75/4.00 | Relevant coursework: Software Engineering, Database Systems, Web Development.",
      },
    ],

    leadership: [
      "Media Division Coordinator – Student Association (2024–2025). Led a team of 12 members and coordinated digital content.",
      "Member – Google Developer Groups (2024–2026). Participated in technology workshops and developer events.",
    ].join("\n"),

    awards:
      "2nd Place – University Web Development Competition (2025)",

    certifications: [
      "Web Developer Certification – Example Academy (2025)",
      "Full Stack Web Development – Example Learning Platform (2026)",
    ].join("\n"),

    research: "",
    publications: "",

    // urutan section untuk menampilkan CV yang lebih terstruktur
    order: [
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "leadership",
      "awards",
      "certifications",
      "research",
      "publications",
    ],

    hidden: [],
  };
}


// memisahkan teks berdasarkan baris
export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// mengecek apakah bagian CV memiliki isi
export function hasSectionContent(
  resume: ResumeData,
  key: SectionKey
): boolean {
  if (key === "summary") {
    return Boolean(resume.summary.trim());
  }

  if (key === "skills") {
    return resume.skills.some(
      (x) => x.category.trim() || x.values.trim()
    );
  }

  if (key === "experience") {
    return resume.experience.some(
      (x) =>
        x.role.trim() ||
        x.organization.trim() ||
        x.details.trim()
    );
  }

  if (key === "education") {
    return resume.education.some(
      (x) => x.institution.trim() || x.degree.trim()
    );
  }

  if (key === "projects") {
    return resume.projects.some(
      (x) => x.name.trim() || x.details.trim()
    );
  }

  return Boolean(resume[key].trim());
}

// memvalidasi draft CV sebelum dipakai
export function isResumeData(value: unknown): value is ResumeData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const v = value as Partial<ResumeData>;
  const p = v.profile as Partial<Profile> | undefined;

  const templates: CVTemplate[] = [
    "professional",
    "classic",
    "academic",
  ];

  const languages: CVLanguage[] = ["en", "id"];

  const densities: Density[] = [
    "normal",
    "compact",
    "balanced",
    "spacious",
  ];

  const fonts: CVFont[] = [
    "default",
    "helvetica",
    "times",
    "courier",
  ];

  return (
    v.version === 1 &&

    // validasi pilihan template
    templates.includes(v.template as CVTemplate) &&

    // validasi bahasa dokumen
    languages.includes(v.language as CVLanguage) &&

    // validasi semua pilihan kepadatan
    densities.includes(v.density as Density) &&

    // font draft lama yang belum tersimpan dianggap default
    (v.font === undefined || fonts.includes(v.font)) &&

    (v.textAlign === undefined ||
      (["left", "right", "justify"] as CVTextAlign[]).includes(v.textAlign)) &&

    // validasi profil
    !!p &&
    [
      "name",
      "headline",
      "email",
      "phone",
      "location",
      "linkedin",
      "website",
    ].every(
      (k) => typeof p[k as keyof Profile] === "string"
    ) &&

    // validasi bagian teks
    [
      "summary",
      "awards",
      "leadership",
      "certifications",
      "research",
      "publications",
    ].every(
      (k) =>
        typeof v[k as keyof ResumeData] === "string"
    ) &&

    // validasi keahlian
    Array.isArray(v.skills) &&
    v.skills.every(
      (x) =>
        x &&
        typeof x.id === "string" &&
        typeof x.category === "string" &&
        typeof x.values === "string"
    ) &&

    // validasi pengalaman
    Array.isArray(v.experience) &&
    v.experience.every(
      (x) =>
        x &&
        ["id", "role", "organization", "period", "details"].every(
          (k) =>
            typeof x[k as keyof Experience] === "string"
        )
    ) &&

    // validasi pendidikan
    Array.isArray(v.education) &&
    v.education.every(
      (x) =>
        x &&
        ["id", "institution", "degree", "period", "details"].every(
          (k) =>
            typeof x[k as keyof Education] === "string"
        )
    ) &&

    // validasi proyek
    Array.isArray(v.projects) &&
    v.projects.every(
      (x) =>
        x &&
        ["id", "name", "period", "details"].every(
          (k) =>
            typeof x[k as keyof Project] === "string"
        )
    ) &&

    // validasi urutan section
    Array.isArray(v.order) &&
    v.order.length === ALL_SECTIONS.length &&
    new Set(v.order).size === ALL_SECTIONS.length &&
    v.order.every((k) => ALL_SECTIONS.includes(k)) &&

    // validasi section yang disembunyikan
    Array.isArray(v.hidden) &&
    v.hidden.every((k) => ALL_SECTIONS.includes(k))
  );
}
