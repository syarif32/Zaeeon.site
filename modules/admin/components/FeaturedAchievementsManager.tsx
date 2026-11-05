
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Achievement = {
  id: number;
  name: string;
  issuing_organization: string | null;
  is_show: boolean;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function FeaturedAchievementsManager() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [response, result] = await Promise.all([
          fetch("/api/admin/featured-achievements", {
            cache: "no-store",
          }),
          supabase
            .from("achievements")
            .select("id, name, issuing_organization, is_show")
            .order("issue_date", { ascending: false }),
        ]);

        if (!response.ok) {
          throw new Error(
            `Gagal membaca pengaturan (HTTP ${response.status})`
          );
        }

        const preferences = await response.json();

        if (result.error) {
          throw new Error(result.error.message);
        }

        const ids: number[] = Array.isArray(preferences.achievementIds)
          ? preferences.achievementIds.filter(
              (id: unknown): id is number =>
                typeof id === "number" &&
                Number.isSafeInteger(id) &&
                id > 0
            )
          : [];

        if (!active) return;

        setAchievements(result.data || []);
        setSelected(ids);
        setSaved(ids);
        setError("");
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat sertifikat"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const selectedAchievements = selected
    .map((id) => achievements.find((item) => item.id === id))
    .filter((item): item is Achievement => Boolean(item));

  const otherAchievements = achievements.filter(
    (item) => item.is_show && !selected.includes(item.id)
  );

  const hasChanges =
    JSON.stringify(selected) !== JSON.stringify(saved);

  const addAchievement = (id: number) => {
    if (selected.length >= 2 || selected.includes(id)) return;

    setSelected((prev) => [...prev, id]);
    setError("");
    setSuccess("");
  };

  const removeAchievement = (id: number) => {
    setSelected((prev) => prev.filter((item) => item !== id));
    setError("");
    setSuccess("");
  };

  const moveAchievement = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= selected.length) return;

    setSelected((prev) => {
      const result = [...prev];

      [result[index], result[newIndex]] = [
        result[newIndex],
        result[index],
      ];

      return result;
    });

    setSuccess("");
  };

  const saveChanges = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/admin/featured-achievements",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            achievementIds: selected,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Sesi Admin tidak dikenali server. Periksa autentikasi Admin."
            : result.error || "Gagal menyimpan perubahan"
        );
      }

      setSaved([...selected]);
      setSuccess("Sertifikat unggulan berhasil disimpan!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-10 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-6">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Sertifikat Unggulan di Home
      </h2>

      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Pilih maksimal 2 sertifikat yang ingin ditampilkan di Home.
        Gunakan tombol panah untuk mengatur urutannya.
      </p>

      {loading ? (
        <p className="mt-6 animate-pulse text-sm text-neutral-500">
          Memuat data sertifikat...
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {/* sertifikat terpilih */}
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
              <span>Sertifikat terpilih</span>
              <span>{selected.length}/2</span>
            </div>

            <div className="space-y-2">
              {selectedAchievements.length === 0 && (
                <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700">
                  Belum ada sertifikat yang dipilih.
                </div>
              )}

              {selectedAchievements.map((cert, index) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-semibold text-blue-500">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {cert.name}
                    </p>

                    <p className="mt-0.5 break-words text-xs text-neutral-500">
                      {cert.issuing_organization}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveAchievement(index, -1)}
                      disabled={index === 0}
                      aria-label={`Naikkan ${cert.name}`}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100 disabled:opacity-30 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => moveAchievement(index, 1)}
                      disabled={index === selected.length - 1}
                      aria-label={`Turunkan ${cert.name}`}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100 disabled:opacity-30 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => removeAchievement(cert.id)}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* sertifikat lainnya */}
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="mb-3 text-xs text-neutral-500">
              Sertifikat lainnya
            </p>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {otherAchievements.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {cert.name}
                    </p>

                    <p className="mt-0.5 break-words text-xs text-neutral-500">
                      {cert.issuing_organization}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => addAchievement(cert.id)}
                    disabled={selected.length >= 2}
                    className="shrink-0 text-xs font-medium text-blue-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    + Pilih
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* feedback */}
          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-emerald-500">
              {success}
            </p>
          )}

          {/* simpan */}
          <button
            type="button"
            onClick={saveChanges}
            disabled={saving || !hasChanges}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}
    </section>
  );
}
