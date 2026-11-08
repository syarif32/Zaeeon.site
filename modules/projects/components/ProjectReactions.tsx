
"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

type Reaction = "love" | "fire" | "idea";

type Summary = {
  counts: Record<Reaction, number>;
  selected: Reaction | null;
};

const OPTIONS: {
  id: Reaction;
  emoji: string;
  idLabel: string;
  enLabel: string;
}[] = [
  {
    id: "love",
    emoji: "❤️",
    idLabel: "Suka",
    enLabel: "Love",
  },
  {
    id: "fire",
    emoji: "🔥",
    idLabel: "Keren",
    enLabel: "Awesome",
  },
  {
    id: "idea",
    emoji: "💡",
    idLabel: "Inspiratif",
    enLabel: "Inspiring",
  },
];

const EMPTY: Summary = {
  counts: { love: 0, fire: 0, idea: 0 },
  selected: null,
};

export default function ProjectReactions({
  slug,
}: {
  slug: string;
}) {
  const locale = useLocale();
  const isId = locale === "id";

  const [summary, setSummary] = useState<Summary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/project-reactions?slug=${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
            credentials: "same-origin",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Gagal memuat reaksi");
        }

        const data: Summary = await response.json();

        if (!controller.signal.aborted) {
          setSummary(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [slug]);

  async function handleReaction(reaction: Reaction) {
    if (saving || loading) return;

    const nextReaction =
      summary.selected === reaction ? null : reaction;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/project-reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          slug,
          reaction: nextReaction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Gagal menyimpan reaksi"
        );
      }

      setSummary(data as Summary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {isId
            ? "Apa pendapatmu tentang proyek ini?"
            : "What do you think about this project?"}
        </h3>

        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {isId
            ? "Pilih satu reaksi. Klik lagi untuk membatalkan."
            : "Choose one reaction. Click again to remove it."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => {
          const active =
            summary.selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={loading || saving}
              onClick={() => handleReaction(option.id)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors disabled:cursor-wait disabled:opacity-60 ${
                active
                  ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300"
                  : "border-neutral-200 text-neutral-600 hover:border-teal-400 dark:border-neutral-800 dark:text-neutral-300"
              }`}
            >
              <span aria-hidden="true">
                {option.emoji}
              </span>

              <span>
                {isId
                  ? option.idLabel
                  : option.enLabel}
              </span>

              <span className="text-xs tabular-nums opacity-70">
                {loading
                  ? "..."
                  : summary.counts[option.id]}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}
