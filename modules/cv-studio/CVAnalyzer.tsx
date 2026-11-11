
"use client";

import { useMemo, useState } from "react";

import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

import type { ResumeData } from "./model";

import {
  analyzeCVQuality,
  analyzeJobMatch,
} from "./cvAnalysis";

import type {
  LocalizedText,
} from "./cvAnalysis";

type Props = {
  resume: ResumeData;
  isId: boolean;
};

const INPUT =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

export default function CVAnalyzer({
  resume,
  isId,
}: Props) {
  const [jobDescription, setJobDescription] =
    useState("");

  const [extraKeywords, setExtraKeywords] =
    useState("");

  // skor selalu mengikuti data CV terbaru
  const quality = useMemo(
    () => analyzeCVQuality(resume),
    [resume]
  );

  // analisis lowongan berjalan secara lokal
  const match = useMemo(
    () =>
      analyzeJobMatch(
        resume,
        jobDescription,
        extraKeywords
      ),
    [resume, jobDescription, extraKeywords]
  );

  const t = (text: LocalizedText) =>
    isId ? text.id : text.en;

  const scoreLabel =
    quality.score >= 80
      ? isId
        ? "Baik"
        : "Good"
      : quality.score >= 55
      ? isId
        ? "Cukup"
        : "Fair"
      : isId
      ? "Perlu ditinjau"
      : "Needs review";

  return (
    <section className="min-w-0 space-y-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-5">
      {/* HEADER ANALISIS */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {isId
            ? "Analisis kualitas CV"
            : "CV quality analysis"}
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {isId
            ? "Analisis otomatis di browser. Skor adalah panduan editorial, bukan prediksi lolos ATS atau diterima kerja."
            : "Runs locally in your browser. This is an editorial guide, not an ATS or hiring prediction."}
        </p>
      </div>

      {/* SKOR UTAMA */}
      <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-950/50">
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-[5px] border-teal-500 bg-white dark:bg-neutral-900">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">
            {quality.score}
          </span>

          <span className="text-[10px] text-neutral-500">
            / 100
          </span>
        </div>

        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {scoreLabel}
          </p>

          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {isId
              ? "Nilai berubah otomatis saat kamu menyunting isi CV. Tidak ada batas minimum untuk mengunduh."
              : "Updates as you edit. There is no minimum score required to download."}
          </p>
        </div>
      </div>

      {/* RINCIAN SKOR */}
      <div className="grid gap-3 sm:grid-cols-2">
        {quality.areas.map((area) => (
          <div
            key={area.key}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-neutral-700 dark:text-neutral-200">
                {t(area.label)}
              </span>

              <span className="tabular-nums text-neutral-500">
                {area.score}/{area.max}
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={area.max}
              aria-valuenow={area.score}
              aria-label={t(area.label)}
              className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
            >
              <div
                className="h-full rounded-full bg-teal-600 transition-all"
                style={{
                  width: `${
                    (area.score / area.max) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* SARAN KUALITAS CV */}
      <div className="space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {isId
            ? "Hal yang bisa ditingkatkan"
            : "Areas to improve"}
        </p>

        {quality.suggestions.length ? (
          <ul className="space-y-3">
            {quality.suggestions.map((item) => (
              <li
                key={item.key}
                className="flex gap-2.5"
              >
                <HiOutlineInformationCircle
                  className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                  size={17}
                />

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                    {t(item.title)}
                  </p>

                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {t(item.detail)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <HiOutlineCheckCircle
              className="text-teal-600"
              size={17}
            />

            {isId
              ? "Belum ada saran tambahan berdasarkan aturan saat ini."
              : "No further suggestions from the current rules."}
          </p>
        )}
      </div>

      {/* ASISTEN BULLET */}
      <details className="group border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100 [&::-webkit-details-marker]:hidden">
          <span>
            {isId
              ? "Asisten penulisan bullet"
              : "Bullet writing assistant"}
          </span>

          <span className="text-xs font-normal text-neutral-500">
            {quality.bullets.length}{" "}
            {isId
              ? "contoh saran"
              : "suggestions"}{" "}
            +
          </span>
        </summary>

        <div className="mt-3 space-y-3">
          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {isId
              ? "Saran untuk deskripsi Pengalaman dan Proyek. Tidak mengubah teks secara otomatis atau membuat klaim baru."
              : "Advice for Experience and Project descriptions. It never edits your text or invents achievements."}
          </p>

          {quality.bullets.length ? (
            quality.bullets.map((bullet) => (
              <div
                key={bullet.key}
                className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <p className="truncate text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  {bullet.source}
                </p>

                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                  “{bullet.original}”
                </p>

                <ul className="space-y-1.5">
                  {bullet.tips.map(
                    (tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400"
                      >
                        <HiOutlineExclamationCircle
                          size={15}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <span>{t(tip)}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-500">
              {isId
                ? "Isi deskripsi pengalaman atau proyek untuk mendapatkan masukan."
                : "Add experience or project details to receive feedback."}
            </p>
          )}
        </div>
      </details>

      {/* KEYWORD MATCHING */}
      <details className="group border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100 [&::-webkit-details-marker]:hidden">
          <span>
            {isId
              ? "Cocokkan dengan lowongan (opsional)"
              : "Match a job description (optional)"}
          </span>

          <span className="text-xs font-normal text-neutral-500">
            +
          </span>
        </summary>

        <div className="mt-3 space-y-3">
          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {isId
              ? "Tempel deskripsi pekerjaan. Sistem mendeteksi istilah yang ada di kamus lokal, lalu mencarinya pada bagian CV yang ditampilkan."
              : "Paste a job description. A local keyword dictionary detects terms and checks visible CV sections."}
          </p>

          {/* INPUT LOWONGAN */}
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              {isId
                ? "Deskripsi lowongan"
                : "Job description"}
            </span>

            <textarea
              className={`${INPUT} min-h-[120px] resize-y leading-relaxed`}
              value={jobDescription}
              maxLength={12000}
              onChange={(event) =>
                setJobDescription(
                  event.target.value
                )
              }
              placeholder={
                isId
                  ? "Contoh: Menguasai Next.js, TypeScript, PostgreSQL, REST API, Git, dan Docker..."
                  : "Example: Requires Next.js, TypeScript, PostgreSQL, REST API, Git, and Docker..."
              }
              rows={5}
            />
          </label>

          {/* KEYWORD TAMBAHAN */}
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
              {isId
                ? "Keyword tambahan (opsional, pisahkan koma)"
                : "Additional keywords (optional, comma-separated)"}
            </span>

            <input
              className={INPUT}
              value={extraKeywords}
              maxLength={800}
              onChange={(event) =>
                setExtraKeywords(
                  event.target.value
                )
              }
              placeholder={
                isId
                  ? "Contoh: audit internal, manajemen risiko"
                  : "Example: risk management, internal audit"
              }
            />
          </label>

          {/* HASIL ANALISIS LOWONGAN */}
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            {match.percentage === null ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isId
                  ? "Belum ada keyword yang dikenali. Tambahkan persyaratan lowongan atau isi keyword tambahan."
                  : "No recognized keywords yet. Paste requirements or add custom keywords."}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {isId
                      ? "Cakupan keyword"
                      : "Keyword coverage"}
                  </p>

                  <p className="text-lg font-bold tabular-nums text-teal-700 dark:text-teal-400">
                    {match.percentage}%
                  </p>
                </div>

                <p className="text-xs text-neutral-500">
                  {match.matchedCount}/
                  {match.total}{" "}
                  {isId
                    ? "keyword terdeteksi di CV"
                    : "keywords found in the CV"}
                </p>

                {/* STATUS SETIAP KEYWORD */}
                <div className="flex flex-wrap gap-1.5">
                  {match.keywords.map((item) => (
                    <span
                      key={item.label}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${
                        item.matched
                          ? "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300"
                          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
                      }`}
                    >
                      {item.matched
                        ? "✓"
                        : "·"}{" "}
                      {item.label}
                    </span>
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {isId
                    ? "Keyword yang belum muncul bukan berarti kamu tidak mampu. Tambahkan hanya jika sesuai pengalaman sebenarnya. Persentase ini bukan skor ATS."
                    : "Missing keywords do not mean missing abilities. Add them only when truthful. This percentage is not an ATS score."}
                </p>
              </div>
            )}
          </div>

          {/* RESET INPUT LOWONGAN */}
          <button
            type="button"
            onClick={() => {
              setJobDescription("");
              setExtraKeywords("");
            }}
            className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            {isId
              ? "Bersihkan analisis lowongan"
              : "Clear job analysis"}
          </button>
        </div>
      </details>
    </section>
  );
}
