
import {
  ALL_SECTIONS,
  hasSectionContent,
  splitLines,
} from "./model";

import type {
  ResumeData,
  SectionKey,
} from "./model";

export type LocalizedText = {
  id: string;
  en: string;
};

export type QualityArea = {
  key: string;
  label: LocalizedText;
  score: number;
  max: number;
};

export type QualitySuggestion = {
  key: string;
  title: LocalizedText;
  detail: LocalizedText;
};

export type BulletAdvice = {
  key: string;
  section: SectionKey;
  source: string;
  original: string;
  tips: LocalizedText[];
};

export type CVQualityResult = {
  score: number;
  areas: QualityArea[];
  suggestions: QualitySuggestion[];
  bullets: BulletAdvice[];
};

export type KeywordMatch = {
  label: string;
  matched: boolean;
};

export type JobMatchResult = {
  percentage: number | null;
  matchedCount: number;
  total: number;
  keywords: KeywordMatch[];
};

// kata kerja aktif dalam bahasa indonesia dan inggris
const ACTION_VERBS =
  /^(built|developed|designed|implemented|created|improved|optimized|managed|led|automated|delivered|analyzed|launched|maintained|tested|collaborated|reduced|increased|planned|organized|membangun|mengembangkan|merancang|menerapkan|membuat|meningkatkan|mengoptimalkan|mengelola|memimpin|mengotomatiskan|menganalisis|meluncurkan|memelihara|menguji|berkolaborasi|mengurangi|mempercepat|menyusun|merencanakan|bertanggung\s+jawab)\b/i;

const IMPACT_WORDS =
  /\b(reduced|increased|saved|accelerated|achieved|improved|resulted|enabled|delivered|mengurangi|meningkatkan|menghemat|mempercepat|menghasilkan|mencapai|berhasil|membantu)\b/i;

const METRIC =
  /\b\d+(?:[.,]\d+)?\s*(?:%|percent|persen|hours?|jam|days?|hari|weeks?|minggu|users?|pengguna|clients?|klien|projects?|proyek|requests?|permintaan)\b/i;

const YEAR = /\b(?:19|20)\d{2}\b/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const words = (text: string): string[] =>
  text.trim().split(/\s+/).filter(Boolean);

// hanya mengevaluasi section yang tampil di CV
function visible(
  resume: ResumeData,
  section: SectionKey
): boolean {
  return (
    !resume.hidden.includes(section) &&
    hasSectionContent(resume, section)
  );
}

// mengambil deskripsi pengalaman dan proyek
function collectBullets(resume: ResumeData): Array<{
  section: SectionKey;
  source: string;
  text: string;
}> {
  const all: Array<{
    section: SectionKey;
    source: string;
    text: string;
  }> = [];

  if (visible(resume, "experience")) {
    for (const exp of resume.experience) {
      for (const text of splitLines(exp.details)) {
        all.push({
          section: "experience",
          source:
            exp.role ||
            exp.organization ||
            "Experience",
          text,
        });
      }
    }
  }

  if (visible(resume, "projects")) {
    for (const project of resume.projects) {
      for (const text of splitLines(project.details)) {
        all.push({
          section: "projects",
          source: project.name || "Project",
          text,
        });
      }
    }
  }

  return all.slice(0, 150);
}

// menghitung skor kualitas CV berdasarkan aturan lokal
export function analyzeCVQuality(
  resume: ResumeData
): CVQualityResult {
  const suggestions: QualitySuggestion[] = [];

  const add = (
    key: string,
    titleId: string,
    titleEn: string,
    detailId: string,
    detailEn: string
  ) => {
    suggestions.push({
      key,
      title: { id: titleId, en: titleEn },
      detail: { id: detailId, en: detailEn },
    });
  };

  // 1. informasi kontak (maksimal 25)
  const profile = resume.profile;
  let contact = 0;

  if (profile.name.trim()) {
    contact += 7;
  } else {
    add(
      "name",
      "Lengkapi nama",
      "Add your name",
      "Nama lengkap membantu perekrut mengenali pemilik CV.",
      "A full name identifies the CV owner."
    );
  }

  if (EMAIL.test(profile.email.trim())) {
    contact += 7;
  } else {
    add(
      "email",
      "Periksa email",
      "Check your email",
      "Gunakan alamat email yang valid agar dapat dihubungi.",
      "Use a valid email address so recruiters can reach you."
    );
  }

  if (profile.phone.trim()) {
    contact += 5;
  } else {
    add(
      "phone",
      "Tambahkan nomor kontak",
      "Add a contact number",
      "Cantumkan nomor yang aktif apabila ingin dihubungi lewat telepon.",
      "Include an active number if you want to be contacted by phone."
    );
  }

  if (profile.location.trim()) {
    contact += 3;
  }

  if (
    profile.linkedin.trim() ||
    profile.website.trim()
  ) {
    contact += 3;
  }

  // 2. kelengkapan isi (maksimal 30)
  const academic = resume.template === "academic";
  let content = 0;

  if (
    (
      academic &&
      (
        visible(resume, "research") ||
        visible(resume, "publications")
      )
    ) ||
    visible(resume, "summary") ||
    profile.headline.trim()
  ) {
    content += 6;
  } else {
    add(
      "intro",
      "Perjelas profil profesional",
      "Clarify your profile",
      "Tambahkan headline atau ringkasan singkat yang faktual.",
      "Add a factual headline or a concise summary."
    );
  }

  if (
    visible(resume, "skills") ||
    (academic && visible(resume, "research"))
  ) {
    content += 6;
  } else {
    add(
      "skills",
      "Tunjukkan kompetensi",
      "Show your skills",
      "Isi keterampilan yang benar-benar kamu kuasai.",
      "List skills you genuinely possess."
    );
  }

  if (
    visible(resume, "experience") ||
    visible(resume, "projects") ||
    (
      academic &&
      visible(resume, "publications")
    )
  ) {
    content += 8;
  } else {
    add(
      "evidence",
      "Tambahkan bukti pengalaman",
      "Add evidence of your work",
      "Pengalaman, proyek, atau publikasi dapat memperkuat CV.",
      "Experience, projects, or publications can support your CV."
    );
  }

  if (visible(resume, "education")) {
    content += 6;
  } else {
    add(
      "education",
      "Lengkapi pendidikan",
      "Add education",
      "Tuliskan riwayat pendidikan yang relevan.",
      "Include relevant education history."
    );
  }

  const sectionCount = ALL_SECTIONS.filter(
    (section) => visible(resume, section)
  ).length;

  if (sectionCount >= 3) {
    content += 4;
  } else {
    add(
      "sections",
      "Isi bagian yang relevan",
      "Complete relevant sections",
      "Lengkapi beberapa bagian penting; tidak semua bagian harus ditampilkan.",
      "Complete a few important sections; not every section is mandatory."
    );
  }

  // 3. kualitas bullet (maksimal 25)
  const entries = collectBullets(resume);
  const bullets: BulletAdvice[] = [];

  let bulletFraction = 0;

  entries.forEach((entry, index) => {
    const length = words(entry.text).length;

    const cleanText = entry.text
      .trim()
     
.replace(
  new RegExp("[^\\p{L}\\p{N}+#]+", "gu"),
  " "
)


    const action = ACTION_VERBS.test(cleanText);

    const clear =
      length >= 6 && length <= 38;

    const impact =
      IMPACT_WORDS.test(entry.text) ||
      METRIC.test(entry.text);

    // penilaian sederhana dan transparan
    bulletFraction +=
      (action ? 0.35 : 0) +
      (
        clear
          ? 0.4
          : length >= 4 && length <= 45
          ? 0.18
          : 0
      ) +
      (impact ? 0.25 : 0);

    const tips: LocalizedText[] = [];

    if (!action) {
      tips.push({
        id: "Coba awali dengan kata kerja aksi, misalnya 'Mengembangkan' atau 'Merancang'.",
        en: "Try starting with an action verb, such as 'Developed' or 'Designed'.",
      });
    }

    if (length < 6) {
      tips.push({
        id: "Tambahkan konteks: apa yang dikerjakan dan dengan metode atau teknologi apa.",
        en: "Add context: what you did and which method or technology you used.",
      });
    }

    if (length > 38) {
      tips.push({
        id: "Ringkas kalimat agar satu poin menyampaikan satu gagasan utama.",
        en: "Shorten this point so it communicates one main idea.",
      });
    }

    if (!impact) {
      tips.push({
        id: "Jika ada, jelaskan manfaat atau hasil nyata tanpa mengarang angka.",
        en: "If available, mention a real benefit or outcome without inventing numbers.",
      });
    }

    if (tips.length) {
      bullets.push({
        key: `${entry.section}-${index}`,
        section: entry.section,
        source: entry.source,
        original: entry.text,
        tips,
      });
    }
  });

  const clarity = entries.length
    ? Math.round(
        (bulletFraction / entries.length) * 25
      )
    : 0;

  if (!entries.length) {
    add(
      "bullets",
      "Lengkapi deskripsi pengalaman atau proyek",
      "Add experience or project details",
      "Tulis aktivitas dan hasil nyata, satu poin per baris.",
      "Describe real actions and outcomes, one point per line."
    );
  } else if (bullets.length) {
    add(
      "bullet-review",
      "Tinjau penulisan bullet",
      "Review your bullet points",
      "Lihat saran spesifik di bagian Asisten Bullet.",
      "See specific suggestions in the Bullet Assistant."
    );
  }

  // 4. konsistensi format (maksimal 20)
  let format = 0;

  const periods = [
    ...resume.experience
      .filter(
        (item) =>
          visible(resume, "experience") &&
          (
            item.role.trim() ||
            item.organization.trim() ||
            item.details.trim()
          )
      )
      .map((item) => item.period.trim()),

    ...resume.education
      .filter(
        (item) =>
          visible(resume, "education") &&
          (
            item.institution.trim() ||
            item.degree.trim()
          )
      )
      .map((item) => item.period.trim()),

    ...resume.projects
      .filter(
        (item) =>
          visible(resume, "projects") &&
          (
            item.name.trim() ||
            item.details.trim()
          )
      )
      .map((item) => item.period.trim()),
  ];

  if (
    periods.length &&
    periods.every(
      (value) => value && YEAR.test(value)
    )
  ) {
    format += 8;
  } else if (!periods.length) {
    format += 4;
  } else {
    add(
      "dates",
      "Periksa penulisan periode",
      "Check date ranges",
      "Gunakan format tahun yang jelas dan konsisten, misalnya 2024–2026.",
      "Use clear, consistent years, such as 2024–2026."
    );
  }

  if (
    entries.every(
      (entry) =>
        words(entry.text).length <= 45
    )
  ) {
    format += 6;
  } else {
    add(
      "length",
      "Ada bullet terlalu panjang",
      "Some bullet points are too long",
      "Pecah poin panjang dan fokus pada informasi yang relevan.",
      "Break up lengthy points and focus on relevant information."
    );
  }

  if (
    words(resume.summary).length <= 130
  ) {
    format += 3;
  } else {
    add(
      "summary-long",
      "Ringkasan terlalu panjang",
      "Summary is very long",
      "Pertimbangkan ringkasan yang lebih singkat dan langsung ke inti.",
      "Consider a shorter, more focused summary."
    );
  }

  const skills = resume.skills.flatMap(
    (item) =>
      item.values
        .split(",")
        .map((value) =>
          value.trim().toLowerCase()
        )
        .filter(Boolean)
  );

  if (
    new Set(skills).size === skills.length
  ) {
    format += 3;
  } else {
    add(
      "duplicates",
      "Ada keterampilan berulang",
      "Duplicate skills found",
      "Hapus istilah keterampilan yang tercantum lebih dari sekali.",
      "Remove skills listed more than once."
    );
  }

  const areas: QualityArea[] = [
    {
      key: "contact",
      label: {
        id: "Informasi kontak",
        en: "Contact information",
      },
      score: contact,
      max: 25,
    },
    {
      key: "content",
      label: {
        id: "Kelengkapan isi",
        en: "Content completeness",
      },
      score: content,
      max: 30,
    },
    {
      key: "clarity",
      label: {
        id: "Kualitas bullet",
        en: "Bullet quality",
      },
      score: clarity,
      max: 25,
    },
    {
      key: "format",
      label: {
        id: "Konsistensi format",
        en: "Formatting consistency",
      },
      score: format,
      max: 20,
    },
  ];

  return {
    score: areas.reduce(
      (sum, area) =>
        sum + area.score,
      0
    ),
    areas,
    suggestions: suggestions.slice(0, 7),
    bullets: bullets.slice(0, 5),
  };
}

// daftar keyword yang dikenali secara otomatis
// dapat diperluas tanpa mengubah antarmuka
const KEYWORD_CATALOG: Array<{
  label: string;
  aliases: string[];
}> = [
  {
    label: "JavaScript",
    aliases: [
      "javascript",
      "vanilla javascript",
    ],
  },
  {
    label: "TypeScript",
    aliases: ["typescript"],
  },
  {
    label: "React",
    aliases: [
      "react",
      "react.js",
      "reactjs",
    ],
  },
  {
    label: "Next.js",
    aliases: [
      "next.js",
      "nextjs",
      "next js",
    ],
  },
  {
    label: "Node.js",
    aliases: [
      "node.js",
      "nodejs",
      "node js",
    ],
  },
  {
    label: "Vue",
    aliases: [
      "vue",
      "vue.js",
      "vuejs",
    ],
  },
  {
    label: "Angular",
    aliases: ["angular"],
  },
  {
    label: "PHP",
    aliases: ["php"],
  },
  {
    label: "Laravel",
    aliases: ["laravel"],
  },
  {
    label: "Yii2",
    aliases: [
      "yii2",
      "yii 2",
    ],
  },
  {
    label: "Python",
    aliases: ["python"],
  },
  {
    label: "Django",
    aliases: ["django"],
  },
  {
    label: "Java",
    aliases: ["java"],
  },
  {
    label: "Kotlin",
    aliases: ["kotlin"],
  },
  {
    label: "Flutter",
    aliases: ["flutter"],
  },
  {
    label: "Dart",
    aliases: ["dart"],
  },
  {
    label: "Swift",
    aliases: ["swift"],
  },
  {
    label: "HTML",
    aliases: [
      "html",
      "html5",
    ],
  },
  {
    label: "CSS",
    aliases: [
      "css",
      "css3",
    ],
  },
  {
    label: "Tailwind CSS",
    aliases: [
      "tailwind css",
      "tailwind",
    ],
  },
  {
    label: "SQL",
    aliases: ["sql"],
  },
  {
    label: "PostgreSQL",
    aliases: [
      "postgresql",
      "postgres",
    ],
  },
  {
    label: "MySQL",
    aliases: ["mysql"],
  },
  {
    label: "MongoDB",
    aliases: [
      "mongodb",
      "mongo db",
    ],
  },
  {
    label: "Redis",
    aliases: ["redis"],
  },
  {
    label: "REST API",
    aliases: [
      "rest api",
      "restful api",
      "restful",
    ],
  },
  {
    label: "GraphQL",
    aliases: ["graphql"],
  },
  {
    label: "Git",
    aliases: ["git"],
  },
  {
    label: "GitHub",
    aliases: ["github"],
  },
  {
    label: "Docker",
    aliases: ["docker"],
  },
  {
    label: "Kubernetes",
    aliases: [
      "kubernetes",
      "k8s",
    ],
  },
  {
    label: "AWS",
    aliases: [
      "aws",
      "amazon web services",
    ],
  },
  {
    label: "Firebase",
    aliases: ["firebase"],
  },
  {
    label: "Supabase",
    aliases: ["supabase"],
  },
  {
    label: "Linux",
    aliases: ["linux"],
  },
  {
    label: "Figma",
    aliases: ["figma"],
  },
  {
    label: "UI/UX",
    aliases: [
      "ui ux",
      "ui/ux",
      "user interface",
      "user experience",
    ],
  },
  {
    label: "Agile",
    aliases: ["agile"],
  },
  {
    label: "Scrum",
    aliases: ["scrum"],
  },
  {
    label: "CI/CD",
    aliases: [
      "ci cd",
      "ci/cd",
      "continuous integration",
    ],
  },
  {
    label: "Excel",
    aliases: [
      "microsoft excel",
      "excel",
    ],
  },
  {
    label: "Power BI",
    aliases: [
      "power bi",
      "powerbi",
    ],
  },
  {
    label: "Tableau",
    aliases: ["tableau"],
  },
  {
    label: "Data Analysis",
    aliases: [
      "data analysis",
      "analisis data",
      "data analytics",
    ],
  },
  {
    label: "Project Management",
    aliases: [
      "project management",
      "manajemen proyek",
    ],
  },
  {
    label: "Customer Service",
    aliases: [
      "customer service",
      "layanan pelanggan",
    ],
  },
  {
    label: "SEO",
    aliases: [
      "seo",
      "search engine optimization",
    ],
  },
];

// normalisasi istilah agar pencocokan konsisten
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contains(
  haystack: string,
  value: string
): boolean {
  const needle = normalize(value);

  return (
    needle.length > 0 &&
    ` ${haystack} `.includes(
      ` ${needle} `
    )
  );
}

// menggabungkan teks dari section yang ditampilkan
function visibleCVText(
  resume: ResumeData
): string {
  const text: string[] = [
    resume.profile.headline,
  ];

  const add = (
    section: SectionKey,
    value: string
  ) => {
    if (visible(resume, section)) {
      text.push(value);
    }
  };

  add("summary", resume.summary);

  add(
    "skills",
    resume.skills
      .map(
        (item) =>
          `${item.category} ${item.values}`
      )
      .join(" ")
  );

  add(
    "experience",
    resume.experience
      .map(
        (item) =>
          `${item.role} ${item.organization} ${item.details}`
      )
      .join(" ")
  );

  add(
    "education",
    resume.education
      .map(
        (item) =>
          `${item.institution} ${item.degree} ${item.details}`
      )
      .join(" ")
  );

  add(
    "projects",
    resume.projects
      .map(
        (item) =>
          `${item.name} ${item.details}`
      )
      .join(" ")
  );

  for (
    const section of [
      "awards",
      "leadership",
      "certifications",
      "research",
      "publications",
    ] as const
  ) {
    add(section, resume[section]);
  }

  return normalize(text.join(" "));
}

// mencocokkan keyword lowongan dengan isi CV
export function analyzeJobMatch(
  resume: ResumeData,
  jobDescription: string,
  additionalKeywords = ""
): JobMatchResult {
  const job = normalize(
    jobDescription.slice(0, 12000)
  );

  const cv = visibleCVText(resume);

  const required: Array<{
    label: string;
    aliases: string[];
  }> = [];

  // deteksi otomatis melalui kamus lokal
  for (const entry of KEYWORD_CATALOG) {
    if (
      entry.aliases.some(
        (alias) => contains(job, alias)
      )
    ) {
      required.push(entry);
    }
  }

  // keyword tambahan yang dimasukkan pengguna
  const custom = additionalKeywords
    .split(/[,;\n]/)
    .map((value) => value.trim())
    .filter(
      (value) =>
        value.length >= 2 &&
        value.length <= 60
    )
    .slice(0, 30);

  for (const term of custom) {
    const exists = required.some(
      (entry) =>
        normalize(entry.label) === normalize(term) ||
        entry.aliases.some(
          (alias) =>
            normalize(alias) === normalize(term)
        )
    );

    if (!exists) {
      required.push({
        label: term,
        aliases: [term],
      });
    }
  }

  const keywords: KeywordMatch[] =
    required.map((entry) => ({
      label: entry.label,
      matched: entry.aliases.some(
        (alias) => contains(cv, alias)
      ),
    }));

  const matchedCount = keywords.filter(
    (entry) => entry.matched
  ).length;

  return {
    percentage: keywords.length
      ? Math.round(
          (matchedCount / keywords.length) * 100
        )
      : null,

    matchedCount,
    total: keywords.length,
    keywords,
  };
}
