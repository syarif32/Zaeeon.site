"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Achievement = {
  id: number;
  name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  is_show: boolean;
};

type PreferencesResponse = {
  achievementIds?: unknown;
  error?: string;
};

function sameOrder(a: number[], b: number[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export default function FeaturedAchievementsManager() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error("Konfigurasi Supabase tidak tersedia");

        const db = createClient(url, key);
        const [prefResponse, achievementsResponse] = await Promise.all([
          fetch("/api/admin/featured-achievements", { cache: "no-store" }),
          db
            .from("achievements")
            .select("id, name, issuing_organization, issue_date, is_show")
            .order("issue_date", { ascending: false }),
        ]);

        const pref = (await prefResponse.json()) as PreferencesResponse;
        if (!prefResponse.ok) throw new Error(pref.error || "Gagal membaca pengaturan");
        if (achievementsResponse.error) throw achievementsResponse.error;

        const ids = Array.isArray(pref.achievementIds)
          ? pref.achievementIds.filter(
              (id: unknown): id is number =>
                typeof id === "number" && Number.isSafeInteger(id) && id > 0,
            )
          : [];

        if (!mounted) return;
        setAchievements((achievementsResponse.data ?? []) as Achievement[]);
        setSelected(ids);
        setSaved(ids);
        setError(null);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Gagal memuat sertifikat");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => { mounted = false; };
  }, []);

  const byId = new Map(achievements.map((item) => [item.id, item]));
  const chosen = selected.map((id) => byId.get(id)).filter((item): item is Achievement => Boolean(item));
  const others = achievements.filter((item) => item.is_show && !selected.includes(item.id));
  const changed = !sameOrder(selected, saved);

  function add(id: number) {
    setSelected((prev) => (prev.length >= 2 || prev.includes(id) ? prev : [...prev, id]));
    setMessage(null);
  }

  function remove(id: number) {
    setSelected((prev) => prev.filter((value) => value !== id));
    setMessage(null);
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setMessage(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/featured-achievements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ achievementIds: selected }),
      });

      const payload = (await res.json()) as PreferencesResponse;
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Sesi Admin tidak dikenali server. Periksa ADMIN_EMAIL dan login ulang.");
        }
        throw new Error(payload.error || "Gagal menyimpan perubahan");
      }

      setSaved([...selected]);
      setMessage("Perubahan sertifikat unggulan berhasil disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-10 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-6">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Sertifikat Unggulan di Home
      </h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Pilih maksimal 2 sertifikat. Gunakan tombol panah untuk mengatur urutannya.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-neutral-500">Memuat sertifikat...</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
              <span>Sertifikat terpilih</span>
              <span>{selected.length}/2</span>
            </div>
            <div className="space-y-2">
              {chosen.length === 0 && (
                <p className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-500">
                  Belum ada sertifikat yang dipilih.
                </p>
              )}
              {chosen.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-blue-900/60 bg-blue-950/10 p-3">
                  <span className="w-4 shrink-0 text-center text-xs font-semibold text-blue-500">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.name}</p>
                    <p className="break-words text-xs text-neutral-500">{item.issuing_organization}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Naikkan ${item.name}`} className="rounded-md border border-neutral-700 px-2 py-1 text-sm disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === chosen.length - 1} aria-label={`Turunkan ${item.name}`} className="rounded-md border border-neutral-700 px-2 py-1 text-sm disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => remove(item.id)} className="rounded-md border border-neutral-700 px-2 py-1 text-xs">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="mb-3 text-xs text-neutral-500">Sertifikat lainnya</p>
            <div className="space-y-2">
              {others.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.name}</p>
                    <p className="break-words text-xs text-neutral-500">{item.issuing_organization}</p>
                  </div>
                  <button type="button" onClick={() => add(item.id)} disabled={selected.length >= 2} className="shrink-0 text-xs font-medium text-blue-500 disabled:opacity-30">+ Pilih</button>
                </div>
              ))}
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-500">{message}</p>}
          <button
            type="button"
            disabled={saving || loading || !changed}
            onClick={() => void save()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}
    </section>
  );
}
