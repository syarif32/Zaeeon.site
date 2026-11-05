"use client";

import { useEffect, useMemo, useState } from "react";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi2";

type Career = {
  id: number;
  position: string;
  company: string;
  is_show?: boolean | null;
};

type Props = { careers: Career[] };

const ENDPOINT = "/api/admin/featured-careers";

export default function FeaturedCareersManager({ careers }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(ENDPOINT, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gagal mengambil data");
        const ids = Array.isArray(data.careerIds) ? data.careerIds : [];
        setSelectedIds(ids);
        setSavedIds(ids);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Gagal memuat pengaturan");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const visibleCareers = useMemo(
    () => careers.filter((career) => career.is_show !== false),
    [careers],
  );

  const selectedCareers = selectedIds
    .map((id) => careers.find((career) => career.id === id) ?? {
      id,
      position: `Pengalaman #${id} tidak ditemukan`,
      company: "Hapus pilihan ini sebelum menyimpan",
      is_show: false,
    });

  const otherCareers = visibleCareers.filter(
    (career) => !selectedIds.includes(career.id),
  );

  const changed = JSON.stringify(selectedIds) !== JSON.stringify(savedIds);

  function toggle(id: number) {
    setMessage("");
    setError("");
    setSelectedIds((previous) => {
      if (previous.includes(id)) return previous.filter((item) => item !== id);
      if (previous.length >= 4) return previous;
      return [...previous, id];
    });
  }

  function move(index: number, direction: -1 | 1) {
    setSelectedIds((previous) => {
      const destination = index + direction;
      if (destination < 0 || destination >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
    setMessage("");
  }

  async function save() {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerIds: selectedIds }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan perubahan");
      setSavedIds([...selectedIds]);
      setMessage("Pilihan dan urutan tersimpan. Periksa halaman Home.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-10 space-y-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Pengalaman Unggulan di Home
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Pilih maksimal 4 pengalaman. Gunakan tombol panah untuk mengatur urutannya.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Memuat pilihan unggulan...</p>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Pengalaman terpilih</span>
            <span>{selectedIds.length}/4</span>
          </div>

          <div className="space-y-2">
            {selectedCareers.length === 0 && (
              <p className="rounded-lg border border-dashed border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-700">
                Belum ada pengalaman yang dipilih.
              </p>
            )}
            {selectedCareers.map((career, index) => (
              <div key={career.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/40 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                <span className="w-6 shrink-0 text-center text-xs font-semibold text-blue-600 dark:text-blue-400">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">{career.position}</p>
                  <p className="break-words text-xs text-neutral-500 dark:text-neutral-400">{career.company}</p>
                  {career.is_show === false && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Tidak ditampilkan publik; hapus pilihan ini.</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Naikkan ${career.position}`} className="rounded-md border border-neutral-200 p-2 disabled:opacity-30 dark:border-neutral-700"><HiOutlineArrowUp /></button>
                  <button type="button" disabled={index === selectedCareers.length - 1} onClick={() => move(index, 1)} aria-label={`Turunkan ${career.position}`} className="rounded-md border border-neutral-200 p-2 disabled:opacity-30 dark:border-neutral-700"><HiOutlineArrowDown /></button>
                  <button type="button" onClick={() => toggle(career.id)} className="rounded-md border border-neutral-200 px-2 py-2 text-xs hover:text-red-600 dark:border-neutral-700">Hapus</button>
                </div>
              </div>
            ))}
          </div>

          {otherCareers.length > 0 && (
            <div className="space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <p className="text-xs font-medium text-neutral-500">Pengalaman lainnya</p>
              {otherCareers.map((career) => (
                <button
                  key={career.id}
                  type="button"
                  disabled={selectedIds.length >= 4}
                  onClick={() => toggle(career.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-left transition-colors hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:hover:border-blue-800"
                >
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-medium">{career.position}</span>
                    <span className="block break-words text-xs text-neutral-500">{career.company}</span>
                  </span>
                  <span className="shrink-0 text-xs text-blue-600 dark:text-blue-400">+ Pilih</span>
                </button>
              ))}
            </div>
          )}

          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
          <button
            type="button"
            onClick={save}
            disabled={saving || !changed || Boolean(error)}
            className="min-h-10 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </>
      )}
    </section>
  );
}
