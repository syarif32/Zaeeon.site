
"use client";

import { useEffect, useState } from "react";

type OrganizationOption = {
  id: number;
  name: string;
  role: string;
  period: string;
  is_show: boolean;
};

type PreferencesResponse = {
  organizationIds?: unknown;
  error?: string;
};

const MAX_SELECTED = 3;

function sameOrder(a: number[], b: number[]) {
  return (
    a.length === b.length &&
    a.every((id, index) => id === b[index])
  );
}

export default function FeaturedOrganizationsManager() {
  const [organizations, setOrganizations] = useState<
    OrganizationOption[]
  >([]);

  const [selected, setSelected] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [message, setMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [organizationsResponse, preferencesResponse] =
          await Promise.all([
            fetch("/api/admin/organizations", {
              cache: "no-store",
            }),
            fetch("/api/admin/featured-organizations", {
              cache: "no-store",
            }),
          ]);

        if (!organizationsResponse.ok) {
          throw new Error(
            organizationsResponse.status === 404
              ? "Akses admin tidak dikenali."
              : "Gagal membaca daftar organisasi."
          );
        }

        if (!preferencesResponse.ok) {
          throw new Error(
            "Gagal membaca pengaturan organisasi unggulan."
          );
        }

        const organizationData =
          (await organizationsResponse.json()) as {
            organizations?: OrganizationOption[];
          };

        const preferences =
          (await preferencesResponse.json()) as PreferencesResponse;

        const items = Array.isArray(
          organizationData.organizations
        )
          ? organizationData.organizations
          : [];

        const ids = Array.isArray(
          preferences.organizationIds
        )
          ? preferences.organizationIds
              .filter(
                (id: unknown): id is number =>
                  typeof id === "number" &&
                  Number.isSafeInteger(id) &&
                  id > 0
              )
              .slice(0, MAX_SELECTED)
          : [];

        if (!mounted) return;

        const visibleIds = new Set(
          items
            .filter((item) => item.is_show)
            .map((item) => item.id)
        );

        setOrganizations(items);

        // Hanya organisasi yang masih aktif dapat dipilih.
        setSelected(
          ids.filter((id) => visibleIds.has(id))
        );

        // Simpan urutan asli untuk mendeteksi perubahan.
        setSaved(ids);
        setError(null);
      } catch (cause) {
        if (mounted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Gagal memuat organisasi."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const availableOrganizations =
    organizations.filter((item) => item.is_show);

  const byId = new Map(
    availableOrganizations.map((item) => [
      item.id,
      item,
    ])
  );

  const chosen = selected
    .map((id) => byId.get(id))
    .filter(
      (item): item is OrganizationOption =>
        Boolean(item)
    );

  const others = availableOrganizations.filter(
    (item) => !selected.includes(item.id)
  );

  const changed = !sameOrder(selected, saved);

  function add(id: number) {
    setSelected((previous) => {
      if (
        previous.length >= MAX_SELECTED ||
        previous.includes(id) ||
        !byId.has(id)
      ) {
        return previous;
      }

      return [...previous, id];
    });

    setMessage(null);
  }

  function remove(id: number) {
    setSelected((previous) =>
      previous.filter((value) => value !== id)
    );

    setMessage(null);
  }

  function move(
    index: number,
    direction: -1 | 1
  ) {
    setSelected((previous) => {
      const nextIndex = index + direction;

      if (
        nextIndex < 0 ||
        nextIndex >= previous.length
      ) {
        return previous;
      }

      const next = [...previous];

      [next[index], next[nextIndex]] = [
        next[nextIndex],
        next[index],
      ];

      return next;
    });

    setMessage(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/featured-organizations",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            organizationIds: selected,
          }),
        }
      );

      const result =
        (await response.json()) as PreferencesResponse;

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Sesi admin tidak dikenali. Silakan login ulang."
          );
        }

        throw new Error(
          result.error ||
            "Gagal menyimpan perubahan."
        );
      }

      setSaved([...selected]);

      setMessage(
        "Organisasi unggulan berhasil diperbarui."
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-10 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-6">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Organisasi Unggulan di Home
      </h2>

      <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Pilih maksimal 3 organisasi dari halaman About.
        Gunakan tombol panah untuk mengatur urutannya.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-neutral-500">
          Memuat organisasi...
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
              <span>Organisasi terpilih</span>
              <span>
                {selected.length}/{MAX_SELECTED}
              </span>
            </div>

            <div className="space-y-2">
              {chosen.length === 0 && (
                <p className="rounded-lg border border-dashed border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800">
                  Belum ada organisasi dipilih.
                </p>
              )}

              {chosen.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/10"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {item.role}
                      {item.period
                        ? ` · ${item.period}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={`Naikkan ${item.name}`}
                      className="rounded-md border border-neutral-200 px-2 py-1 text-sm disabled:opacity-30 dark:border-neutral-700"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      disabled={
                        index === chosen.length - 1
                      }
                      onClick={() => move(index, 1)}
                      aria-label={`Turunkan ${item.name}`}
                      className="rounded-md border border-neutral-200 px-2 py-1 text-sm disabled:opacity-30 dark:border-neutral-700"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-md border border-neutral-200 px-2 py-1 text-xs dark:border-neutral-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="mb-3 text-xs text-neutral-500">
              Organisasi lainnya
            </p>

            <div className="space-y-2">
              {others.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {item.role}
                      {item.period
                        ? ` · ${item.period}`
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      selected.length >= MAX_SELECTED
                    }
                    onClick={() => add(item.id)}
                    className="shrink-0 text-xs font-medium text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-blue-400"
                  >
                    + Pilih
                  </button>
                </div>
              ))}

              {others.length === 0 && (
                <p className="text-sm text-neutral-500">
                  Tidak ada organisasi lain yang tersedia.
                </p>
              )}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-500"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="text-sm text-emerald-600 dark:text-emerald-400"
            >
              {message}
            </p>
          )}

          <button
            type="button"
            disabled={saving || !changed}
            onClick={() => void save()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </div>
      )}
    </section>
  );
}
