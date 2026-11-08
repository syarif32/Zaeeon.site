"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import {
  HiOutlineArrowDownTray,
  HiOutlineEye,
  HiOutlineXMark,
} from "react-icons/hi2";

import ResumeDocument from "./ResumeDocument";
import { hasSectionContent, SECTION_TITLES, splitLines } from "./model";
import type { ResumeData, SectionKey } from "./model";

type Props = { resume: ResumeData; isId: boolean };

// Pratinjau HTML yang dapat dibaca di layar HP tanpa memaksa PDF viewer native terbuka.
function MobileResumePreview({ resume, isId }: Props) {
  const { profile } = resume;
  const contacts = [profile.email, profile.phone, profile.location, profile.linkedin, profile.website].filter(
    (value) => value.trim().length > 0
  );
  const isClassic = resume.template === "classic";

  function contentFor(section: SectionKey) {
    switch (section) {
      case "summary":
        return <p className="whitespace-pre-line leading-relaxed">{resume.summary}</p>;
      case "skills":
        return (
          <div className="space-y-1.5">
            {resume.skills.filter((item) => item.category.trim() || item.values.trim()).map((item) => (
              <p key={item.id}><strong>{item.category ? `${item.category}: ` : ""}</strong>{item.values}</p>
            ))}
          </div>
        );
      case "experience":
        return (
          <div className="space-y-3">
            {resume.experience.filter((item) => item.role.trim() || item.organization.trim() || item.details.trim()).map((item) => (
              <div key={item.id}>
                <p className="font-semibold">{[item.organization, item.role].filter(Boolean).join(" | ")}</p>
                {item.period && <p className="text-neutral-600">{item.period}</p>}
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {splitLines(item.details).map((line, index) => <li key={index}>{line}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
      case "education":
        return (
          <div className="space-y-3">
            {resume.education.filter((item) => item.institution.trim() || item.degree.trim()).map((item) => (
              <div key={item.id}>
                <p><strong>{item.institution}</strong>{item.degree ? ` | ${item.degree}` : ""}</p>
                {item.period && <p className="text-neutral-600">{item.period}</p>}
                {item.details && <p className="mt-0.5 whitespace-pre-line">{item.details}</p>}
              </div>
            ))}
          </div>
        );
      case "projects":
        return (
          <div className="space-y-3">
            {resume.projects.filter((item) => item.name.trim() || item.details.trim()).map((item) => (
              <div key={item.id}>
                <p className="font-semibold">{item.name}{item.period ? ` | ${item.period}` : ""}</p>
                <p className="whitespace-pre-line">{item.details}</p>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <ul className="list-disc space-y-1 pl-4">
            {splitLines(resume[section]).map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        );
    }
  }

  return (
    <div className="mx-auto min-h-full w-full max-w-[680px] bg-white px-5 py-7 text-[11px] leading-[1.5] text-neutral-900 shadow-xl sm:px-10">
      <div className={isClassic ? "text-left font-serif" : "text-center font-sans"}>
        <h3 className={`${isClassic ? "text-[19px] font-normal text-slate-800" : "text-base font-bold uppercase"} break-words tracking-wide`}>
          {profile.name.trim() || "Muhammad Najwa Syarif"}
        </h3>
        {profile.headline && <p className="mt-1 text-neutral-600">{profile.headline}</p>}
        {contacts.length > 0 && <p className="mt-1 break-words text-[10px] text-neutral-700">{contacts.join(" | ")}</p>}
      </div>
      <div className={`mt-6 space-y-4 ${isClassic ? "font-serif" : "font-sans"}`}>
        {resume.order.filter((section) => !resume.hidden.includes(section) && hasSectionContent(resume, section)).map((section) => (
          <section key={section}>
            <h4 className={`mb-1.5 border-b pb-1 font-bold ${isClassic ? "border-slate-400 text-[12px] text-slate-800" : "border-neutral-500 text-[11px] uppercase tracking-wide"}`}>
              {SECTION_TITLES[resume.language][section]}
            </h4>
            {contentFor(section)}
          </section>
        ))}
      </div>
      <p className="mt-7 border-t border-neutral-200 pt-3 text-center text-[10px] text-neutral-500">
        {isId ? "Pratinjau sederhana untuk HP. Unduh PDF untuk melihat tata letak final." : "Simplified mobile preview. Download the PDF for the final layout."}
      </p>
    </div>
  );
}

export default function PDFPanel({ resume, isId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [canEmbedPdf, setCanEmbedPdf] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const pdfDocument = useMemo(() => <ResumeDocument resume={resume} />, [resume]);
  const safeName = (resume.profile.name.trim() || "CV")
    .replace(/[^a-z0-9 _-]/gi, "")
    .trim()
    .replace(/\s+/g, "-") || "CV";
  const fileName = `${safeName}-${resume.template}.pdf`;
  const displayName = resume.profile.name.trim() || "Muhammad Najwa Syarif";

  useEffect(() => {
    if (!isOpen) return;

    const media = window.matchMedia("(min-width: 640px)");
    const updateEmbed = () => setCanEmbedPdf(media.matches);
    updateEmbed();
    media.addEventListener("change", updateEmbed);

    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && (window.document.activeElement === first || !dialogRef.current?.contains(window.document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (window.document.activeElement === last || !dialogRef.current?.contains(window.document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", updateEmbed);
      window.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <div className="min-w-0 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {isId ? "Pratinjau dokumen" : "Document preview"}
        </h2>
        <p className="mt-1 text-xs capitalize text-neutral-500 dark:text-neutral-400">A4 · PDF · {resume.template}</p>
      </div>

      <div className="flex min-w-0 items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950/40">
        <div aria-hidden="true" className="flex h-28 w-20 shrink-0 flex-col gap-2 overflow-hidden rounded border border-neutral-200 bg-white p-2 shadow-sm">
          <p className="truncate text-center text-[5px] font-bold text-neutral-900">{displayName.toUpperCase()}</p>
          <div className="h-px bg-neutral-300" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-1">
              <div className="h-[3px] w-9 bg-neutral-800" />
              <div className="h-[2px] w-full bg-neutral-200" />
              <div className="h-[2px] w-4/5 bg-neutral-200" />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{displayName}</p>
          <p className="mt-1 text-xs capitalize text-neutral-500">{resume.template} · A4</p>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-teal-200"
          >
            <HiOutlineEye size={16} /> {isId ? "Lihat CV" : "View CV"}
          </button>
        </div>
      </div>

      <PDFDownloadLink
        document={pdfDocument}
        fileName={fileName}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-teal-500 hover:text-teal-600 dark:border-neutral-800 dark:text-neutral-200"
      >
        {({ loading, error }) => (
          <>
            <HiOutlineArrowDownTray size={17} />
            {error
              ? isId ? "Gagal membuat PDF" : "PDF error"
              : loading ? isId ? "Menyiapkan PDF..." : "Preparing PDF..."
              : isId ? "Unduh PDF Gratis" : "Download Free PDF"}
          </>
        )}
      </PDFDownloadLink>

      {isOpen && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="zaeeon-cv-preview-title"
            className="flex h-[94vh] max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800 px-3 py-3 sm:px-5">
              <div className="min-w-0">
                <h2 id="zaeeon-cv-preview-title" className="truncate text-sm font-semibold text-white sm:text-base">
                  {isId ? "Pratinjau CV" : "CV Preview"}
                </h2>
                <p className="mt-0.5 text-xs capitalize text-neutral-400">A4 · {resume.template}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PDFDownloadLink
                  document={pdfDocument}
                  fileName={fileName}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-200"
                >
                  {({ loading }) => <><HiOutlineArrowDownTray size={16} />{loading ? (isId ? "Menyiapkan..." : "Preparing...") : (isId ? "Unduh" : "Download")}</>}
                </PDFDownloadLink>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={isId ? "Tutup pratinjau" : "Close preview"}
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500"
                >
                  <HiOutlineXMark size={20} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-neutral-800 p-2 sm:p-4">
              {canEmbedPdf ? (
                <PDFViewer
                  width="100%"
                  height="100%"
                  showToolbar={false}
                  style={{ display: "block", width: "100%", height: "100%", border: "none" }}
                >
                  {pdfDocument}
                </PDFViewer>
              ) : (
                <MobileResumePreview resume={resume} isId={isId} />
              )}
            </div>
          </div>
        </div>,
        window.document.body
      )}
    </div>
  );
}
