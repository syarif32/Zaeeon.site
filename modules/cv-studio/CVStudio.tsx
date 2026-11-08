
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useLocale } from "next-intl";
import {
  HiOutlineArrowDown,
  HiOutlineChevronDown,
  HiOutlineArrowUp,
  HiOutlineCheckCircle,
  HiOutlineDocumentArrowDown,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowUpTray,
} from "react-icons/hi2";
import {
  ALL_SECTIONS,
  DEFAULT_ORDER,
  SECTION_TITLES,
  createBlankResume,
  createSampleResume,
  isResumeData,
} from "./model";
import type {
  CVTemplate,
  Density,
  Education,
  Experience,
  Profile,
  Project,
  ResumeData,
  SectionKey,
  SkillGroup,
} from "./model";

const PDFPanel = dynamic(() => import("./PDFPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-neutral-200 text-sm text-neutral-500 dark:border-neutral-800">
      Loading PDF preview...
    </div>
  ),
});

const STORAGE_KEY = "zaeeon-cv-studio-draft-v1";

const INPUT =
  "w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-950/50 dark:text-neutral-100";

const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";

const TEMPLATES: {
  id: CVTemplate;
  name: string;
  hintEn: string;
  hintId: string;
}[] = [
  {
    id: "professional",
    name: "Professional",
    hintEn: "Clean and experience-first, based ATS Frendly.",
    hintId: "Rapi dan fokus pengalaman, format ATS.",
  },
  {
    id: "classic",
    name: "Classic",
    hintEn: "Elegant serif typography with a restrained navy accent.",
    hintId: "Tipografi serif elegan dengan aksen biru tua.",
  },
  {
    id: "academic",
    name: "Academic",
    hintEn: "Education and research first, suitable for scholarships.",
    hintId: "Fokus pendidikan dan riset, cocok untuk beasiswa.",
  },
];

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </span>

      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${INPUT} resize-y leading-relaxed`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={INPUT}
        />
      )}
    </label>
  );
}

function CollapsiblePane({
  title,
  desc,
  children,
  defaultOpen = false,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  // status buka/tutup panel
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <details
      open={expanded}
      onToggle={(event) => {
        setExpanded(event.currentTarget.open);
      }}
      className="group min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-teal-500 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>

          {desc ? (
            <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {desc}
            </p>
          ) : null}
        </div>

        <HiOutlineChevronDown
          aria-hidden="true"
          size={17}
          className="mt-0.5 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180 dark:text-neutral-400"
        />
      </summary>

      <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        {children}
      </div>
    </details>
  );
}

function TemplateMiniature({ kind }: { kind: CVTemplate }) {
  return (
    <div
      aria-hidden="true"
      className={`h-[86px] w-[65px] shrink-0 overflow-hidden rounded-sm border border-neutral-200 bg-white px-2 py-2 shadow-sm ${
        kind === "classic" ? "text-left" : "text-center"
      }`}
    >
      {kind === "academic" ? (
        <div className="mx-auto mb-1 h-[2px] w-7 bg-neutral-400" />
      ) : null}

      <div
        className={`mb-1 h-1.5 bg-neutral-900 ${
          kind === "classic" ? "w-8 bg-slate-700" : "mx-auto w-10"
        }`}
      />

      <div
        className={`mb-2 h-0.5 bg-neutral-300 ${
          kind === "classic" ? "w-9" : "mx-auto w-11"
        }`}
      />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-1.5 text-left">
          <div
            className={`mb-1 h-[3px] w-7 ${
              kind === "classic" ? "bg-slate-700" : "bg-neutral-800"
            }`}
          />

          <div className="mb-0.5 h-px w-full bg-neutral-400" />
          <div className="mb-0.5 h-[2px] w-full bg-neutral-200" />
          <div className="h-[2px] w-9 bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

export default function CVStudio() {
  const locale = useLocale();
  const isId = locale === "id";

  const [resume, setResume] = useState<ResumeData>(
    () => createBlankResume()
  );

  const [preview, setPreview] = useState<ResumeData>(
    () => createBlankResume()
  );

  const [hydrated, setHydrated] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [message, setMessage] = useState("");

  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data: unknown = JSON.parse(saved);

        if (isResumeData(data)) {
          setResume(data);
        }
      }
    } catch {
      // Draft yang tidak valid diabaikan. Pengguna dapat mengimpor backup JSON.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(resume)
      );
    } catch {
      setMessage(
        isId
          ? "Penyimpanan browser tidak tersedia. Gunakan Export JSON untuk cadangan."
          : "Browser storage is unavailable. Use Export JSON for backup."
      );
    }
  }, [resume, hydrated, isId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPreview(resume);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [resume]);

  const updateProfile = useCallback(
    (key: keyof Profile, value: string) => {
      setResume((old) => ({
        ...old,
        profile: {
          ...old.profile,
          [key]: value,
        },
      }));
    },
    []
  );

  const changeTemplate = (template: CVTemplate) => {
    if (template === resume.template) return;

    // Pilihan template tidak menambah data apa pun. Hanya jenis template dan urutan bagian.
    // Preview diperbarui langsung agar PDF template lama tidak tertahan 500 ms.
    const next: ResumeData = {
      ...resume,
      template,
      order: [...DEFAULT_ORDER[template]],
    };

    setResume(next);
    setPreview(next);

    setMessage(
      isId
        ? "Template dipilih. Urutan bagian mengikuti template; isi tetap aman."
        : "Template selected. Section order reset; your content is preserved."
    );
  };

  const swapSection = (
    index: number,
    direction: -1 | 1
  ) => {
    setResume((old) => {
      const next = [...old.order];
      const to = index + direction;

      if (to < 0 || to >= next.length) return old;

      [next[index], next[to]] = [
        next[to],
        next[index],
      ];

      return {
        ...old,
        order: next,
      };
    });
  };

  const toggleSection = (section: SectionKey) => {
    setResume((old) => ({
      ...old,
      hidden: old.hidden.includes(section)
        ? old.hidden.filter((x) => x !== section)
        : [...old.hidden, section],
    }));
  };

  const updateSkill = (
    id: string,
    field: keyof SkillGroup,
    value: string
  ) => {
    setResume((old) => ({
      ...old,
      skills: old.skills.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      ),
    }));
  };

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: string
  ) => {
    setResume((old) => ({
      ...old,
      experience: old.experience.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      ),
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string
  ) => {
    setResume((old) => ({
      ...old,
      education: old.education.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      ),
    }));
  };

  const updateProject = (
    id: string,
    field: keyof Project,
    value: string
  ) => {
    setResume((old) => ({
      ...old,
      projects: old.projects.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      ),
    }));
  };

  const exportDraft = () => {
    const data = new Blob(
      [JSON.stringify(resume, null, 2)],
      { type: "application/json;charset=utf-8" }
    );

    const url = URL.createObjectURL(data);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "zaeeon-cv-draft.json";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    setMessage(
      isId
        ? "Cadangan JSON berhasil diunduh."
        : "JSON backup downloaded."
    );
  };

  const importDraft = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    if (file.size > 300_000) {
      setMessage(
        isId
          ? "File terlalu besar (maksimal 300 KB)."
          : "File too large (maximum 300 KB)."
      );
      return;
    }

    try {
      const parsed: unknown = JSON.parse(
        await file.text()
      );

      if (!isResumeData(parsed)) {
        throw new Error("invalid draft");
      }

      setResume(parsed);

      setMessage(
        isId
          ? "Draft berhasil diimpor."
          : "Draft imported successfully."
      );
    } catch {
      setMessage(
        isId
          ? "File JSON tidak cocok dengan format Zaeeon CV Studio."
          : "Invalid Zaeeon CV Studio JSON file."
      );
    }
  };

  const resetDraft = () => {
    if (
      !window.confirm(
        isId
          ? "Hapus semua data CV yang tersimpan di browser ini?"
          : "Delete all CV data saved in this browser?"
      )
    ) {
      return;
    }

    setResume(createBlankResume());

    setMessage(
      isId
        ? "Draft dikosongkan."
        : "Draft cleared."
    );
  };

  const renderSectionEditor = (section: SectionKey) => {
    if (resume.hidden.includes(section)) return null;

    switch (section) {
      case "summary":
        return (
          <Field
            label={
              isId
                ? "Ringkasan diri"
                : "Professional summary"
            }
            value={resume.summary}
            onChange={(value) =>
              setResume((old) => ({
                ...old,
                summary: value,
              }))
            }
            multiline
            rows={4}
            placeholder={
              isId
                ? "Jelaskan keahlian dan hasil kerja berdasarkan fakta..."
                : "Describe your strengths and real achievements..."
            }
          />
        );

      case "skills":
        return (
          <div className="space-y-3">
            {resume.skills.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label={
                      isId ? "Kategori" : "Category"
                    }
                    value={item.category}
                    onChange={(v) =>
                      updateSkill(item.id, "category", v)
                    }
                    placeholder="Languages"
                  />

                  <Field
                    label={
                      isId
                        ? "Keahlian (pisah koma)"
                        : "Skills (comma-separated)"
                    }
                    value={item.values}
                    onChange={(v) =>
                      updateSkill(item.id, "values", v)
                    }
                    placeholder="PHP, SQL, Next.js"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setResume((old) => ({
                      ...old,
                      skills: old.skills.filter(
                        (x) => x.id !== item.id
                      ),
                    }))
                  }
                  className="mt-3 text-xs text-red-500 hover:underline"
                >
                  {isId
                    ? "Hapus kategori"
                    : "Remove category"}
                </button>
              </div>
            ))}

            <button
              type="button"
              className={SECONDARY_BUTTON}
              onClick={() =>
                setResume((old) => ({
                  ...old,
                  skills: [
                    ...old.skills,
                    {
                      id: crypto.randomUUID(),
                      category: "",
                      values: "",
                    },
                  ],
                }))
              }
            >
              <HiOutlinePlus />
              {isId
                ? "Tambah kategori"
                : "Add category"}
            </button>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-3">
            {resume.experience.map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label={isId ? "Jabatan" : "Role"}
                    value={item.role}
                    onChange={(v) =>
                      updateExperience(item.id, "role", v)
                    }
                    placeholder="Full Stack Developer"
                  />

                  <Field
                    label={
                      isId
                        ? "Perusahaan / Organisasi"
                        : "Organization"
                    }
                    value={item.organization}
                    onChange={(v) =>
                      updateExperience(
                        item.id,
                        "organization",
                        v
                      )
                    }
                    placeholder="Company name"
                  />
                </div>

                <Field
                  label={isId ? "Periode" : "Period"}
                  value={item.period}
                  onChange={(v) =>
                    updateExperience(item.id, "period", v)
                  }
                  placeholder="2024 – Present"
                />

                <Field
                  label={
                    isId
                      ? "Pencapaian (satu per baris)"
                      : "Achievements (one per line)"
                  }
                  value={item.details}
                  onChange={(v) =>
                    updateExperience(item.id, "details", v)
                  }
                  multiline
                  rows={3}
                  placeholder={
                    isId
                      ? "Bangun sistem untuk...\nMengurangi waktu proses..."
                      : "Built an application for...\nImproved the workflow by..."
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setResume((old) => ({
                      ...old,
                      experience: old.experience.filter(
                        (x) => x.id !== item.id
                      ),
                    }))
                  }
                  className="text-xs text-red-500 hover:underline"
                >
                  {isId
                    ? "Hapus pengalaman"
                    : "Remove experience"}
                </button>
              </div>
            ))}

            <button
              type="button"
              className={SECONDARY_BUTTON}
              onClick={() =>
                setResume((old) => ({
                  ...old,
                  experience: [
                    ...old.experience,
                    {
                      id: crypto.randomUUID(),
                      role: "",
                      organization: "",
                      period: "",
                      details: "",
                    },
                  ],
                }))
              }
            >
              <HiOutlinePlus />
              {isId
                ? "Tambah pengalaman"
                : "Add experience"}
            </button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-3">
            {resume.education.map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <Field
                  label={
                    isId ? "Institusi" : "Institution"
                  }
                  value={item.institution}
                  onChange={(v) =>
                    updateEducation(
                      item.id,
                      "institution",
                      v
                    )
                  }
                  placeholder="University name"
                />

                <Field
                  label={
                    isId
                      ? "Program / Gelar"
                      : "Degree / Program"
                  }
                  value={item.degree}
                  onChange={(v) =>
                    updateEducation(item.id, "degree", v)
                  }
                  placeholder="BSc in Computer Science"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label={
                      isId ? "Periode" : "Period"
                    }
                    value={item.period}
                    onChange={(v) =>
                      updateEducation(
                        item.id,
                        "period",
                        v
                      )
                    }
                    placeholder="2022 – 2026"
                  />

                  <Field
                    label={
                      isId
                        ? "Detail opsional"
                        : "Optional details"
                    }
                    value={item.details}
                    onChange={(v) =>
                      updateEducation(
                        item.id,
                        "details",
                        v
                      )
                    }
                    placeholder="GPA / research topic"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setResume((old) => ({
                      ...old,
                      education: old.education.filter(
                        (x) => x.id !== item.id
                      ),
                    }))
                  }
                  className="text-xs text-red-500 hover:underline"
                >
                  {isId
                    ? "Hapus pendidikan"
                    : "Remove education"}
                </button>
              </div>
            ))}

            <button
              type="button"
              className={SECONDARY_BUTTON}
              onClick={() =>
                setResume((old) => ({
                  ...old,
                  education: [
                    ...old.education,
                    {
                      id: crypto.randomUUID(),
                      institution: "",
                      degree: "",
                      period: "",
                      details: "",
                    },
                  ],
                }))
              }
            >
              <HiOutlinePlus />
              {isId
                ? "Tambah pendidikan"
                : "Add education"}
            </button>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-3">
            {resume.projects.map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <Field
                  label={
                    isId
                      ? "Nama proyek"
                      : "Project name"
                  }
                  value={item.name}
                  onChange={(v) =>
                    updateProject(item.id, "name", v)
                  }
                  placeholder="Portfolio Website"
                />

                <Field
                  label={
                    isId ? "Periode" : "Period"
                  }
                  value={item.period}
                  onChange={(v) =>
                    updateProject(item.id, "period", v)
                  }
                  placeholder="2026"
                />

                <Field
                  label={
                    isId
                      ? "Deskripsi"
                      : "Description"
                  }
                  value={item.details}
                  onChange={(v) =>
                    updateProject(item.id, "details", v)
                  }
                  multiline
                  rows={2}
                />

                <button
                  type="button"
                  onClick={() =>
                    setResume((old) => ({
                      ...old,
                      projects: old.projects.filter(
                        (x) => x.id !== item.id
                      ),
                    }))
                  }
                  className="text-xs text-red-500 hover:underline"
                >
                  {isId
                    ? "Hapus proyek"
                    : "Remove project"}
                </button>
              </div>
            ))}

            <button
              type="button"
              className={SECONDARY_BUTTON}
              onClick={() =>
                setResume((old) => ({
                  ...old,
                  projects: [
                    ...old.projects,
                    {
                      id: crypto.randomUUID(),
                      name: "",
                      period: "",
                      details: "",
                    },
                  ],
                }))
              }
            >
              <HiOutlinePlus />
              {isId
                ? "Tambah proyek"
                : "Add project"}
            </button>
          </div>
        );

      default:
        return (
          <Field
            label={
              isId
                ? "Satu item per baris"
                : "One item per line"
            }
            value={resume[section]}
            onChange={(value) =>
              setResume((old) => ({
                ...old,
                [section]: value,
              }))
            }
            multiline
            rows={3}
            placeholder={
              isId
                ? "Tambahkan item di setiap baris..."
                : "Enter each item on a separate line..."
            }
          />
        );
    }
  };

  const sections = resume.order;

  const fieldLabels: {
    key: keyof Profile;
    en: string;
    id: string;
    placeholder?: string;
  }[] = [
    {
      key: "name",
      en: "Full name",
      id: "Nama lengkap",
      placeholder: "Muhammad Najwa Syarif",
    },
    {
      key: "headline",
      en: "Professional title (optional)",
      id: "Profesi (opsional)",
      placeholder: "Software Developer",
    },
    {
      key: "email",
      en: "Email",
      id: "Email",
      placeholder: "sarep@example.com",
    },
    {
      key: "phone",
      en: "Phone",
      id: "Telepon",
    },
    {
      key: "location",
      en: "Location",
      id: "Lokasi",
    },
    {
      key: "linkedin",
      en: "LinkedIn",
      id: "LinkedIn",
      placeholder: "linkedin.com/in/yourname",
    },
    {
      key: "website",
      en: "Website / portfolio",
      id: "Website / portofolio",
      placeholder: "yourwebsite.com",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7 space-y-2">
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
      <HiOutlineDocumentText size={19} />
    </div>

    <h1 className="text-xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 sm:text-2xl">
      {isId ? "Generator CV" : "CV Generator"}
    </h1>
  </div>

  <p className="max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
    {isId
      ? "Buat CV profesional dengan mudah, gratis, dan tanpa watermark. Semua data tetap tersimpan di browsermu."
      : "Create a professional CV with ease, completely free and without watermarks. Your data stays in your browser."}
  </p>
</header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            aria-pressed={
              resume.template === template.id
            }
            onClick={() =>
              changeTemplate(template.id)
            }
            className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors sm:p-4 ${
              resume.template === template.id
                ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/20"
                : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/40"
            }`}
          >
            <TemplateMiniature kind={template.id} />

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {template.name}

                {resume.template === template.id ? (
                  <HiOutlineCheckCircle className="text-teal-600 dark:text-teal-400" />
                ) : null}
              </span>

              <span className="mt-1 block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {isId
                  ? template.hintId
                  : template.hintEn}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePreview(false)}
          className={`${SECONDARY_BUTTON} ${
            mobilePreview
              ? ""
              : "border-teal-500 text-teal-600"
          }`}
        >
          {isId ? "Edit CV" : "Edit CV"}
        </button>

        <button
          type="button"
          onClick={() => setMobilePreview(true)}
          className={`${SECONDARY_BUTTON} ${
            mobilePreview
              ? "border-teal-500 text-teal-600"
              : ""
          }`}
        >
          <HiOutlineEye />
          {isId ? "Lihat PDF" : "View PDF"}
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section
          className={`min-w-0 space-y-6 ${
            mobilePreview ? "hidden lg:block" : ""
          }`}
        >
          <CollapsiblePane
            title={
              isId ? "Pengaturan CV" : "CV settings"
            }
            desc={
              isId
                ? "Ganti template tanpa menghapus informasi yang sudah diisi."
                : "Switch templates without losing your content."
            }
            defaultOpen
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                <span>
                  {isId
                    ? "Bahasa dokumen"
                    : "Document language"}
                </span>

                <select
                  className={INPUT}
                  value={resume.language}
                  onChange={(e) =>
                    setResume((old) => ({
                      ...old,
                      language: e.target.value as ResumeData["language"],
                    }))
                  }
                >
                  <option value="en">English</option>
                  <option value="id">
                    Bahasa Indonesia
                  </option>
                </select>
              </label>

              <label className="space-y-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                <span>
                  {isId
                    ? "Kerapatan halaman"
                    : "Page density"}
                </span>

                <select
                  className={INPUT}
                  value={resume.density}
                  onChange={(e) =>
                    setResume((old) => ({
                      ...old,
                      density: e.target.value as Density,
                    }))
                  }
                >
                  <option value="normal">
                    {isId ? "Normal" : "Normal"}
                  </option>
                  <option value="compact">
                    Compact
                  </option>
                </select>
              </label>
            </div>
          </CollapsiblePane>

          <CollapsiblePane
            title={
              isId
                ? "Informasi pribadi"
                : "Personal information"
            }
            desc={
              isId
                ? "Hanya isi informasi yang ingin ditampilkan pada CV."
                : "Only enter information you want to appear in your CV."
            }
            defaultOpen
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {fieldLabels.map((field) => (
                <Field
                  key={field.key}
                  label={
                    isId ? field.id : field.en
                  }
                  value={resume.profile[field.key]}
                  onChange={(value) =>
                    updateProfile(field.key, value)
                  }
                  placeholder={field.placeholder}
                />
              ))}
            </div>
          </CollapsiblePane>

          <CollapsiblePane
            title={
              isId
                ? "Susun isi CV"
                : "Arrange CV sections"
            }
            desc={
              isId
                ? "Tampilkan, sembunyikan, atau ubah urutan bagian. Bagian kosong otomatis tidak muncul pada PDF."
                : "Show, hide, and reorder sections. Empty sections are omitted from the PDF."
            }
          >
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <span
                    className={`min-w-0 flex-1 truncate text-xs font-medium ${
                      resume.hidden.includes(section)
                        ? "text-neutral-400 line-through"
                        : "text-neutral-700 dark:text-neutral-200"
                    }`}
                  >
                    {
                      SECTION_TITLES[resume.language][
                        section
                      ]
                    }
                  </span>

                  <button
                    type="button"
                    title={
                      isId ? "Naik" : "Move up"
                    }
                    aria-label={`Move ${section} up`}
                    disabled={index === 0}
                    onClick={() =>
                      swapSection(index, -1)
                    }
                    className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-20 dark:hover:bg-neutral-800"
                  >
                    <HiOutlineArrowUp size={15} />
                  </button>

                  <button
                    type="button"
                    title={
                      isId ? "Turun" : "Move down"
                    }
                    aria-label={`Move ${section} down`}
                    disabled={
                      index === sections.length - 1
                    }
                    onClick={() =>
                      swapSection(index, 1)
                    }
                    className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-20 dark:hover:bg-neutral-800"
                  >
                    <HiOutlineArrowDown size={15} />
                  </button>

                  <button
                    type="button"
                    title={
                      resume.hidden.includes(section)
                        ? "Show"
                        : "Hide"
                    }
                    aria-label={`Toggle ${section}`}
                    onClick={() =>
                      toggleSection(section)
                    }
                    className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {resume.hidden.includes(section) ? (
                      <HiOutlineEyeSlash size={15} />
                    ) : (
                      <HiOutlineEye size={15} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </CollapsiblePane>

          {ALL_SECTIONS.filter(
            (key) => !resume.hidden.includes(key)
          ).map((section) => (
            <CollapsiblePane
              key={section}
              title={
                SECTION_TITLES[resume.language][
                  section
                ]
              }
            >
              {renderSectionEditor(section)}
            </CollapsiblePane>
          ))}

          <CollapsiblePane
            title={
              isId
                ? "Draft dan privasi"
                : "Draft and privacy"
            }
            desc={
              isId
                ? "Draft otomatis disimpan hanya di browser ini. Unduh JSON agar bisa dilanjutkan di perangkat lain."
                : "Drafts auto-save only in this browser. Export JSON to continue on another device."
            }
          >
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={SECONDARY_BUTTON}
                onClick={exportDraft}
              >
                <HiOutlineDocumentArrowDown size={15} />
                Export JSON
              </button>

              <button
                type="button"
                className={SECONDARY_BUTTON}
                onClick={() =>
                  importRef.current?.click()
                }
              >
                <HiOutlineArrowUpTray size={15} />
                Import JSON
              </button>

              <button
                type="button"
                className={SECONDARY_BUTTON}
                onClick={() =>
                  setResume(createSampleResume())
                }
              >
                <HiOutlinePlus size={15} />
                {isId ? "Isi contoh" : "Load sample"}
              </button>

              <button
                type="button"
                className={`${SECONDARY_BUTTON} text-red-500 dark:text-red-400`}
                onClick={resetDraft}
              >
                <HiOutlineTrash size={15} />
                {isId ? "Hapus draft" : "Clear draft"}
              </button>

              <input
                ref={importRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => void importDraft(e)}
                aria-label="Import CV JSON"
              />
            </div>

            {message ? (
              <p
                className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400"
                role="status"
              >
                {message}
              </p>
            ) : null}

            <p className="mt-4 text-xs leading-relaxed text-neutral-400">
              {isId
                ? "Jangan gunakan perangkat bersama untuk menyimpan data pribadi yang sensitif."
                : "Avoid saving sensitive personal data on shared devices."}
            </p>
          </CollapsiblePane>
        </section>

        <section
          className={`min-w-0 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5 ${
            mobilePreview
              ? ""
              : "hidden lg:block"
          }`}
        >
          <PDFPanel
            resume={preview}
            isId={isId}
          />
        </section>
      </div>
    </main>
  );
}
