"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useLocale } from "next-intl";

type GithubDay = { date: string; count: number };
type GithubSummary = {
  days: GithubDay[];
  current7: number;
  previous7: number;
  activeDays7: number;
};
type WakaTimeSummary = {
  totalSeconds7: number;
  topLanguage: string | null;
  topLanguages?: Array<{ name: string; totalSeconds: number }>;
  rangeLabel: string;
};
type PulseResponse = {
  github: GithubSummary | null;
  wakatime: WakaTimeSummary | null;
  health: { github: "ok" | "unavailable"; wakatime: "ok" | "unavailable" };
  updatedAt: string;
  timezone: string;
};

async function fetcher(url: string): Promise<PulseResponse> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to load Development Pulse");
  return response.json();
}

function timeLabel(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours && !minutes) return seconds > 0 ? "< 1 min" : "0 min";
  if (!hours) return `${minutes} min`;
  return `${hours}h${minutes ? ` ${minutes}m` : ""}`;
}

function weeklyChange(current: number, previous: number, isId: boolean): string {
  if (!previous) {
    if (!current) return isId ? "Belum ada kontribusi" : "No contributions yet";
    return isId ? "Ada aktivitas baru" : "New activity";
  }
  const percent = ((current - previous) / previous) * 100;
  if (Math.abs(percent) < 0.5) return isId ? "Stabil dari 7 hari lalu" : "Same as prior 7 days";
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(0)}% ${isId ? "vs 7 hari sebelumnya" : "vs previous 7 days"}`;
}

function languageLabel(name: string, isId: boolean): string {
  if (/^markdown$/i.test(name)) {
    return isId ? "Dokumentasi (Markdown)" : "Documentation (Markdown)";
  }
  return name;
}

function trackedActivities(data: WakaTimeSummary, isId: boolean): string {
  
  const names = data.topLanguages?.length
    ? data.topLanguages.map((language) => language.name)
    : data.topLanguage ? [data.topLanguage] : [];

  if (!names.length) return isId ? "Aktivitas belum terinci" : "Activity details unavailable";

  const activities = names.slice(0, 3).map((name) => languageLabel(name, isId));
  return `${isId ? "Tercatat" : "Tracked"}: ${activities.join(" · ")}`;
}

function shortDate(date: string, isId: boolean): string {
  return new Intl.DateTimeFormat(isId ? "id-ID" : "en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

function weekday(date: string, isId: boolean): string {
  return new Intl.DateTimeFormat(isId ? "id-ID" : "en-US", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

function StatCard({
  eyebrow,
  value,
  footer,
  isLoading,
}: {
  eyebrow: string;
  value: string;
  footer: string;
  isLoading: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{eyebrow}</p>
      {isLoading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {value}
        </p>
      )}
      <p className="mt-2 min-h-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {isLoading ? "..." : footer}
      </p>
    </div>
  );
}

export default function DevelopmentPulse() {
  const isId = useLocale() === "id";
  const [period, setPeriod] = useState<7 | 14>(7);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data, error, isValidating, mutate } = useSWR<PulseResponse>(
    "/api/development-pulse",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 10 * 60 * 1000,
      dedupingInterval: 60 * 1000,
    },
  );

  const loading = !data && !error;
  const github = data?.github ?? null;
  const wakatime = data?.wakatime ?? null;
  const selectedDays = useMemo(
    () => (github?.days ?? []).slice(period === 7 ? -7 : -14),
    [github, period],
  );
  const maxContributions = Math.max(1, ...selectedDays.map((day) => day.count));
  const selected = selectedDays.find((day) => day.date === selectedDate);

  return (
    <section aria-labelledby="dev-pulse-title" className="w-full">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3-7 4 14 3-7h4" />
              </svg>
            </span>
            <h2 id="dev-pulse-title" className="text-xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">
              {isId ? "Aktivitas Coding" : "Coding Activity"}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {isId
              ? "Ringkasan kegiatan 7 hari terakhir dari GitHub dan editor kode."
              : "Your last 7 days of activity on GitHub and in your code editor."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void mutate()}
          disabled={isValidating}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12.5-2" />
          </svg>
          {isValidating ? (isId ? "Memuat..." : "Refreshing...") : (isId ? "Perbarui" : "Refresh")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          eyebrow={isId ? "Kontribusi GitHub · 7 hari" : "GitHub activity · 7 days"}
          value={github ? github.current7.toLocaleString(isId ? "id-ID" : "en-US") : "—"}
          footer={github ? weeklyChange(github.current7, github.previous7, isId) : (isId ? "GitHub belum tersedia" : "GitHub unavailable")}
          isLoading={loading}
        />
        <StatCard
          eyebrow={isId ? "Waktu tercatat · 7 hari" : "Time tracked · 7 days"}
          value={wakatime ? timeLabel(wakatime.totalSeconds7) : "—"}
          footer={wakatime
            ? trackedActivities(wakatime, isId)
            : (isId ? "Data waktu belum tersedia" : "Time data unavailable")}
          isLoading={loading}
        />
        <StatCard
          eyebrow={isId ? "Hari aktif · 7 hari" : "Active days · 7 days"}
          value={github ? `${github.activeDays7}/7` : "—"}
          footer={isId ? "Hari dengan minimal 1 kontribusi" : "Days with at least 1 contribution"}
          isLoading={loading}
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-4 dark:border-neutral-800 sm:px-5">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {isId ? "Kontribusi Harian" : "Daily Contributions"}
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {isId ? "Jumlah kontribusi GitHub setiap hari" : "GitHub activity each day"}
            </p>
          </div>
          <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800" aria-label={isId ? "Rentang grafik" : "Chart period"}>
            {([7, 14] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => { setPeriod(days); setSelectedDate(null); }}
                aria-pressed={period === days}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  period === days
                    ? "bg-blue-600 font-medium text-white"
                    : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="m-5 h-44 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" aria-label={isId ? "Memuat grafik" : "Loading chart"} />
        ) : github ? (
          <div className="px-4 pb-4 pt-6 sm:px-5">
            <div className="flex h-40 items-end gap-1.5 border-b border-neutral-200 dark:border-neutral-800 sm:gap-3">
              {selectedDays.map((day) => {
                const isSelected = selected?.date === day.date;
                const height = day.count === 0 ? 2 : Math.max(8, (day.count / maxContributions) * 100);
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : day.date)}
                    aria-label={`${shortDate(day.date, isId)}: ${day.count} ${isId ? "kontribusi" : "contributions"}`}
                    aria-pressed={isSelected}
                    title={`${shortDate(day.date, isId)} · ${day.count}`}
                    className="group flex h-full min-w-0 flex-1 items-end justify-center focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <span
                      className={`block w-full max-w-12 rounded-t-md transition-colors ${
                        isSelected ? "bg-blue-700 dark:bg-blue-300" : "bg-blue-500/80 group-hover:bg-blue-600 dark:bg-blue-500/70 dark:group-hover:bg-blue-400"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-1.5 sm:gap-3" aria-hidden="true">
              {selectedDays.map((day) => (
                <span key={day.date} className="min-w-0 flex-1 text-center text-[10px] text-neutral-500 dark:text-neutral-400">
                  {period === 7 ? weekday(day.date, isId) : String(Number(day.date.slice(-2)))}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <span aria-live="polite">
                {selected
                  ? `${shortDate(selected.date, isId)} · ${selected.count} ${isId ? "kontribusi" : "contributions"}`
                  : (isId ? "Pilih batang untuk detail harian" : "Select a bar for daily details")}
              </span>
              <span>{isId ? "Zona waktu: Jakarta" : "Timezone: Jakarta"}</span>
            </div>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {isId ? "Data kontribusi GitHub belum tersedia." : "GitHub contribution data is unavailable."}
          </div>
        )}
      </div>

      {error && !data ? (
        <p role="alert" className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          {isId ? "Data belum dapat dimuat. Periksa koneksi API lalu klik Perbarui." : "Data could not be loaded. Check the APIs and try Refresh."}
        </p>
      ) : data ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${data.health.github === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
              GitHub {data.health.github === "ok" ? (isId ? "tersambung" : "connected") : (isId ? "tidak tersedia" : "unavailable")}
            </span>
            <span className="inline-flex items-center gap-1.5" title="Data source: WakaTime">
              <span className={`h-1.5 w-1.5 rounded-full ${data.health.wakatime === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isId ? "Pencatat waktu" : "Time tracker"} {data.health.wakatime === "ok" ? (isId ? "tersambung" : "connected") : (isId ? "tidak tersedia" : "unavailable")}
            </span>
          </div>
          <time dateTime={data.updatedAt}>
            {isId ? "Diperiksa" : "Checked"}: {new Date(data.updatedAt).toLocaleString(isId ? "id-ID" : "en-US", {
              dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
            })} WIB
          </time>
        </div>
      ) : null}
    </section>
  );
}
