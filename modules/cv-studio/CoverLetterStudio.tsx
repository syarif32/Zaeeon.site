
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocale } from "next-intl";

import {
  HiOutlineArrowDownTray,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineSparkles,
} from "react-icons/hi2";

import {
  isResumeData,
  splitLines,
} from "./model";

import type {
  ResumeData,
} from "./model";

import type {
  CoverLetterOutput,
} from "./coverLetterExport";

type LetterForm = {
  name: string;
  email: string;
  phone: string;
  location: string;
  language: "id" | "en";
  date: string;
  company: string;
  position: string;
  recipient: string;
  reason: string;
  experience: string;
  contribution: string;
};

const CV_STORAGE =
  "zaeeon-cv-studio-draft-v1";

const LETTER_STORAGE =
  "zaeeon-cover-letter-draft-v1";

const INPUT =
  "w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-950/50 dark:text-neutral-100";

const BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";

const EMPTY: LetterForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  language: "id",
  date: "",
  company: "",
  position: "",
  recipient: "",
  reason: "",
  experience: "",
  contribution: "",
};

function localToday(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateLabel(
  date: string,
  language: "id" | "en"
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "";
  }

  const value = new Date(
    `${date}T12:00:00`
  );

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    language === "id" ? "id-ID" : "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(value);
}

function sentence(value: string): string {
  const cleaned = value
    .trim()
    .replace(/\s+/g, " ");

  if (!cleaned) return "";

  return /[.!?]$/.test(cleaned)
    ? cleaned
    : `${cleaned}.`;
}

// generator berbasis template
// hanya menyusun informasi yang diberikan pengguna
function composeLetter(
  form: LetterForm
): string {
  const position =
    form.position.trim() ||
    (form.language === "id"
      ? "[Nama posisi]"
      : "[Position]");

  const company = form.company.trim();

  if (form.language === "id") {
    const paragraphs = [
      [
        `Yth. ${
          form.recipient.trim() ||
          "Tim Rekrutmen"
        }`,
        company,
      ]
        .filter(Boolean)
        .join("\n"),

      "Dengan hormat,",

      `Melalui surat ini, saya mengajukan lamaran untuk posisi ${position}${
        company ? ` di ${company}` : ""
      }.`,
    ];

    if (form.reason.trim()) {
      paragraphs.push(
        `Saya tertarik melamar karena ${sentence(
          form.reason
        )}`
      );
    }

    if (form.experience.trim()) {
      paragraphs.push(
        `Pengalaman yang relevan dengan posisi ini adalah: ${sentence(
          form.experience
        )}`
      );
    }

    if (form.contribution.trim()) {
      paragraphs.push(
        `Kontribusi yang ingin saya berikan: ${sentence(
          form.contribution
        )}`
      );
    }

    paragraphs.push(
      "Saya berharap mendapat kesempatan untuk menjelaskan kualifikasi saya lebih lanjut. Terima kasih atas waktu dan pertimbangannya."
    );

    paragraphs.push(
      `Hormat saya,\n${form.name.trim()}`
    );

    return paragraphs.join("\n\n");
  }

  const paragraphs = [
    [
      `Dear ${
        form.recipient.trim() ||
        "Hiring Team"
      },`,
      company,
    ]
      .filter(Boolean)
      .join("\n"),

    `I am writing to apply for the ${position} position${
      company ? ` at ${company}` : ""
    }.`,
  ];

  if (form.reason.trim()) {
    paragraphs.push(
      `I am interested in this opportunity because ${sentence(
        form.reason
      )}`
    );
  }

  if (form.experience.trim()) {
    paragraphs.push(
      `Relevant experience I would like to highlight: ${sentence(
        form.experience
      )}`
    );
  }

  if (form.contribution.trim()) {
    paragraphs.push(
      `The contribution I hope to make: ${sentence(
        form.contribution
      )}`
    );
  }

  paragraphs.push(
    "I would welcome the opportunity to discuss my qualifications further. Thank you for your time and consideration."
  );

  paragraphs.push(
    `Sincerely,\n${form.name.trim()}`
  );

  return paragraphs.join("\n\n");
}

function safeFileName(value: string): string {
  return (
    value
      .replace(/[^a-z0-9 _-]/gi, "")
      .trim()
      .replace(/\s+/g, "-") || "Cover-Letter"
  );
}

export default function CoverLetterStudio() {
  const locale = useLocale();
  const isId = locale === "id";

  const [form, setForm] =
    useState<LetterForm>(EMPTY);

  const [letter, setLetter] = useState("");
  const [resume, setResume] =
    useState<ResumeData | null>(null);

  const [hydrated, setHydrated] =
    useState(false);

  const [busy, setBusy] =
    useState<"pdf" | "docx" | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // membaca CV dan draft cover letter dari browser
  useEffect(() => {
    let initial: LetterForm = {
      ...EMPTY,
      date: localToday(),
      language: locale === "en" ? "en" : "id",
    };

    try {
      const rawCV =
        localStorage.getItem(CV_STORAGE);

      if (rawCV) {
        const parsed: unknown =
          JSON.parse(rawCV);

        if (isResumeData(parsed)) {
          setResume(parsed);

          initial = {
            ...initial,
            name: parsed.profile.name,
            email: parsed.profile.email,
            phone: parsed.profile.phone,
            location: parsed.profile.location,
            language: parsed.language,
          };
        }
      }
    } catch {
      // jika CV tidak valid, form tetap bisa diisi manual
    }

    try {
      const saved =
        localStorage.getItem(LETTER_STORAGE);

      if (saved) {
        const parsed: unknown =
          JSON.parse(saved);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          const data = parsed as {
            form?: Record<string, unknown>;
            letter?: unknown;
          };

          const restored: Partial<LetterForm> = {};

          if (
            data.form &&
            typeof data.form === "object"
          ) {
  
for (const key of Object.keys(initial) as (keyof LetterForm)[]) {
  const value = data.form[key];

  // bahasa hanya boleh id atau en
  if (key === "language") {
    if (value === "id" || value === "en") {
      restored.language = value;
    }
    continue;
  }

  // field selain language menerima string biasa
  if (typeof value === "string") {
    restored[key] = value;
  }
}


          }

          initial = {
            ...initial,
            ...restored,
          };

          if (
            initial.language !== "id" &&
            initial.language !== "en"
          ) {
            initial.language = "id";
          }

          if (typeof data.letter === "string") {
            setLetter(data.letter);
          }
        }
      }
    } catch {
      // draft surat yang rusak tidak memengaruhi CV
    }

    setForm(initial);
    setHydrated(true);
  }, [locale]);

  // menyimpan draft secara lokal
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        LETTER_STORAGE,
        JSON.stringify({
          form,
          letter,
        })
      );
    } catch {
      setMessage(
        isId
          ? "Penyimpanan browser tidak tersedia."
          : "Browser storage is unavailable."
      );
    }
  }, [form, letter, hydrated, isId]);

  const update = (
    key: keyof LetterForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // mengambil contoh pengalaman nyata dari draft CV
  const cvExperience = useMemo(() => {
    if (!resume) return "";

    const experience = resume.experience
      .flatMap((item) =>
        splitLines(item.details)
      )
      .find(Boolean);

    const project = resume.projects
      .flatMap((item) =>
        splitLines(item.details)
      )
      .find(Boolean);

    return (
      experience ||
      project ||
      resume.summary.trim()
    );
  }, [resume]);

  const output: CoverLetterOutput = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    location: form.location.trim(),
    language: form.language,
    date: dateLabel(
      form.date,
      form.language
    ),
    position: form.position.trim(),
    body: letter,
  };

  function generate() {
    if (
      !form.name.trim() ||
      !form.position.trim()
    ) {
      setError(
        isId
          ? "Isi nama lengkap dan posisi yang dilamar terlebih dahulu."
          : "Enter your full name and the target position first."
      );
      return;
    }

    // saat disusun ulang, konfirmasi jika teks sudah diedit
    if (
      letter.trim() &&
      !window.confirm(
        isId
          ? "Susun ulang surat? Teks hasil edit sebelumnya akan diganti."
          : "Regenerate the letter? Your previous edits will be replaced."
      )
    ) {
      return;
    }

    setLetter(composeLetter(form));
    setError("");

    setMessage(
      isId
        ? "Draf surat siap. Silakan periksa dan edit sebelum mengunduh."
        : "Letter draft ready. Review and edit it before downloading."
    );
  }

  async function download(
    kind: "pdf" | "docx"
  ) {
    if (busy || !letter.trim()) return;

    setBusy(kind);
    setError("");

    try {
      // library ekspor hanya dimuat ketika dibutuhkan
      const {
        exportCoverLetterPDF,
        exportCoverLetterDOCX,
      } = await import("./coverLetterExport");

      const blob =
        kind === "pdf"
          ? await exportCoverLetterPDF(output)
          : await exportCoverLetterDOCX(output);

      const url = URL.createObjectURL(blob);

      const filename = safeFileName(
        `${form.name}-${form.position}`
      );

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        `${filename}-Cover-Letter.${kind}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(
        () => URL.revokeObjectURL(url),
        2000
      );
    } catch (cause) {
      console.error(
        "Cover letter export failed:",
        cause
      );

      setError(
        isId
          ? "Gagal membuat dokumen. Periksa kembali isinya."
          : "Could not export the document. Please review its content."
      );
    } finally {
      setBusy(null);
    }
  }

  // field pembantu agar UI tetap konsisten
  function Field({
    field,
    label,
    placeholder = "",
    multiline = false,
    rows = 3,
  }: {
    field: keyof LetterForm;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
  }) {
    const value = form[field];

    return (
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          {label}
        </span>

        {multiline ? (
          <textarea
            rows={rows}
            value={value}
            onChange={(event) =>
              update(field, event.target.value)
            }
            placeholder={placeholder}
            className={`${INPUT} resize-y leading-relaxed`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) =>
              update(field, event.target.value)
            }
            placeholder={placeholder}
            className={INPUT}
          />
        )}
      </label>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-8 sm:px-6 lg:px-8">
      {/* HEADER */}
      <header className="mb-7 space-y-3">
        <Link
          href={`/${locale}/tools/cv-generator`}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-teal-600"
        >
          <HiOutlineArrowLeft size={15} />
          {isId
            ? "Kembali ke CV Studio"
            : "Back to CV Studio"}
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-teal-600 dark:text-teal-400">
          <HiOutlineDocumentText size={17} />
          ZAEEON / TOOLS
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Cover Letter Generator
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {isId
            ? "Buat surat lamaran profesional berdasarkan informasi yang kamu berikan. Gratis, tanpa AI API, dan datanya tetap di browser."
            : "Create a professional cover letter using your own information. Free, no AI API, and your data stays in your browser."}
        </p>
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-6">
        {/* KOLOM KIRI: EDITOR */}
        <div className="min-w-0 space-y-4">
          {/* DATA DIRI */}
          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {isId
                  ? "Informasi pelamar"
                  : "Applicant details"}
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {resume
                  ? isId
                    ? "Data awal diambil dari draft CV Studio. Kamu tetap bisa mengubahnya."
                    : "Initial details are loaded from CV Studio and remain editable."
                  : isId
                  ? "Belum ditemukan draft CV. Silakan isi informasi secara manual."
                  : "No CV draft found. Enter your details manually."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                field="name"
                label={
                  isId
                    ? "Nama lengkap"
                    : "Full name"
                }
              />

              <Field
                field="email"
                label="Email"
              />

              <Field
                field="phone"
                label={
                  isId
                    ? "Telepon"
                    : "Phone"
                }
              />

              <Field
                field="location"
                label={
                  isId
                    ? "Domisili"
                    : "Location"
                }
              />
            </div>
          </section>

          {/* DETAIL LAMARAN */}
          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {isId
                  ? "Detail lamaran"
                  : "Application details"}
              </h2>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {isId
                  ? "Isi perusahaan dan posisi yang kamu tuju."
                  : "Enter the company and position you are applying for."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {isId
                    ? "Bahasa surat"
                    : "Letter language"}
                </span>

                <select
                  className={INPUT}
                  value={form.language}
                  onChange={(event) =>
                    update(
                      "language",
                      event.target.value
                    )
                  }
                >
                  <option value="id">
                    Bahasa Indonesia
                  </option>
                  <option value="en">
                    English
                  </option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {isId
                    ? "Tanggal surat"
                    : "Letter date"}
                </span>

                <input
                  type="date"
                  className={INPUT}
                  value={form.date}
                  onChange={(event) =>
                    update(
                      "date",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>

            <Field
              field="company"
              label={
                isId
                  ? "Nama perusahaan"
                  : "Company name"
              }
              placeholder="PT Example Indonesia"
            />

            <Field
              field="position"
              label={
                isId
                  ? "Posisi yang dilamar"
                  : "Target position"
              }
              placeholder="Frontend Developer"
            />

            <Field
              field="recipient"
              label={
                isId
                  ? "Penerima (opsional)"
                  : "Recipient (optional)"
              }
              placeholder={
                isId
                  ? "HRD / Tim Rekrutmen"
                  : "Hiring Manager"
              }
            />
          </section>

          {/* ALASAN DAN PENGALAMAN */}
          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {isId
                  ? "Isi surat"
                  : "Letter content"}
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {isId
                  ? "Isi dengan informasi nyata. Tidak perlu panjang; cukup beberapa kalimat yang relevan."
                  : "Use truthful information. A few relevant sentences are enough."}
              </p>
            </div>

            <Field
              field="reason"
              label={
                isId
                  ? "Mengapa tertarik melamar?"
                  : "Why are you interested?"
              }
              placeholder={
                isId
                  ? "Bidang pekerjaan sesuai dengan minat dan pengalaman saya"
                  : "The role aligns with my interests and experience"
              }
              multiline
              rows={2}
            />

            <div className="space-y-2">
              <Field
                field="experience"
                label={
                  isId
                    ? "Pengalaman yang ingin ditonjolkan"
                    : "Relevant experience to highlight"
                }
                placeholder={
                  isId
                    ? "Mengembangkan aplikasi menggunakan Next.js dan PostgreSQL"
                    : "Built applications using Next.js and PostgreSQL"
                }
                multiline
                rows={3}
              />

              {cvExperience && (
                <button
                  type="button"
                  className={BUTTON}
                  onClick={() => {
                    update(
                      "experience",
                      cvExperience
                    );

                    setMessage(
                      isId
                        ? "Poin dari CV dimasukkan. Periksa kembali sebelum digunakan."
                        : "CV content inserted. Review it before using."
                    );
                  }}
                >
                  <HiOutlineCheckCircle size={16} />
                  {isId
                    ? "Ambil contoh dari CV"
                    : "Use example from CV"}
                </button>
              )}
            </div>

            <Field
              field="contribution"
              label={
                isId
                  ? "Kontribusi yang ingin diberikan (opsional)"
                  : "Potential contribution (optional)"
              }
              placeholder={
                isId
                  ? "Membantu mengembangkan aplikasi yang mudah digunakan"
                  : "Help build accessible and maintainable applications"
              }
              multiline
              rows={2}
            />

            <button
              type="button"
              onClick={generate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              <HiOutlineSparkles size={18} />

              {letter.trim()
                ? isId
                  ? "Susun Ulang Surat"
                  : "Regenerate Letter"
                : isId
                ? "Susun Surat"
                : "Generate Letter"}
            </button>

            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {isId
                ? "Setelah surat dibuat, perubahan pada form tidak otomatis menimpa teks yang sudah kamu edit."
                : "Once generated, form changes will not automatically overwrite your edited letter."}
            </p>
          </section>

          {/* EDITOR SURAT HASIL GENERATE */}
          <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {isId
                ? "Edit hasil surat"
                : "Edit generated letter"}
            </h2>

            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {isId
                ? "Teks di bawah ini yang akan digunakan dalam PDF dan DOCX. Kamu bebas mengubah seluruh kalimatnya."
                : "This exact text is used in PDF and DOCX. You can edit every sentence."}
            </p>

            <textarea
              value={letter}
              onChange={(event) =>
                setLetter(event.target.value)
              }
              rows={16}
              className={`${INPUT} resize-y leading-relaxed`}
              placeholder={
                isId
                  ? "Klik Susun Surat untuk membuat draf..."
                  : "Click Generate Letter to create your draft..."
              }
            />

            {message && (
              <p
                role="status"
                className="text-xs text-teal-700 dark:text-teal-400"
              >
                {message}
              </p>
            )}
          </section>
        </div>

        {/* KOLOM KANAN: PREVIEW */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 lg:[scrollbar-width:thin]">
          <section className="min-w-0 space-y-4 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {isId
                    ? "Pratinjau surat"
                    : "Letter preview"}
                </h2>

                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  A4 · Portrait · PDF / DOCX
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    busy !== null ||
                    !letter.trim()
                  }
                  onClick={() =>
                    void download("pdf")
                  }
                  className={BUTTON}
                >
                  <HiOutlineArrowDownTray size={16} />
                  {busy === "pdf"
                    ? isId
                      ? "Menyiapkan..."
                      : "Preparing..."
                    : "PDF"}
                </button>

                <button
                  type="button"
                  disabled={
                    busy !== null ||
                    !letter.trim()
                  }
                  onClick={() =>
                    void download("docx")
                  }
                  className={BUTTON}
                >
                  <HiOutlineArrowDownTray size={16} />
                  {busy === "docx"
                    ? isId
                      ? "Menyiapkan..."
                      : "Preparing..."
                    : "DOCX"}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400"
              >
                {error}
              </p>
            )}

            {/* PREVIEW KERTAS A4 */}
            <div className="overflow-x-auto rounded-xl bg-neutral-200 p-2 dark:bg-neutral-950 sm:p-4">
              <article
                className="mx-auto min-h-[550px] w-full max-w-[680px] bg-white p-5 text-neutral-900 shadow-md sm:p-8"
                style={{
                  aspectRatio: "210 / 297",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div className="space-y-1">
                  <h3 className="break-words text-base font-bold sm:text-lg">
                    {form.name || (
                      isId
                        ? "Nama Lengkap"
                        : "Full Name"
                    )}
                  </h3>

                  <p className="break-words text-[10px] leading-relaxed text-neutral-600 sm:text-xs">
                    {[
                      form.email,
                      form.phone,
                      form.location,
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                </div>

                <div className="mt-7 space-y-4 text-[11px] leading-relaxed sm:text-[13px]">
                  <p>
                    {dateLabel(
                      form.date,
                      form.language
                    )}
                  </p>

                  <p className="font-semibold">
                    {form.language === "id"
                      ? `Perihal: Lamaran ${form.position || "[Posisi]"}`
                      : `Re: Application for ${form.position || "[Position]"}`}
                  </p>

                  {letter.trim() ? (
                    letter
                      .trim()
                      .split(/\n\s*\n/)
                      .map((paragraph, index) => (
                        <p
                          key={index}
                          className="whitespace-pre-line break-words"
                        >
                          {paragraph.trim()}
                        </p>
                      ))
                  ) : (
                    <p className="text-neutral-400">
                      {isId
                        ? "Surat lamaran akan muncul di sini setelah kamu menekan Susun Surat."
                        : "Your cover letter will appear here after you click Generate Letter."}
                    </p>
                  )}
                </div>
              </article>
            </div>

            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {isId
                ? "Pratinjau ini menggambarkan tata letak surat. Hasil PDF dan DOCX dapat memiliki sedikit perbedaan pembungkusan teks."
                : "This is a layout preview. PDF and DOCX may wrap text slightly differently."}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
