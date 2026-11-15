"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineGlobeAlt,
  HiOutlineMagnifyingGlass,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";

type Language = "en" | "id";
type Phase = "welcome" | "tour" | null;
type Rectangle = { top: number; left: number; width: number; height: number };

const SEEN_KEY = "zaeeon-site-tour-seen-v1";
const PENDING_KEY = "zaeeon-site-tour-pending-v1";
const STEPS = ["menu", "search", "language"] as const;
// Match the mobile controls rendered by Profile.tsx.
const MOBILE_QUERY = "(max-width: 767px)";
type Step = (typeof STEPS)[number];

const I18N = {
  en: {
    eyebrow: "QUICK START · 3 STEPS",
    title: "Welcome to Zaeeon",
    subtitle: "Choose your language, then discover the menu, search, and language switcher.",
    language: "Guide language",
    start: "Show me around",
    skip: "Skip",
    back: "Back",
    next: "Next",
    finish: "Finish",
    stepLabel: "Step",
    notVisible: "If this control is hidden, open the navigation menu first.",
    menu: ["Navigation menu", "Open the menu to explore the site's pages and tools."],
    search: ["Quick search", "Tap the search button to find pages and content quickly."],
    languageStep: ["Change language", "Switch between English and Bahasa Indonesia whenever you want."],
  },
  id: {
    eyebrow: "PANDUAN SINGKAT · 3 LANGKAH",
    title: "Selamat datang di Zaeeon",
    subtitle: "Pilih bahasa, lalu kenali menu, pencarian, dan pengaturan bahasa.",
    language: "Bahasa panduan",
    start: "Mulai panduan",
    skip: "Lewati",
    back: "Kembali",
    next: "Lanjut",
    finish: "Selesai",
    stepLabel: "Langkah",
    notVisible: "Jika tombol ini belum terlihat, buka menu navigasi terlebih dahulu.",
    menu: ["Menu navigasi", "Buka menu untuk menjelajahi halaman dan fitur website."],
    search: ["Pencarian cepat", "Ketuk tombol pencarian untuk menemukan halaman dan konten dengan cepat."],
    languageStep: ["Ganti bahasa", "Beralih antara English dan Bahasa Indonesia kapan saja."],
  },
} as const;

const safeRead = (storage: "localStorage" | "sessionStorage", key: string) => {
  try { return window[storage].getItem(key); } catch { return null; }
};
const safeWrite = (storage: "localStorage" | "sessionStorage", key: string, value: string) => {
  try { window[storage].setItem(key, value); } catch { /* storage may be disabled */ }
};
const safeRemove = (storage: "localStorage" | "sessionStorage", key: string) => {
  try { window[storage].removeItem(key); } catch { /* storage may be disabled */ }
};

function findVisibleTarget(step: Step): Rectangle | null {
  // Support the existing header without editing its components. Explicit data-tour
  // attributes take priority when they are available.
  const header = document.querySelector("[data-responsive-header]");
  const fallback = step === "menu"
    ? Array.from(header?.querySelectorAll<HTMLElement>("div") ?? []).filter(
        (element) => element.children.length === 3 &&
          Array.from(element.children).every((child) => child.tagName === "SPAN"),
      )
    : Array.from(header?.querySelectorAll<HTMLElement>(step === "search"
        ? 'button[aria-label^="Buka pencarian"], button[aria-label^="Open search"]'
        : 'button.lg\\:hidden') ?? []);
  const candidates = [
    ...Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${step}"]`)),
    ...fallback,
  ];
  for (const element of candidates) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    if (
      !element.getClientRects().length || style.display === "none" || style.visibility === "hidden" ||
      rect.width < 10 || rect.height < 10 ||
      rect.bottom < 0 || rect.top > window.innerHeight ||
      rect.right < 0 || rect.left > window.innerWidth
    ) continue;
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  }
  return null;
}

function sameRect(a: Rectangle | null, b: Rectangle | null): boolean {
  if (!a || !b) return a === b;
  return Math.abs(a.top - b.top) < 1 && Math.abs(a.left - b.left) < 1 &&
    Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;
}

function translatedPath(pathname: string, lang: Language): string {
  const normalized = pathname || "/";
  if (/^\/(en|id)(?=\/|$)/.test(normalized)) {
    return normalized.replace(/^\/(en|id)(?=\/|$)/, `/${lang}`);
  }
  return `/${lang}${normalized === "/" ? "" : normalized}`;
}

export default function SiteOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [phase, setPhase] = useState<Phase>(null);
  const [language, setLanguage] = useState<Language>("en"); // English is the first-visit default.
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rectangle | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const copy = I18N[language];
  const currentStep = STEPS[stepIndex];

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(MOBILE_QUERY);
    const initialize = () => {
      setIsMobile(media.matches);
      if (!media.matches) return;
      const pending = safeRead("sessionStorage", PENDING_KEY);
      if (pending === "tour:en" || pending === "tour:id") {
        safeRemove("sessionStorage", PENDING_KEY);
        setLanguage(pending === "tour:id" ? "id" : "en");
        setPhase("tour");
        setStepIndex(0);
        return;
      }
      if (!safeRead("localStorage", SEEN_KEY)) setPhase("welcome");
    };
    initialize();
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    media.addEventListener("change", initialize);
    return () => {
      window.removeEventListener("resize", updateViewport);
      media.removeEventListener("change", initialize);
    };
  }, []);

  useEffect(() => {
    if (phase === "tour" && locale === language) {
      safeRemove("sessionStorage", PENDING_KEY);
    }
  }, [phase, locale, language]);

  // Optional: place data-onboarding-reopen on a help button/menu item.
  useEffect(() => {
    const reopen = () => {
      if (!window.matchMedia(MOBILE_QUERY).matches) return;
      setLanguage(locale === "id" ? "id" : "en");
      setStepIndex(0);
      setPhase("welcome");
    };
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-onboarding-reopen]")) reopen();
    };
    window.addEventListener("zaeeon:open-tour", reopen);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("zaeeon:open-tour", reopen);
      document.removeEventListener("click", onClick);
    };
  }, [locale]);

  const close = () => {
    safeWrite("localStorage", SEEN_KEY, "1");
    safeRemove("sessionStorage", PENDING_KEY);
    setPhase(null);
  };

  const start = () => {
    safeWrite("localStorage", SEEN_KEY, "1");
    setStepIndex(0);
    setPhase("tour");
    const current = locale === "id" ? "id" : "en";
    if (current !== language) {
      // Session storage bridges a locale change if Next.js remounts the layout.
      safeWrite("sessionStorage", PENDING_KEY, `tour:${language}`);
      const nextPath = translatedPath(pathname, language);
      router.replace(`${nextPath}${window.location.search}${window.location.hash}`);
    }
  };

  useEffect(() => {
    if (phase !== "tour" || !isMobile) { setRect(null); return; }
    let frame: number;
    const update = () => {
      const next = findVisibleTarget(currentStep);
      setRect((previous) => sameRect(previous, next) ? previous : next);
      // Follow the header while its menu and profile animate.
      frame = window.requestAnimationFrame(update);
    };
    update();
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [phase, currentStep, isMobile]);

  useEffect(() => {
    if (phase === null || !isMobile) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [phase, isMobile]);

  const tooltipStyle = useMemo<CSSProperties>(() => {
    if (!rect || typeof window === "undefined") return {};
    const vw = viewport.width, vh = viewport.height;
    const width = Math.min(324, vw - 24);
    const left = Math.max(12, Math.min(vw - width - 12, rect.left + rect.width / 2 - width / 2));
    const estimatedHeight = 205;
    const below = rect.top + rect.height + 15;
    const top = below + estimatedHeight <= vh - 12
      ? below : Math.max(12, rect.top - estimatedHeight - 15);
    return { left, top, width, maxHeight: Math.max(0, vh - top - 12), bottom: "auto", transform: "none" };
  }, [rect, viewport]);

  if (!mounted || !isMobile || !phase || typeof document === "undefined") return null;
  const stepInfo = copy[currentStep === "language" ? "languageStep" : currentStep];
  const Icon = currentStep === "menu" ? HiOutlineBars3 : currentStep === "search" ? HiOutlineMagnifyingGlass : HiOutlineGlobeAlt;

  return createPortal(
    <div data-site-onboarding className="pointer-events-none fixed inset-0 z-[10000]">
      {phase === "welcome" ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="zaeeon-tour-title"
          className="pointer-events-auto absolute bottom-4 left-4 right-4 mx-auto max-h-[calc(100dvh-32px)] w-auto max-w-[370px] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:bottom-6 sm:left-auto sm:right-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              <HiOutlineGlobeAlt className="h-5 w-5" />
            </div>
            <button type="button" onClick={close} aria-label={copy.skip} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 dark:hover:bg-neutral-800"><HiOutlineXMark className="h-5 w-5" /></button>
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.17em] text-teal-700 dark:text-teal-400">{copy.eyebrow}</p>
          <h2 id="zaeeon-tour-title" className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{copy.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{copy.subtitle}</p>
          <p className="mt-4 text-xs font-medium text-neutral-700 dark:text-neutral-300">{copy.language}</p>
          <div role="group" aria-label={copy.language} className="mt-2 grid grid-cols-2 gap-2">
            {(["en", "id"] as const).map((option) => (
              <button
                type="button" key={option} aria-pressed={language === option}
                onClick={() => setLanguage(option)}
                className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 ${language === option ? "border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/30 dark:text-teal-200" : "border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200"}`}
              >
                {option === "en" ? "English" : "Indonesia"}
                {language === option && <HiOutlineCheck className="h-4 w-4 text-teal-600" />}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button type="button" onClick={start} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-3 text-sm font-semibold text-white hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:bg-neutral-100 dark:text-neutral-900">
              {copy.start} <HiOutlineArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={close} className="min-h-11 rounded-xl px-3 text-sm text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">{copy.skip}</button>
          </div>
        </section>
      ) : (
        <>
          {rect && (
            <div aria-hidden="true" className="pointer-events-none fixed rounded-xl border-2 border-teal-500 shadow-[0_0_0_5px_rgba(20,184,166,0.16)] transition-[left,top,width,height] duration-150"
              style={{ top: Math.max(0, rect.top - 5), left: Math.max(0, rect.left - 5), width: rect.width + 10, height: rect.height + 10 }} />
          )}
          <section
            role="dialog" aria-modal="false" aria-live="polite"
            aria-label={`${copy.stepLabel} ${stepIndex + 1}: ${stepInfo[0]}`}
            className={`pointer-events-auto fixed max-h-[calc(100dvh-24px)] w-[min(324px,calc(100vw-24px))] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 ${rect ? "" : "bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6"}`}
            style={rect ? tooltipStyle : undefined}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">{copy.stepLabel} {stepIndex + 1} / 3</span>
              <button type="button" onClick={close} aria-label={copy.skip} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><HiOutlineXMark className="h-4 w-4" /></button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <Icon className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-semibold">{stepInfo[0]}</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{stepInfo[1]}</p>
            {!rect && <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">{copy.notVisible}</p>}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={close} className="text-xs text-neutral-500 hover:underline dark:text-neutral-400">{copy.skip}</button>
              <div className="flex gap-2">
                {stepIndex > 0 && <button type="button" onClick={() => setStepIndex((i) => i - 1)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"><HiOutlineArrowLeft className="h-3.5 w-3.5" />{copy.back}</button>}
                <button type="button" onClick={() => stepIndex === STEPS.length - 1 ? close() : setStepIndex((i) => i + 1)} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                  {stepIndex === STEPS.length - 1 ? copy.finish : copy.next}
                  {stepIndex < STEPS.length - 1 && <HiOutlineArrowRight className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>,
    document.body,
  );
}
