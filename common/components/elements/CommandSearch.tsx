"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import {
  FiArrowUpRight,
  FiAward,
  FiFileText,
  FiFolder,
  FiSearch,
  FiX,
} from "react-icons/fi";

import { MENU_ITEMS } from "@/common/constants/menu";
import type { ProjectItem } from "@/common/types/projects";
import type { AchievementItem } from "@/common/types/achievements";
import { useRouter } from "@/i18n/navigation";
import { useMenu } from "@/common/stores/menu";
import { fetcher } from "@/services/fetcher";

type EntryType = "page" | "project" | "achievement";
type Entry = {
  id: string;
  type: EntryType;
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
};

type SearchContextValue = { openSearch: () => void };
const SearchContext = createContext<SearchContextValue | null>(null);

const PAGE_TERMS: Record<string, { id: string; en: string }> = {
  "/": { id: "beranda profil utama home", en: "home profile introduction" },
  "/about": { id: "tentang pengalaman karier pendidikan resume cv", en: "about experience career education resume cv" },
  "/achievements": { id: "sertifikat sertifikasi penghargaan pencapaian", en: "certificates certifications awards achievements" },
  "/projects": { id: "proyek karya aplikasi github teknologi stack", en: "projects apps work github technologies stack" },
  "/layanan": { id: "layanan jasa kerja sama freelance", en: "services hire freelance collaboration" },
  "/dashboard": { id: "statistik github wakatime repository languages kontribusi", en: "statistics github wakatime repositories languages contributions" },
  "/assistant": { id: "asisten ai kecerdasan buatan tanya", en: "ai assistant ask questions" },
  "/chat": { id: "ruang obrolan diskusi pesan", en: "chat room discussion messages" },
  "/contact": { id: "kontak email hubungi kolaborasi", en: "contact email collaboration" },
//   "/contents": { id: "konten artikel video tulisan", en: "content articles videos writing" },
};

const simplify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();

function scoreEntry(entry: Entry, query: string): number {
  const words = simplify(query).split(/\s+/).filter(Boolean);
  if (!words.length) return entry.type === "page" ? 1 : 0;

  const title = simplify(entry.title);
  const subtitle = simplify(entry.subtitle);
  const searchable = simplify(`${entry.title} ${entry.subtitle} ${entry.keywords}`);
  if (!words.every((word) => searchable.includes(word))) return 0;

  let score = 10;
  if (title === simplify(query)) score += 100;
  else if (title.startsWith(simplify(query))) score += 65;
  else if (words.every((word) => title.includes(word))) score += 40;
  else if (words.some((word) => subtitle.includes(word))) score += 15;
  if (entry.type === "project") score += 3;
  return score;
}

function SearchIcon({ type }: { type: EntryType }) {
  if (type === "project") return <FiFolder aria-hidden="true" size={17} />;
  if (type === "achievement") return <FiAward aria-hidden="true" size={17} />;
  return <FiFileText aria-hidden="true" size={17} />;
}

export function CommandSearchProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const isId = locale === "id";
  const t = useTranslations("Navigation");
  const router = useRouter();
  const hideMenu = useMenu((state) => state.hideMenu);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const listId = useId();

  const { data: projectsData, error: projectsError, isLoading: projectsLoading } =
    useSWR<ProjectItem[]>(isOpen ? "/api/projects" : null, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    });

  const {
    data: achievementsData,
    error: achievementsError,
    isLoading: achievementsLoading,
  } = useSWR<AchievementItem[]>(isOpen ? "/api/achievements" : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const openSearch = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActiveIndex(0);
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => previousFocusRef.current?.focus());
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isOpen) closeSearch();
        else openSearch();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [openSearch, closeSearch, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const pages = useMemo<Entry[]>(() => {
    const fromMenu: Entry[] = MENU_ITEMS.filter(
      (item) => item.isShow && item.href && item.href.startsWith("/"),
    ).map((item) => {
      const href = item.href as string;
      return {
        id: `page:${href}`,
        type: "page",
        title: t(item.title),
        subtitle: isId ? "Halaman" : "Page",
        href,
        keywords: `${item.title} ${PAGE_TERMS[href]?.id ?? ""} ${PAGE_TERMS[href]?.en ?? ""}`,
      };
    });

    // // Halaman konten sudah tersedia, walaupun menu navigasinya disembunyikan.
    // if (!fromMenu.some((item) => item.href === "/contents")) {
    //   fromMenu.push({
    //     id: "page:/contents",
    //     type: "page",
    //     title: t("Contents"),
    //     subtitle: isId ? "Halaman" : "Page",
    //     href: "/contents",
    //     keywords: `${PAGE_TERMS["/contents"].id} ${PAGE_TERMS["/contents"].en}`,
    //   });
    // }
    return fromMenu;
  }, [isId, t]);

  const projects = useMemo<Entry[]>(() => {
    if (!Array.isArray(projectsData)) return [];
    return projectsData
      .filter((item) => item?.is_show === true && !!item.slug && !!item.title)
      .map((item) => ({
        id: `project:${item.id}`,
        type: "project" as const,
        title: item.title,
        subtitle: isId ? "Proyek" : "Project",
        href: `/projects/${encodeURIComponent(item.slug)}`,
        keywords: `${item.description ?? ""} ${(Array.isArray(item.stacks) ? item.stacks : []).join(" ")}`,
      }));
  }, [projectsData, isId]);

  const achievements = useMemo<Entry[]>(() => {
    if (!Array.isArray(achievementsData)) return [];
    return achievementsData
      .filter((item) => item?.is_show === true && !!item.name)
      .map((item) => ({
        id: `achievement:${item.id}`,
        type: "achievement" as const,
        title: item.name,
        subtitle: isId ? "Pencapaian" : "Achievement",
        href: `/achievements?search=${encodeURIComponent(item.name)}`,
        keywords: `${item.issuing_organization ?? ""} ${item.category ?? ""} ${item.type ?? ""}`,
      }));
  }, [achievementsData, isId]);

  const results = useMemo(() => {
    const all = [...pages, ...projects, ...achievements];
    return all
      .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, query.trim() ? 12 : 9)
      .map((result) => result.entry);
  }, [pages, projects, achievements, query]);

  useEffect(() => setActiveIndex(0), [query]);

  const navigateTo = useCallback(
    (href: string) => {
      setIsOpen(false);
      hideMenu();
      router.push(href);
    },
    [hideMenu, router],
  );

  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (event.key === "Tab") {
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled])',
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
      return;
    }

    if (event.target !== inputRef.current) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      setActiveIndex((current) =>
        event.key === "ArrowDown"
          ? (current + 1) % results.length
          : (current - 1 + results.length) % results.length,
      );
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      navigateTo(results[activeIndex].href);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current
      ?.querySelector(`[data-search-result="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const fetching = projectsLoading || achievementsLoading;
  const dataError = !!projectsError || !!achievementsError;

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-start justify-center bg-neutral-950/65 px-3 pt-[9vh] backdrop-blur-[5px] sm:pt-[14vh]"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) closeSearch();
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={isId ? "Pencarian situs" : "Site search"}
              onKeyDown={onDialogKeyDown}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <FiSearch aria-hidden="true" size={20} className="shrink-0 text-blue-500" />
                <input
                  ref={inputRef}
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={results.length > 0}
                  aria-controls={listId}
                  aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={isId ? "Cari halaman, proyek, teknologi..." : "Search pages, projects, technologies..."}
                  className="min-w-0 flex-1 appearance-none bg-transparent py-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:hover:bg-neutral-800"
                  aria-label={isId ? "Tutup pencarian" : "Close search"}
                >
                  <FiX aria-hidden="true" size={18} />
                </button>
              </div>

              <div
                id={listId}
                role="listbox"
                aria-label={isId ? "Hasil pencarian" : "Search results"}
                className="max-h-[min(58vh,430px)] overflow-y-auto p-2"
              >
                {!query.trim() && (
                  <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    {isId ? "Jelajahi halaman" : "Explore pages"}
                  </p>
                )}

                {results.map((item, index) => (
                  <button
                    type="button"
                    role="option"
                    id={`${listId}-${index}`}
                    aria-selected={index === activeIndex}
                    data-search-result={index}
                    key={item.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => navigateTo(item.href)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      activeIndex === index
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                      <SearchIcon type={item.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {item.subtitle}
                        {item.type === "project" && item.keywords
                          ? ` · ${item.keywords.slice(0, 70)}`
                          : ""}
                      </span>
                    </span>
                    <FiArrowUpRight aria-hidden="true" size={15} className="shrink-0 opacity-50 group-hover:opacity-100" />
                  </button>
                ))}

                {query.trim() && !results.length && (
                  <div className="px-4 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    {fetching
                      ? isId ? "Memuat hasil proyek dan pencapaian..." : "Loading projects and achievements..."
                      : isId ? "Tidak ada hasil yang cocok." : "No matching results."}
                  </div>
                )}

                {dataError && (
                  <p className="px-3 py-2 text-xs text-amber-700 dark:text-amber-400" role="status">
                    {isId
                      ? "Sebagian data proyek atau pencapaian belum tersedia. Pencarian halaman tetap dapat digunakan."
                      : "Some project or achievement data is unavailable. Page search still works."}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-4 py-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <span aria-live="polite">
                  {isId ? `${results.length} hasil` : `${results.length} results`}
                  {fetching ? (isId ? " · Memuat..." : " · Loading...") : ""}
                </span>
                <span className="hidden sm:inline">↑↓ {isId ? "pilih" : "select"} · ↵ {isId ? "buka" : "open"} · Esc {isId ? "tutup" : "close"}</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </SearchContext.Provider>
  );
}

export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  const context = useContext(SearchContext);
  const locale = useLocale();
  const [shortcut, setShortcut] = useState("Ctrl K");

  useEffect(() => {
    if (/Macintosh|Mac OS X|iPad|iPhone/i.test(navigator.userAgent)) {
      setShortcut("⌘ K");
    }
  }, []);

  if (!context) return null;

  return (
    <button
      type="button"
      onClick={context.openSearch}
      aria-label={locale === "id" ? "Buka pencarian (Ctrl+K)" : "Open search (Ctrl+K)"}
      title={locale === "id" ? "Cari di website" : "Search the site"}
      className={compact
        ? "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-neutral-300 dark:hover:bg-neutral-800"
        : "flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white/70 px-3 py-2 text-sm text-neutral-500 transition hover:border-blue-300 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-400 dark:hover:border-blue-700 dark:hover:text-neutral-100"}
    >
      <FiSearch aria-hidden="true" size={17} className="shrink-0" />
      {!compact && (
        <>
          <span className="flex-1 text-left">{locale === "id" ? "Cari..." : "Search..."}</span>
          <kbd className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] dark:border-neutral-700">{shortcut}</kbd>
        </>
      )}
    </button>
  );
}
