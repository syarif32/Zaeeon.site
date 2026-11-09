
"use client";

import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import type {
  Organization,
  OrganizationInput,
  OrganizationPhoto,
} from "@/common/types/organizations";

const EMPTY: OrganizationInput = {
  name: "",
  role: "",
  period: "",
  location: "",
  description: "",
  logo_url: "",
  photos: [],
  is_show: true,
  sort_order: 0,
};

const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-blue-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

const secondary =
  "rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800";

export default function OrganizationsAdminPage() {
  const [auth, setAuth] = useState<
    "checking" | "allowed" | "denied" | "error"
  >("checking");

  const [items, setItems] = useState<Organization[]>([]);
  const [editingId, setEditingId] = useState<number | null>(
    null
  );

  const [draft, setDraft] = useState<OrganizationInput>({
    ...EMPTY,
    photos: [],
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/admin/organizations",
        { cache: "no-store" }
      );

      if (response.status === 404) {
        setAuth("denied");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Tidak dapat memuat organisasi"
        );
      }

      const data = (await response.json()) as {
        organizations: Organization[];
      };

      setItems(data.organizations);
      setAuth("allowed");
    } catch (cause) {
      console.error(cause);
      setAuth("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function setField<K extends keyof OrganizationInput>(
    key: K,
    value: OrganizationInput[K]
  ) {
    setDraft((old) => ({
      ...old,
      [key]: value,
    }));
  }

  function edit(item: Organization) {
    setEditingId(item.id);

    setDraft({
      name: item.name,
      role: item.role,
      period: item.period,
      location: item.location,
      description: item.description,
      logo_url: item.logo_url,
      photos: Array.isArray(item.photos)
        ? item.photos
        : [],
      is_show: item.is_show,
      sort_order: item.sort_order,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function reset() {
    setEditingId(null);
    setDraft({
      ...EMPTY,
      photos: [],
    });
    setMessage("");
  }

  async function uploadPhotos(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.currentTarget.files ?? []
    );

    event.currentTarget.value = "";

    if (!files.length) return;

    if (files.length + draft.photos.length > 20) {
      setMessage(
        "Maksimal 20 foto per organisasi."
      );
      return;
    }

    setUploading(true);
    setMessage("");

    const added: OrganizationPhoto[] = [];

    try {
      for (const file of files) {
        const payload = new FormData();
        payload.append("file", file);

        const response = await fetch(
          "/api/admin/organizations/upload",
          {
            method: "POST",
            body: payload,
          }
        );

        const result = (await response.json()) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || !result.url) {
          throw new Error(
            result.error || "Upload gagal"
          );
        }

        added.push({
          url: result.url,
          caption: "",
        });
      }

      setMessage(
        `${added.length} foto berhasil diunggah.`
      );
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Upload gagal."
      );
    } finally {
      if (added.length) {
        setDraft((old) => ({
          ...old,
          photos: [...old.photos, ...added],
        }));
      }

      setUploading(false);
    }
  }

  async function save(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (uploading) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/organizations",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            editingId
              ? { ...draft, id: editingId }
              : draft
          ),
        }
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error || "Gagal menyimpan"
        );
      }

      reset();
      setMessage(
        "Organisasi berhasil disimpan."
      );

      await load();
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Gagal menyimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Organization) {
    if (
      !window.confirm(
        `Hapus data ${item.name}? Foto yang telah diunggah tidak otomatis dihapus dari Storage.`
      )
    ) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/organizations",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: item.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Gagal menghapus organisasi"
        );
      }

      await load();

      setMessage("Organisasi dihapus.");

      if (editingId === item.id) {
        reset();
      }
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Gagal menghapus."
      );
    }
  }

  if (auth === "checking") {
    return (
      <div className="p-8 text-sm text-neutral-500">
        Memeriksa akses...
      </div>
    );
  }

  if (auth === "denied") {
    notFound();
  }

  if (auth === "error") {
    return (
      <div className="p-8 text-sm text-red-500">
        Gagal membuka admin.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => void load()}
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Organisasi & Komunitas
        </h1>

        <p className="text-sm text-neutral-500">
          Kelola organisasi, jabatan, dan foto dokumentasi
          yang tampil di About.
        </p>
      </header>

      <form
        onSubmit={(event) => void save(event)}
        className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40"
      >
        <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">
          {editingId
            ? "Edit organisasi"
            : "Tambah organisasi"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            Nama organisasi *
            <input
              required
              maxLength={120}
              className={fieldClass}
              value={draft.name}
              onChange={(e) =>
                setField("name", e.target.value)
              }
              placeholder="Google Developer Groups"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            Posisi / Peran *
            <input
              required
              maxLength={120}
              className={fieldClass}
              value={draft.role}
              onChange={(e) =>
                setField("role", e.target.value)
              }
              placeholder="Anggota aktif"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            Periode
            <input
              maxLength={100}
              className={fieldClass}
              value={draft.period}
              onChange={(e) =>
                setField("period", e.target.value)
              }
              placeholder="2023 – Sekarang"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            Lokasi
            <input
              maxLength={120}
              className={fieldClass}
              value={draft.location}
              onChange={(e) =>
                setField("location", e.target.value)
              }
              placeholder="Semarang"
            />
          </label>

          <label className="space-y-1.5 text-sm sm:col-span-2">
            Deskripsi
            <textarea
              maxLength={3000}
              className={`${fieldClass} min-h-24 resize-y`}
              value={draft.description}
              onChange={(e) =>
                setField("description", e.target.value)
              }
              placeholder="Ceritakan kontribusi atau kegiatan yang benar-benar diikuti."
            />
          </label>

          <label className="space-y-1.5 text-sm sm:col-span-2">
            URL logo (opsional)
            <input
              maxLength={1000}
              className={fieldClass}
              value={draft.logo_url}
              onChange={(e) =>
                setField("logo_url", e.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label className="space-y-1.5 text-sm">
            Urutan tampil
            <input
              type="number"
              min={0}
              max={10000}
              className={fieldClass}
              value={draft.sort_order}
              onChange={(e) =>
                setField(
                  "sort_order",
                  Number(e.target.value)
                )
              }
            />
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_show}
              onChange={(e) =>
                setField("is_show", e.target.checked)
              }
            />
            Tampilkan di About
          </label>
        </div>

        <div className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h3 className="text-sm font-semibold">
            Foto dokumentasi ({draft.photos.length}/20)
          </h3>

          <p className="text-xs text-neutral-500">
            JPG, PNG, WebP; maksimal 6 MB per foto.
            Foto pertama menjadi cover galeri.
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={
              uploading ||
              saving ||
              draft.photos.length >= 20
            }
            onChange={(event) =>
              void uploadPhotos(event)
            }
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-600 dark:text-neutral-300 dark:file:bg-blue-500/10"
          />

          {uploading && (
            <p
              role="status"
              className="text-xs text-neutral-500"
            >
              Mengunggah foto...
            </p>
          )}

          {draft.photos.map((photo, index) => (
            <div
              key={`${photo.url}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 p-2 dark:border-neutral-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="h-16 w-20 shrink-0 rounded-lg object-cover"
              />

              <input
                className={fieldClass}
                maxLength={300}
                placeholder="Caption: nama kegiatan / tahun"
                value={photo.caption}
                onChange={(e) =>
                  setDraft((old) => ({
                    ...old,
                    photos: old.photos.map((p, i) =>
                      i === index
                        ? {
                            ...p,
                            caption: e.target.value,
                          }
                        : p
                    ),
                  }))
                }
              />

              <button
                type="button"
                className={`${secondary} shrink-0`}
                onClick={() =>
                  setDraft((old) => ({
                    ...old,
                    photos: old.photos.filter(
                      (_, i) => i !== index
                    ),
                  }))
                }
              >
                Hapus
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : editingId
              ? "Simpan perubahan"
              : "Tambah organisasi"}
          </button>

          <button
            type="button"
            onClick={reset}
            className={secondary}
          >
            Kosongkan form
          </button>
        </div>

        {message && (
          <p
            role="status"
            className="text-sm text-neutral-600 dark:text-neutral-300"
          >
            {message}
          </p>
        )}
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">
          Daftar organisasi ({items.length})
        </h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-neutral-800 dark:text-neutral-100">
                {item.name}
              </p>

              <p className="text-xs text-neutral-500">
                {item.role} ·{" "}
                {item.photos?.length ?? 0} foto ·{" "}
                {item.is_show
                  ? "Tampil"
                  : "Disembunyikan"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className={secondary}
                onClick={() => edit(item)}
              >
                Edit
              </button>

              <button
                type="button"
                className={`${secondary} text-red-500`}
                onClick={() => void remove(item)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
