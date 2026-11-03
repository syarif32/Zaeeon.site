"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useLocale } from "next-intl";
import { FiCode, FiExternalLink } from "react-icons/fi";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import {
  SiCss3, SiDart, SiGnubash, SiGo, SiHtml5, SiJavascript,
  SiKotlin, SiOpenjdk, SiPhp, SiPython, SiSwift, SiTypescript,
} from "react-icons/si";
import type { IconType } from "react-icons";

import SectionHeading from "@/common/components/elements/SectionHeading";
import SectionSubHeading from "@/common/components/elements/SectionSubHeading";
import EmptyState from "@/common/components/elements/EmptyState";
import { fetcher } from "@/services/fetcher";

type RepoLanguage = { name: string; url: string; bytes: number };
type Language = {
  name: string;
  bytes: number;
  percentage: number;
  repositories: RepoLanguage[];
};
type FootprintResponse = {
  username: string;
  totalRepositories: number;
  totalBytes: number;
  languages: Language[];
};

const colors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#e3c53f",
  PHP: "#777bb4",
  Dart: "#04a5d9",
  Kotlin: "#a97bff",
  Python: "#4584ae",
  CSS: "#8855c1",
  HTML: "#e36c42",
  Java: "#b57435",
  Go: "#00add8",
  Swift: "#f48055",
  Shell: "#8a9d63",
};
const fallbackColors = ["#4e9d88", "#bb83c5", "#da9b55", "#6587b1", "#9a9a9a"];
const languageIcons: Record<string, IconType> = {
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  PHP: SiPhp,
  Dart: SiDart,
  Kotlin: SiKotlin,
  Python: SiPython,
  CSS: SiCss3,
  HTML: SiHtml5,
  Java: SiOpenjdk,
  Go: SiGo,
  Swift: SiSwift,
  Shell: SiGnubash,
};
function colorOf(name: string, index: number) {
  return colors[name] ?? fallbackColors[index % fallbackColors.length];
}

export default function TechnologyFootprint() {
  const locale = useLocale();
  const isID = locale === "id";
  const [selected, setSelected] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const reveal = useMotionValue(0);
  const revealMask = useMotionTemplate`conic-gradient(#000 0% ${reveal}%, transparent ${reveal}% 100%)`;
  const hasRevealed = useRef(false);
  const { data, error, isLoading } = useSWR<FootprintResponse>(
    "/api/github/languages",
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false },
  );

  const labels = isID
    ? {
        subtitle: "Distribusi bahasa pemrograman berdasarkan ukuran kode repositori publik saya.",
        loading: "Mengambil distribusi bahasa GitHub...",
        error: "Statistik bahasa tidak dapat diambil sekarang.",
        empty: "Belum ada data bahasa untuk ditampilkan.",
        repositories: "Repositori dianalisis",
        languages: "Bahasa terdeteksi",
        source: "GitHub Languages API · diperbarui hingga setiap 6 jam",
        choose: "Pilih bahasa untuk melihat repositorinya",
        more: "Repositori dengan bahasa ini",
        other: "Lainnya",
      }
    : {
        subtitle: "Programming language distribution by code size across my public repositories.",
        loading: "Loading GitHub languages...",
        error: "Could not load the language breakdown right now.",
        empty: "No language data found.",
        repositories: "Repositories analyzed",
        languages: "Languages detected",
        source: "GitHub Languages API · refreshes up to every 6 hours",
        choose: "Select a language to see its repositories",
        more: "Repositories using this language",
        other: "Other",
      };

  const display = useMemo(() => {
    const all = data?.languages ?? [];
    if (all.length <= 7) return all;
    const top = all.slice(0, 7);
    const rest = all.slice(7);
    return [
      ...top,
      {
        name: labels.other,
        bytes: rest.reduce((sum, lang) => sum + lang.bytes, 0),
        percentage: rest.reduce((sum, lang) => sum + lang.percentage, 0),
        repositories: rest.flatMap((lang) => lang.repositories),
      },
    ];
  }, [data, labels.other]);

  const gradient = useMemo(() => {
    const total = display.reduce((sum, item) => sum + item.bytes, 0);
    if (total === 0) return "conic-gradient(#52525b 0% 100%)";
    let start = 0;
    const stops = display.map((item, i) => {
      const end = start + (item.bytes / total) * 100;
      const part = `${colorOf(item.name, i)} ${start}% ${end}%`;
      start = end;
      return part;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [display]);

  useEffect(() => {
    if (!data?.languages?.length || hasRevealed.current) return;
    hasRevealed.current = true;
    if (reduceMotion) {
      reveal.set(100);
      return;
    }
    const controls = animate(reveal, 100, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [data?.languages?.length, reduceMotion, reveal]);

  const active = display.find((item) => item.name === selected);
  const activeIndex = display.findIndex((item) => item.name === selected);
  const activeColor = active ? colorOf(active.name, activeIndex) : null;
  const ActiveIcon = active ? languageIcons[active.name] ?? FiCode : null;
  const chartIcons = useMemo(() => {
    const total = display.reduce((sum, item) => sum + item.bytes, 0);
    let start = 0;
    return display.flatMap((item, index) => {
      const share = total ? item.bytes / total : 0;
      const middle = start + share / 2;
      start += share;
      // Small slices keep their logo in the center when selected.
      if (share < 0.12) return [];
      const angle = middle * Math.PI * 2 - Math.PI / 2;
      return [{
        name: item.name,
        Icon: languageIcons[item.name] ?? FiCode,
        color: colorOf(item.name, index),
        x: 50 + Math.cos(angle) * 39,
        y: 50 + Math.sin(angle) * 39,
      }];
    });
  }, [display]);
  const selectFromChart = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) {
      const next = display[(display.findIndex((item) => item.name === selected) + 1) % display.length];
      if (next) setSelected(next.name);
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 450) % 360;
    const total = display.reduce((sum, item) => sum + item.bytes, 0);
    if (!total) return;

    let end = 0;
    const clicked = display.find((item) => {
      end += item.bytes / total * 360;
      return angle < end;
    }) ?? display[display.length - 1];
    setSelected(selected === clicked.name ? null : clicked.name);
  };
  const formatPercentage = (value: number) =>
    value > 0 && value < 0.01 ? "<0.01%" : `${value.toFixed(1)}%`;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <SectionHeading title="Technology Footprint" icon={<FiCode />} />
        <SectionSubHeading>{labels.subtitle}</SectionSubHeading>
      </div>

      {error || (!isLoading && !Array.isArray(data?.languages)) ? (
        <EmptyState message={labels.error} />
      ) : isLoading ? (
        <p className="py-4 text-sm text-neutral-500">{labels.loading}</p>
      ) : data?.languages.length === 0 ? (
        <EmptyState message={labels.empty} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <p className="text-sm text-neutral-500">{labels.repositories}</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {data?.totalRepositories ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <p className="text-sm text-neutral-500">{labels.languages}</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {data?.languages.length ?? 0}
              </p>
            </div>
          </div>

          <div className="grid gap-8 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:p-6">
            <div className="flex items-center justify-center">
              <motion.button
                type="button"
                className="relative aspect-square w-full max-w-56 rounded-full"
                onClick={selectFromChart}
                aria-label="Select a programming language from the chart"
                animate={{
                  scale: active && !reduceMotion ? 1.06 : 1,
                  boxShadow: activeColor ? `0 0 30px ${activeColor}77` : "0 0 0px #00000000",
                }}
                whileHover={reduceMotion ? undefined : { scale: active ? 1.08 : 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{ background: gradient, WebkitMaskImage: revealMask, maskImage: revealMask }}
                />
                {chartIcons.map(({ name, Icon, color, x, y }) => (
                  <motion.span
                    key={name}
                    aria-hidden="true"
                    className="pointer-events-none absolute z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-base shadow-sm dark:bg-neutral-900/90"
                    style={{ left: `${x}%`, top: `${y}%`, color, translateX: "-50%", translateY: "-50%" }}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: selected === name && !reduceMotion ? 1.25 : 1 }}
                    transition={{ delay: reduceMotion ? 0 : 0.85, duration: 0.25 }}
                  >
                    <Icon />
                  </motion.span>
                ))}
                <div className="pointer-events-none absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white text-center dark:bg-[#111111]">
                  {ActiveIcon ? (
                    <>
                      <ActiveIcon className="text-2xl" style={{ color: activeColor ?? undefined }} />
                      <span className="mt-1 max-w-[90%] truncate text-xs font-medium text-neutral-700 dark:text-neutral-200">{active?.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">{data?.languages.length ?? 0}</span>
                      <span className="text-xs text-neutral-500">Languages</span>
                    </>
                  )}
                </div>
              </motion.button>
            </div>

            <div className="space-y-3 self-center">
              {display.map((lang, index) => (
                <motion.button
                  key={lang.name}
                  type="button"
                  onClick={() => setSelected(selected === lang.name ? null : lang.name)}
                  aria-pressed={selected === lang.name}
                  animate={{
                    x: selected === lang.name && !reduceMotion ? 4 : 0,
                    boxShadow: selected === lang.name
                      ? `0 0 0 1px ${colorOf(lang.name, index)}88, 0 4px 18px ${colorOf(lang.name, index)}44`
                      : "0 0 0 0px #00000000",
                  }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className={`w-full rounded-lg px-2 py-1 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${selected === lang.name ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: colorOf(lang.name, index) }}
                      />
                      <span className="truncate">{lang.name}</span>
                    </span>
                    <span className="text-xs tabular-nums text-neutral-500">
                      {formatPercentage(lang.percentage)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <motion.div
                      className="h-full rounded-full"
                      initial={reduceMotion ? false : { scaleX: 0 }}
                      animate={{
                        scaleX: 1,
                        scaleY: selected === lang.name && !reduceMotion ? 1.45 : 1,
                        boxShadow: selected === lang.name
                          ? `0 0 12px ${colorOf(lang.name, index)}aa`
                          : "0 0 0px #00000000",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: reduceMotion ? 0 : index * 0.08 }}
                      style={{
                        backgroundColor: colorOf(lang.name, index),
                        width: `${lang.percentage}%`,
                        transformOrigin: "left center",
                      }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <AnimatePresence mode="wait" initial={false}>
            {active ? (
              <motion.div
                key={active.name}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {active.name} — {labels.more}
                </p>
                {Array.from(
                  new Map(active.repositories.map((repo) => [repo.url, repo])).values(),
                )
                  .sort((a, b) => b.bytes - a.bytes)
                  .slice(0, 8)
                  .map((repo) => (
                    <a
                      key={repo.url}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 py-1 text-sm text-neutral-600 hover:underline dark:text-neutral-400"
                    >
                      <span className="truncate">{repo.name}</span>
                      <FiExternalLink className="shrink-0" />
                    </a>
                  ))}
              </motion.div>
            ) : (
              <motion.p
                key="choose"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-neutral-500"
              >
                {labels.choose}
              </motion.p>
            )}
            </AnimatePresence>
          </div>
          <p className="text-xs text-neutral-500">{labels.source}</p>
        </>
      )}
    </section>
  );
}
