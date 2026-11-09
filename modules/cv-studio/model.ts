
export type CVTemplate = "professional" | "classic" | "academic";
export type CVLanguage = "en" | "id";
export type Density = "normal" | "compact";

// pilihan font dokumen
export type CVFont = "default" | "helvetica" | "times" | "courier";

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
    "summary", "skills", "experience", "education",
    "awards", "leadership", "certifications", "projects",
    "research", "publications",
  ],
  classic: [
    "summary", "experience", "education", "skills",
    "projects", "leadership", "awards", "certifications",
    "research", "publications",
  ],
  academic: [
    "education", "research", "publications", "projects",
    "experience", "awards", "certifications", "leadership",
    "skills", "summary",
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

export function createBlankResume(): ResumeData {
  return {
    version: 1,
    template: "professional",
    language: "en",
    density: "normal",
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

export function createSampleResume(): ResumeData {
  return {
    ...createBlankResume(),
    profile: {
      name: "Najwa Syarif",
      headline: "Software Developer",
      email: "najwasyarif@example.com",
      phone: "+62 812 0000 0000",
      location: "Indonesia",
      linkedin: "linkedin.com/in/",
      website: "example.com",
    },
    summary:
      "Software developer focused on building reliable digital products, improving workflows, and creating practical solutions for people.",
    skills: [
      {
        id: "sample-skill-1",
        category: "Languages",
        values: "JavaScript, TypeScript, SQL",
      },
      {
        id: "sample-skill-2",
        category: "Frameworks & Tools",
        values: "Next.js, React, PostgreSQL, Git",
      },
    ],
    experience: [
      {
        id: "sample-exp-1",
        role: "Full Stack Developer",
        organization: "Example Digital Studio",
        period: "2024 – Present",
        details:
          "Built responsive applications for small businesses.\nReduced repetitive administrative work by introducing automated workflows.",
      },
    ],
    education: [
      {
        id: "sample-edu-1",
        institution: "Example University",
        degree: "Diploma in Informatics",
        period: "2023 – 2026",
        details:
          "Relevant coursework: databases, software engineering, web development.",
      },
    ],
    projects: [
      {
        id: "sample-project-1",
        name: "Personal Finance App",
        period: "2026",
        details:
          "Designed an offline-first application to help people understand daily spending.",
      },
    ],
    awards: "Finalist — Student Software Competition (2025)",
    leadership:
      "Media Team Coordinator — Student Organization (2024–2025)",
    certifications:
      "Web Development Certificate — Example Academy (2025)",
    research: "Human-centered software; digital inclusion",
    publications: "",
  };
}

export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

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

export function isResumeData(value: unknown): value is ResumeData {
  if (!value || typeof value !== "object") return false;

  const v = value as Partial<ResumeData>;
  const p = v.profile as Partial<Profile> | undefined;

  const templates: CVTemplate[] = [
    "professional", "classic", "academic",
  ];

  const languages: CVLanguage[] = ["en", "id"];

  const fonts: CVFont[] = [
    "default", "helvetica", "times", "courier",
  ];

  return (
    v.version === 1 &&
    templates.includes(v.template as CVTemplate) &&
    languages.includes(v.language as CVLanguage) &&
    (v.density === "normal" || v.density === "compact") &&

    // font lama yang belum tersimpan dianggap default
    (v.font === undefined || fonts.includes(v.font)) &&

    !!p &&
    [
      "name", "headline", "email", "phone",
      "location", "linkedin", "website",
    ].every(
      (k) => typeof p[k as keyof Profile] === "string"
    ) &&

    [
      "summary", "awards", "leadership",
      "certifications", "research", "publications",
    ].every(
      (k) =>
        typeof v[k as keyof ResumeData] === "string"
    ) &&

    Array.isArray(v.skills) &&
    v.skills.every(
      (x) =>
        x &&
        typeof x.id === "string" &&
        typeof x.category === "string" &&
        typeof x.values === "string"
    ) &&

    Array.isArray(v.experience) &&
    v.experience.every(
      (x) =>
        x &&
        ["id", "role", "organization", "period", "details"].every(
          (k) =>
            typeof x[k as keyof Experience] === "string"
        )
    ) &&

    Array.isArray(v.education) &&
    v.education.every(
      (x) =>
        x &&
        ["id", "institution", "degree", "period", "details"].every(
          (k) =>
            typeof x[k as keyof Education] === "string"
        )
    ) &&

    Array.isArray(v.projects) &&
    v.projects.every(
      (x) =>
        x &&
        ["id", "name", "period", "details"].every(
          (k) =>
            typeof x[k as keyof Project] === "string"
        )
    ) &&

    Array.isArray(v.order) &&
    v.order.length === ALL_SECTIONS.length &&
    new Set(v.order).size === ALL_SECTIONS.length &&
    v.order.every((k) => ALL_SECTIONS.includes(k)) &&

    Array.isArray(v.hidden) &&
    v.hidden.every((k) => ALL_SECTIONS.includes(k))
  );
}
