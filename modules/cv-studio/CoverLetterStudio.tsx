"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiOutlineSparkles,
} from "react-icons/hi2";
import {
  CV_STORAGE_KEY,
  LETTER_PRESETS,
  LETTER_STORAGE_KEY,
  composeLetter,
  contentSignature,
  defaultLetterDraft,
  paragraphLines,
  readSavedLetter,
} from "./coverLetterModel";
import type {
  LetterDraft,
  LetterForm,
  LetterLanguage,
  LetterOutput,
  LetterTemplate,
} from "./coverLetterModel";

const CoverLetterPreview = dynamic(() => import("./CoverLetterPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-neutral-200 text-sm text-neutral-500 dark:border-neutral-800">
      Loading PDF preview...
    </div>
  ),
});

const INPUT = "block w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-950/50 dark:text-neutral-100 dark:placeholder:text-neutral-500";
const SECONDARY = "inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";
const PRIMARY = "inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300";

// Komponen field wajib di tingkat modul: tidak remount dan tidak kehilangan fokus per karakter.
function Field({
  label,
  value,
  onChange,
  placeholder,
  helper,
  type = "text",
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  type?: "text" | "email" | "tel" | "date";
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`${INPUT} resize-y leading-relaxed`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          placeholder={placeholder}
          className={INPUT}
        />
      )}
      {helper ? <span className="block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{helper}</span> : null}
    </label>
  );
}

// Mengikuti pola CollapsiblePane di CV Studio. Komponen berada di module scope,
// sehingga input tidak kehilangan fokus saat pengguna mengetik.
function Section({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <details open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)} className="group min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-teal-500 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</span>
          {description ? <span className="mt-1 block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{description}</span> : null}
        </span>
        <HiOutlineChevronDown aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180 dark:text-neutral-400" />
      </summary>
      <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">{children}</div>
    </details>
  );
}

function TemplateMiniature({ template }: { template: LetterTemplate }) {
  const p = LETTER_PRESETS[template];
  return (
    <div aria-hidden="true" className="flex h-[92px] w-[68px] shrink-0 flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white px-[9px] py-[11px] shadow-sm">
      <div className={`h-[5px] w-8 bg-neutral-800 ${p.centeredName ? "mx-auto" : ""}`} />
      <div className={`mt-1 h-[2px] w-11 bg-neutral-300 ${p.centeredName ? "mx-auto" : ""}`} />
      {p.rule ? <div className="mt-2 h-px w-full bg-teal-700" /> : null}
      <div className="mt-3 h-[2px] w-7 bg-neutral-500" />
      <div className="mt-3 h-[2px] w-8 bg-neutral-500" />
      <div className="mt-2 h-[2px] w-11 bg-neutral-300" />
      <div className="mt-1 h-[2px] w-full bg-neutral-300" />
      <div className="mt-1 h-[2px] w-10 bg-neutral-300" />
      <div className="mt-auto h-[2px] w-6 bg-neutral-400" />
    </div>
  );
}

type CVExample = { id: string; label: string; text: string };
type CVSnapshot = {
  profile: Pick<LetterForm, "name" | "email" | "phone" | "location">;
  examples: CVExample[];
};

function asRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Membaca bagian yang diketahui dari draft CV Studio. Tidak mengimpor sample baru.
function readCVSnapshot(): CVSnapshot | null {
  try {
    const raw = window.localStorage.getItem(CV_STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!asRecord(value) || !asRecord(value.profile)) return null;
    const profile = value.profile;
    const str = (v: unknown) => typeof v === "string" ? v : "";
    const examples: CVExample[] = [];

    if (Array.isArray(value.experience) && !(
      Array.isArray(value.hidden) && value.hidden.includes("experience")
    )) {
      for (const item of value.experience) {
        if (!asRecord(item)) continue;
        const role = str(item.role).trim();
        const organization = str(item.organization).trim();
        const details = str(item.details).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        for (let i = 0; i < details.length; i++) {
          examples.push({
            id: `exp-${examples.length}`,
            label: [role, organization].filter(Boolean).join(" · ") || "Experience",
            text: details[i].replace(/^[•*-]\s*/, ""),
          });
        }
      }
    }

    if (Array.isArray(value.projects) && !(
      Array.isArray(value.hidden) && value.hidden.includes("projects")
    )) {
      for (const item of value.projects) {
        if (!asRecord(item)) continue;
        const name = str(item.name).trim();
        const details = str(item.details).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        for (let i = 0; i < details.length; i++) {
          examples.push({
            id: `project-${examples.length}`,
            label: name || "Project",
            text: details[i].replace(/^[•*-]\s*/, ""),
          });
        }
      }
    }
    return {
      profile: {
        name: str(profile.name),
        email: str(profile.email),
        phone: str(profile.phone),
        location: str(profile.location),
      },
      examples: examples.slice(0, 40),
    };
  } catch {
    return null;
  }
}

function initialLanguage(locale: string): LetterLanguage {
  return locale === "id" ? "id" : "en";
}

export default function CoverLetterStudio() {
  const locale = useLocale();
  const isId = locale === "id";
  const language = initialLanguage(locale);
  const [draft, setDraft] = useState<LetterDraft>(() => defaultLetterDraft(language));
  const [hydrated, setHydrated] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [cvExamples, setCvExamples] = useState<CVExample[]>([]);
  const [cvFound, setCvFound] = useState(false);
  const [status, setStatus] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cv = readCVSnapshot();
    if (cv) {
      setCvFound(true);
      setCvExamples(cv.examples);
    }
    try {
      const savedRaw = window.localStorage.getItem(LETTER_STORAGE_KEY);
      const stored = savedRaw ? readSavedLetter(JSON.parse(savedRaw) as unknown, language) : null;
      if (stored) {
        setDraft(stored); // draft yang diedit selalu menang atas data CV
      } else {
        const base = defaultLetterDraft(language);
        setDraft(cv ? { ...base, form: { ...base.form, ...cv.profile } } : base);
      }
    } catch {
      const base = defaultLetterDraft(language);
      setDraft(cv ? { ...base, form: { ...base.form, ...cv.profile } } : base);
    } finally {
      setHydrated(true);
    }
  }, [language]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LETTER_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      setStatus(isId
        ? "Browser tidak dapat menyimpan draft. Salin teks surat sebagai cadangan."
        : "Browser storage is unavailable. Copy your letter as a backup.");
    }
  }, [draft, hydrated, isId]);

  const effectiveBody = draft.editedBody ? draft.body : composeLetter(draft.form);
  const letter = useMemo<LetterOutput>(() => ({
    template: draft.template,
    form: draft.form,
    body: effectiveBody,
  }), [draft.template, draft.form, effectiveBody]);
  const [previewLetter, setPreviewLetter] = useState<LetterOutput>(letter);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => setPreviewLetter(letter), 500);
    return () => window.clearTimeout(timer);
  }, [letter, hydrated]);

  function updateForm<K extends keyof LetterForm>(key: K, value: LetterForm[K]) {
    setDraft((old) => ({ ...old, form: { ...old.form, [key]: value } }));
    setStatus("");
  }

  function updateTemplate(template: LetterTemplate) {
    setDraft((old) => ({ ...old, template }));
    // Seperti CV Studio, perpindahan template tidak menunggu debounce input.
    setPreviewLetter((old) => ({ ...old, template }));
  }

  function exportDraft() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "zaeeon-cover-letter-draft.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    setStatus(isId ? "Cadangan surat berhasil diunduh." : "Letter backup downloaded.");
  }

  async function importDraft(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (file.size > 150_000) {
      setStatus(isId ? "File terlalu besar (maksimal 150 KB)." : "File too large (150 KB maximum).");
      return;
    }
    if (!window.confirm(isId
      ? "Impor draft ini dan ganti surat yang sedang dibuka? Sebaiknya unduh cadangan terlebih dahulu."
      : "Import this draft and replace your current letter? Consider exporting a backup first.")) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      const parsed = readSavedLetter(data, language);
      if (!parsed) throw new Error("Invalid cover letter draft");
      setDraft(parsed);
      setStatus(isId ? "Draft surat berhasil diimpor." : "Letter draft imported.");
    } catch {
      setStatus(isId ? "JSON tidak cocok dengan draft Cover Letter Zaeeon." : "This JSON is not a valid Zaeeon Cover Letter draft.");
    }
  }

  function resetDraft() {
    if (!window.confirm(isId
      ? "Kosongkan seluruh data surat tersimpan di browser ini? Tindakan ini tidak bisa dibatalkan."
      : "Clear all saved letter data in this browser? This cannot be undone.")) return;
    setDraft(defaultLetterDraft(language));
    setStatus(isId ? "Draft surat dikosongkan." : "Letter draft cleared.");
  }

  function importContact() {
    const cv = readCVSnapshot();
    if (!cv) {
      setStatus(isId ? "Draft CV Studio belum ditemukan di browser ini." : "No CV Studio draft was found in this browser.");
      return;
    }
    const hasExisting = [draft.form.name, draft.form.email, draft.form.phone, draft.form.location].some((v) => v.trim());
    if (hasExisting && !window.confirm(isId
      ? "Ganti nama dan kontak surat dengan data dari CV Studio? Isi surat tidak akan dihapus."
      : "Replace this letter's contact details with CV Studio details? Your letter content will be preserved.")) return;
    setCvFound(true);
    setCvExamples(cv.examples);
    setDraft((old) => ({ ...old, form: { ...old.form, ...cv.profile } }));
    setStatus(isId ? "Nama dan kontak diperbarui dari CV Studio." : "Contact details updated from CV Studio.");
  }

  function useCVExample(example: CVExample) {
    if (draft.form.experience.trim() && !window.confirm(isId
      ? "Ganti pengalaman yang sudah kamu tulis dengan poin dari CV?"
      : "Replace the experience you wrote with this CV detail?")) return;
    updateForm("experience", example.text);
    setStatus(isId ? "Poin CV disalin. Periksa relevansinya sebelum digunakan." : "CV detail copied. Review its relevance before using it.");
  }

  function regenerate() {
    if (draft.editedBody && !window.confirm(isId
      ? "Susun ulang surat? Perubahan manual pada teks surat akan diganti."
      : "Regenerate the letter? Your manual edits to the letter body will be replaced.")) return;
    setDraft((old) => ({
      ...old,
      body: composeLetter(old.form),
      editedBody: false,
      generatedFrom: contentSignature(old.form),
    }));
    setStatus(isId ? "Surat disusun menggunakan jawaban terbaru." : "Letter regenerated from your latest answers.");
  }

  function editBody(value: string) {
    setDraft((old) => ({
      ...old,
      body: value,
      editedBody: true,
      generatedFrom: old.editedBody ? old.generatedFrom : contentSignature(old.form),
    }));
  }

  const form = draft.form;
  const missing: string[] = [];
  if (!form.name.trim()) missing.push(isId ? "nama" : "name");
  if (!form.company.trim()) missing.push(isId ? "perusahaan" : "company");
  if (!form.position.trim()) missing.push(isId ? "posisi" : "position");
  // Unduhan dinonaktifkan selama pratinjau belum sesuai data editor.
  const previewPending = previewLetter.template !== letter.template ||
    previewLetter.body !== letter.body || previewLetter.form !== letter.form;
  const hasStaleManualText = draft.editedBody &&
    draft.generatedFrom !== contentSignature(form);
  const sameLanguageNote = isId
    ? "Teks yang kamu tulis tidak diterjemahkan otomatis. Sesuaikan jawaban dengan bahasa surat yang dipilih."
    : "Your answers are not automatically translated. Write them in your selected letter language.";

  return (
    <main className="mx-auto mt-24 w-full max-w-7xl min-w-0 px-4 pb-20 pt-8 sm:px-6 lg:mt-0 lg:px-8">
      <header className="mb-7 space-y-2">
        <Link href={`/${locale}/tools/cv-generator`} className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
          <HiOutlineArrowLeft className="h-4 w-4" />
          {isId ? "Kembali ke CV Generator" : "Back to CV Generator"}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
            <HiOutlineDocumentText size={19} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 sm:text-2xl">
            {isId ? "Generator Surat Lamaran" : "Cover Letter Generator"}
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {isId
            ? "Buat dan edit surat lamaran dengan pilihan gaya profesional. Gunakan data CV Studio, lihat PDF asli, lalu unduh PDF atau DOCX. Tanpa AI API; draft tersimpan di browser."
            : "Create and edit a cover letter with professional layouts. Reuse CV Studio data, preview the real PDF, and export PDF or DOCX. No AI API; drafts stay in your browser."}
        </p>
      </header>

      <div className="mb-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{isId ? "Pilih gaya surat" : "Choose a letter layout"}</h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {isId ? "Mengubah gaya tidak menghapus isi surat." : "Changing layout never removes your letter content."}
            </p>
          </div>
          <span className="text-xs text-neutral-400">A4 · Portrait</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(Object.keys(LETTER_PRESETS) as LetterTemplate[]).map((key) => {
            const preset = LETTER_PRESETS[key];
            const selected = draft.template === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => updateTemplate(key)}
                className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors sm:p-4 ${selected
                  ? "border-teal-600 bg-teal-50/70 ring-1 ring-teal-600/20 dark:border-teal-500 dark:bg-teal-950/20"
                  : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-neutral-600"
                }`}
              >
                <TemplateMiniature template={key} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {preset.label}
                    {selected ? <HiOutlineCheckCircle className="h-4 w-4 shrink-0 text-teal-600" /> : null}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{isId ? preset.idHint : preset.enHint}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {isId
            ? "Nama gaya terinspirasi panduan karier universitas; bukan template resmi atau produk yang berafiliasi dengan universitas tersebut."
            : "Layout names are inspired by university career guidance; these are not official or affiliated university templates."}
        </p>
      </div>

      {/* Backup JSON sengaja bersifat lokal, mengikuti pola CV Generator. */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {isId ? "Kelola draft surat" : "Manage letter draft"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {isId ? "Tersimpan otomatis di browser. Simpan cadangan JSON untuk digunakan kembali." : "Automatically saved in your browser. Keep a JSON backup for later."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={SECONDARY} onClick={exportDraft}>
            <HiOutlineArrowDownTray className="h-4 w-4" /> {isId ? "Export JSON" : "Export JSON"}
          </button>
          <button type="button" className={SECONDARY} onClick={() => importRef.current?.click()}>
            <HiOutlineArrowUpTray className="h-4 w-4" /> {isId ? "Import JSON" : "Import JSON"}
          </button>
          <button type="button" className={`${SECONDARY} text-red-600 dark:text-red-400`} onClick={resetDraft}>
            <HiOutlineTrash className="h-4 w-4" /> {isId ? "Reset" : "Reset"}
          </button>
          <input type="file" ref={importRef} accept="application/json,.json" onChange={(event) => void importDraft(event)} className="hidden" aria-label={isId ? "Pilih file draft JSON" : "Choose JSON draft file"} />
        </div>
      </div>
      {status ? <p role="status" aria-live="polite" className="mb-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{status}</p> : null}

      <div className="mb-5 grid grid-cols-2 gap-2 lg:hidden" role="tablist" aria-label={isId ? "Mode tampilan" : "View mode"}>
        <button type="button" role="tab" aria-selected={!mobilePreview} onClick={() => setMobilePreview(false)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium ${!mobilePreview ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "border border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"}`}>
          <HiOutlinePencilSquare className="h-4 w-4" /> {isId ? "Edit Surat" : "Edit Letter"}
        </button>
        <button type="button" role="tab" aria-selected={mobilePreview} onClick={() => setMobilePreview(true)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium ${mobilePreview ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "border border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"}`}>
          <HiOutlineEye className="h-4 w-4" /> {isId ? "Lihat PDF" : "View PDF"}
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-6">
        <div className={`min-w-0 space-y-5 ${mobilePreview ? "hidden lg:block" : ""}`}>
          <Section
            title={isId ? "1. Tujuan lamaran" : "1. Application details"}
            description={isId ? "Isi posisi dan perusahaan yang benar. Tidak perlu menuliskan alamat perusahaan jika tidak diketahui." : "Enter the correct role and company. A physical address is optional."}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={isId ? "Posisi yang dilamar" : "Job title"} value={form.position} onChange={(v) => updateForm("position", v)} placeholder="Frontend Developer" />
                <Field label={isId ? "Nama perusahaan" : "Company"} value={form.company} onChange={(v) => updateForm("company", v)} placeholder="PT Contoh Digital" />
              </div>
              <Field label={isId ? "Penerima (opsional)" : "Recipient (optional)"} value={form.recipient} onChange={(v) => updateForm("recipient", v)} placeholder={isId ? "Tim Rekrutmen / nama perekrut" : "Hiring Manager / recruiter's name"} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field type="date" label={isId ? "Tanggal surat" : "Letter date"} value={form.date} onChange={(v) => updateForm("date", v)} />
                <label className="block space-y-1.5">
                  <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">{isId ? "Bahasa surat" : "Letter language"}</span>
                  <select value={form.language} onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm("language", e.target.value as LetterLanguage)} className={INPUT}>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </label>
              </div>
            </div>
          </Section>

          <Section
            title={isId ? "2. Informasi pelamar" : "2. Applicant information"}
            description={isId ? "Nama dan kontak otomatis diambil dari draft CV Studio saat pertama dibuka. Kamu tetap bisa mengeditnya." : "Name and contact details are prefilled from CV Studio on first use. You can edit them anytime."}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                {cvFound ? <HiOutlineCheckCircle className="h-4 w-4 text-teal-600" /> : <HiOutlineInformationCircle className="h-4 w-4" />}
                {cvFound ? (isId ? "Draft CV ditemukan" : "CV draft found") : (isId ? "Belum ada draft CV lokal" : "No local CV draft")}
              </span>
              <button type="button" className={SECONDARY} onClick={importContact}>
                <HiOutlineArrowPath className="h-4 w-4" />
                {isId ? "Sinkronkan dari CV" : "Sync from CV"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={isId ? "Nama lengkap" : "Full name"} value={form.name} onChange={(v) => updateForm("name", v)} placeholder={isId ? "Nama kamu" : "Your name"} />
              <Field type="email" label="Email" value={form.email} onChange={(v) => updateForm("email", v)} placeholder="name@example.com" />
              <Field type="tel" label={isId ? "Telepon" : "Phone"} value={form.phone} onChange={(v) => updateForm("phone", v)} placeholder="+62 ..." />
              <Field label={isId ? "Domisili" : "Location"} value={form.location} onChange={(v) => updateForm("location", v)} placeholder="Semarang, Indonesia" />
            </div>
          </Section>

          <Section
            title={isId ? "3. Cerita dan pengalaman" : "3. Motivation and experience"}
            description={isId ? "Gunakan fakta dari pengalamanmu sendiri. Tulis secukupnya, tidak perlu mengarang pencapaian." : "Use facts from your actual experience. Keep it focused; do not invent achievements."}
          >
            <div className="space-y-4">
              <Field multiline rows={3} label={isId ? "Mengapa tertarik pada posisi/perusahaan ini?" : "Why this role and company?"} value={form.reason} onChange={(v) => updateForm("reason", v)} placeholder={isId ? "Alasan spesifikmu melamar..." : "Your specific reason for applying..."} />
              <Field multiline rows={4} label={isId ? "Pengalaman paling relevan" : "Most relevant experience"} value={form.experience} onChange={(v) => updateForm("experience", v)} placeholder={isId ? "Contoh pekerjaan, proyek, atau pencapaian nyata..." : "Actual work, projects, or achievements..."} />
              {cvExamples.length > 0 ? (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <p className="mb-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {isId ? "Ambil satu poin dari CV (opsional)" : "Use an existing CV detail (optional)"}
                  </p>
                  <div className="max-h-44 space-y-2 overflow-y-auto">
                    {cvExamples.slice(0, 12).map((example) => (
                      <button key={example.id} type="button" onClick={() => useCVExample(example)} className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left transition hover:border-teal-400 dark:border-neutral-700 dark:bg-neutral-900">
                        <span className="block truncate text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{example.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-neutral-700 dark:text-neutral-200">{example.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <Field multiline rows={3} label={isId ? "Kontribusi yang ingin diberikan (opsional)" : "What could you contribute? (optional)"} value={form.contribution} onChange={(v) => updateForm("contribution", v)} placeholder={isId ? "Kemampuan yang dapat kamu terapkan..." : "Skills you could contribute..."} />
              <p className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                <HiOutlineInformationCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {sameLanguageNote}
              </p>
              <button type="button" className={PRIMARY} onClick={regenerate}>
                <HiOutlineSparkles className="h-4 w-4" />
                {isId ? "Susun Ulang Surat" : "Regenerate Letter"}
              </button>
            </div>
          </Section>

          <Section
            title={isId ? "4. Edit isi surat" : "4. Edit letter body"}
            description={isId ? "Hasil dapat diedit sepenuhnya. Perubahan manual tidak akan hilang saat kamu mengganti gaya surat." : "Edit every sentence freely. Your edits remain intact when switching layouts."}
          >
            <div className="space-y-3">
              {hasStaleManualText ? (
                <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300">
                  {isId ? "Kamu mengubah beberapa detail lamaran setelah mengedit isi surat. Pastikan nama perusahaan, posisi, atau bahasanya juga sudah sesuai di teks." : "You changed application details after editing the letter. Check that the company, position, and language in your text still match."}
                </p>
              ) : null}
              <Field multiline rows={14} label={isId ? "Paragraf utama surat" : "Letter paragraphs"} value={effectiveBody} onChange={editBody} helper={isId ? "Pisahkan paragraf dengan satu baris kosong. Salam pembuka dan tanda tangan ditambahkan otomatis dalam PDF/DOCX." : "Separate paragraphs with a blank line. Salutation and sign-off are added in PDF/DOCX."} />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{paragraphLines(effectiveBody).length} {isId ? "paragraf" : "paragraphs"}</span>
                <span>{effectiveBody.trim().split(/\s+/).filter(Boolean).length} {isId ? "kata" : "words"}</span>
              </div>
              {draft.editedBody ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400">
                  <HiOutlineCheckCircle className="h-4 w-4" />
                  {isId ? "Perubahan manual tersimpan di browser" : "Manual edits saved in browser"}
                </span>
              ) : null}
            </div>
          </Section>
        </div>

        <div className={`min-w-0 ${!mobilePreview ? "hidden lg:block" : ""}`}>
          <div className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1">
            {missing.length ? (
              <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300">
                {isId ? `Periksa sebelum melamar: ${missing.join(", ")} belum diisi. Unduhan tetap tersedia.` : `Check before applying: missing ${missing.join(", ")}. Downloads remain available.`}
              </p>
            ) : null}
            {hydrated ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-4">
                <CoverLetterPreview letter={previewLetter} isId={isId} isUpdating={previewPending} />
              </div>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-neutral-200 text-sm text-neutral-500 dark:border-neutral-800">
                {isId ? "Memuat draft surat..." : "Loading letter draft..."}
              </div>
            )}
            <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              <HiOutlineDocumentText className="mt-0.5 h-4 w-4 shrink-0" />
              {isId ? "Idealnya surat lamaran satu halaman. Pilih gaya yang cocok, lalu lihat hasil akhir sebelum mengirim." : "A one-page cover letter is generally preferred. Choose a suitable layout and review the document before sending."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
