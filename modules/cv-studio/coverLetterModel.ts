export type LetterLanguage = "id" | "en";
export type LetterTemplate = "harvard" | "mit" | "yale" | "uconn";

export type LetterForm = {
  name: string;
  email: string;
  phone: string;
  location: string;
  language: LetterLanguage;
  date: string; // YYYY-MM-DD, tanggal lokal
  company: string;
  position: string;
  recipient: string;
  reason: string;
  experience: string;
  contribution: string;
};

export type LetterDraft = {
  version: 2;
  template: LetterTemplate;
  form: LetterForm;
  body: string;
  generatedFrom: string;
  editedBody: boolean;
};

export type LetterOutput = {
  template: LetterTemplate;
  form: LetterForm;
  body: string;
};

export type LetterPreset = {
  id: LetterTemplate;
  label: string;
  idHint: string;
  enHint: string;
  pdfFont: "Helvetica" | "Times-Roman";
  wordFont: "Arial" | "Times New Roman";
  marginPt: number;
  nameSize: number;
  bodySize: number;
  lineHeight: number;
  paragraphSpace: number;
  rule: boolean;
  centeredName: boolean;
  subject: boolean;
  headerSpace: number;
  accent: string;
};

// Nama gaya merujuk pendekatan penulisan, bukan template resmi universitas.
export const LETTER_PRESETS: Record<LetterTemplate, LetterPreset> = {
  harvard: {
    id: "harvard", label: "Harvard", idHint: "Modern, minimal, dan ringkas", enHint: "Modern, minimal, and concise",
    pdfFont: "Helvetica", wordFont: "Arial", marginPt: 70, nameSize: 14,
    bodySize: 10.5, lineHeight: 1.35, paragraphSpace: 12, rule: false,
    centeredName: false, subject: false, headerSpace: 22, accent: "#111827",
  },
  mit: {
    id: "mit", label: "MIT", idHint: "Tegas, rapi, dan terstruktur", enHint: "Clear, structured, and precise",
    pdfFont: "Helvetica", wordFont: "Arial", marginPt: 66, nameSize: 15,
    bodySize: 10.5, lineHeight: 1.35, paragraphSpace: 12, rule: true,
    centeredName: false, subject: true, headerSpace: 19, accent: "#164e63",
  },
  yale: {
    id: "yale", label: "Yale", idHint: "Klasik dengan tipografi serif", enHint: "Classic serif typography",
    pdfFont: "Times-Roman", wordFont: "Times New Roman", marginPt: 72, nameSize: 16,
    bodySize: 11, lineHeight: 1.35, paragraphSpace: 12, rule: false,
    centeredName: true, subject: false, headerSpace: 27, accent: "#111827",
  },
  uconn: {
    id: "uconn", label: "UConn", idHint: "Format surat bisnis tradisional", enHint: "Traditional business-letter style",
    pdfFont: "Times-Roman", wordFont: "Times New Roman", marginPt: 72, nameSize: 13,
    bodySize: 11, lineHeight: 1.3, paragraphSpace: 11, rule: false,
    centeredName: false, subject: true, headerSpace: 17, accent: "#111827",
  },
};

export const LETTER_STORAGE_KEY = "zaeeon-cover-letter-draft-v1";
export const CV_STORAGE_KEY = "zaeeon-cv-studio-draft-v1";

export function localISODate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function defaultLetterForm(language: LetterLanguage): LetterForm {
  return {
    name: "", email: "", phone: "", location: "", language,
    date: localISODate(), company: "", position: "", recipient: "",
    reason: "", experience: "", contribution: "",
  };
}

export function defaultLetterDraft(language: LetterLanguage): LetterDraft {
  return {
    version: 2, template: "harvard", form: defaultLetterForm(language),
    body: "", generatedFrom: "", editedBody: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toISODate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const idMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (idMatch) {
    return `${idMatch[3]}-${idMatch[2].padStart(2, "0")}-${idMatch[1].padStart(2, "0")}`;
  }
  return localISODate();
}

// Migrasi aman dari draft Cover Letter v1, tanpa menimpa teks yang pernah diedit.
export function readSavedLetter(value: unknown, language: LetterLanguage): LetterDraft | null {
  if (!isRecord(value) || !isRecord(value.form)) return null;
  const base = defaultLetterDraft(language);
  const savedForm = value.form;
  const keys = [
    "name", "email", "phone", "location", "date", "company", "position",
    "recipient", "reason", "experience", "contribution",
  ] as const;
  for (const key of keys) {
    const candidate = savedForm[key];
    if (typeof candidate === "string") base.form[key] = candidate;
  }
  base.form.language = savedForm.language === "id" || savedForm.language === "en"
    ? savedForm.language
    : language;
  base.form.date = toISODate(base.form.date);
  const template = value.template;
  if (typeof template === "string" && template in LETTER_PRESETS) {
    base.template = template as LetterTemplate;
  }
  if (typeof value.body === "string") base.body = value.body;
  if (typeof value.generatedFrom === "string") base.generatedFrom = value.generatedFrom;
  base.editedBody = typeof value.editedBody === "boolean" ? value.editedBody : Boolean(base.body);
  return base;
}

export function formatLetterDate(date: string, language: LetterLanguage): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return date;
  }
  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(parsed);
}

export function paragraphLines(body: string): string[] {
  return body.replace(/\r\n?/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function sentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

// Teks asli pengguna tidak diterjemahkan dan tidak direkayasa menjadi pencapaian baru.
export function composeLetter(form: LetterForm): string {
  const position = form.position.trim();
  const company = form.company.trim();
  if (form.language === "id") {
    const opening = position
      ? `Saya ingin mengajukan lamaran untuk posisi ${position}${company ? ` di ${company}` : ""}.`
      : `Saya ingin mengajukan lamaran kerja${company ? ` di ${company}` : ""}.`;
    const intro = [opening, sentence(form.reason)].filter(Boolean).join(" ");
    const relevant = form.experience.trim()
      ? `Berikut pengalaman yang menurut saya relevan dengan posisi tersebut. ${sentence(form.experience)}`
      : "";
    const contribution = form.contribution.trim()
      ? `Kontribusi yang ingin saya berikan adalah sebagai berikut. ${sentence(form.contribution)}`
      : "";
    const closing = "Terima kasih atas waktu dan pertimbangannya. Saya berharap mendapat kesempatan untuk membahas kesesuaian pengalaman dan kemampuan saya lebih lanjut.";
    return [intro, relevant, contribution, closing].filter(Boolean).join("\n\n");
  }
  const opening = position
    ? `I am writing to apply for the ${position} position${company ? ` at ${company}` : ""}.`
    : `I am writing to express my interest in opportunities${company ? ` at ${company}` : ""}.`;
  const intro = [opening, sentence(form.reason)].filter(Boolean).join(" ");
  const relevant = form.experience.trim()
    ? `My relevant experience includes the following. ${sentence(form.experience)}`
    : "";
  const contribution = form.contribution.trim()
    ? `I hope to contribute in the following ways. ${sentence(form.contribution)}`
    : "";
  const closing = "Thank you for your time and consideration. I would welcome the opportunity to discuss how my experience may be relevant to this role.";
  return [intro, relevant, contribution, closing].filter(Boolean).join("\n\n");
}

// Jika data tujuan berubah, beritahukan bahwa body hasil susun sebelumnya sudah usang.
export function contentSignature(form: LetterForm): string {
  return JSON.stringify([
    form.language, form.position, form.company, form.reason, form.experience, form.contribution,
  ]);
}
