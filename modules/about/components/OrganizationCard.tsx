
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";

import {
  HiOutlineUserGroup,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

import SpotlightCard from "@/common/components/elements/SpotlightCard";

import type {
  Organization,
  OrganizationPhoto,
} from "@/common/types/organizations";

import { localizeOrganizationPeriod } from "@/common/utils/organizationPeriod";

// memastikan URL gambar menggunakan path lokal atau HTTPS
function validImageUrl(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }

  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export default function OrganizationCard({
  organization,
}: {
  organization: Organization;
}) {
  const locale = useLocale();
  const isId = locale === "id";

  const [active, setActive] = useState<number | null>(null);

  // menyesuaikan posisi dengan bahasa halaman
  const role =
    !isId && organization.role_en?.trim()
      ? organization.role_en
      : organization.role;

  // menyesuaikan deskripsi dengan bahasa halaman
  const description =
    !isId && organization.description_en?.trim()
      ? organization.description_en
      : organization.description;

  // menyesuaikan lokasi dengan bahasa halaman
  const location =
    !isId && organization.location_en?.trim()
      ? organization.location_en
      : organization.location;

  // mengubah "sekarang" menjadi "now" pada halaman english
  const period = localizeOrganizationPeriod(
    organization.period,
    locale
  );

  // memilih caption foto sesuai bahasa
  const captionFor = (photo: OrganizationPhoto): string =>
    !isId && photo.caption_en?.trim()
      ? photo.caption_en
      : photo.caption;

  // memvalidasi foto sebelum ditampilkan
  const photos: OrganizationPhoto[] = Array.isArray(
    organization.photos
  )
    ? organization.photos.filter(
        (photo): photo is OrganizationPhoto =>
          !!photo &&
          typeof photo.url === "string" &&
          validImageUrl(photo.url) &&
          typeof photo.caption === "string"
      )
    : [];

  // menangani galeri fullscreen dan shortcut keyboard
  useEffect(() => {
    if (active === null) return;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }

      if (event.key === "ArrowLeft") {
        setActive((current) =>
          current === null
            ? null
            : (current - 1 + photos.length) % photos.length
        );
      }

      if (event.key === "ArrowRight") {
        setActive((current) =>
          current === null
            ? null
            : (current + 1) % photos.length
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, photos.length]);

  return (
    <SpotlightCard className="min-w-0 space-y-4 p-5 sm:p-6">
      {/* INFORMASI UTAMA ORGANISASI */}
      <div className="flex items-start gap-4">
        {organization.logo_url &&
        validImageUrl(organization.logo_url) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organization.logo_url}
            alt={`Logo ${organization.name}`}
            className="h-12 w-12 shrink-0 rounded-xl border border-neutral-200 bg-white object-contain p-1 dark:border-neutral-700"
            loading="lazy"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-blue-500 dark:border-neutral-800 dark:bg-neutral-900">
            <HiOutlineUserGroup size={22} />
          </div>
        )}

        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 sm:text-base">
            {role}
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {organization.name}
          </p>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {[period, location].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* DESKRIPSI ORGANISASI */}
      {description && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}

      {/* GALERI FOTO DOKUMENTASI */}
      {photos.length > 0 && (
        <div className="space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {isId ? "Dokumentasi kegiatan" : "Event documentation"} ·{" "}
            {photos.length} {isId ? "foto" : "photos"}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.slice(0, 4).map((photo, index) => (
              <button
                key={`${photo.url}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${
                  isId ? "Lihat foto" : "View photo"
                } ${index + 1}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={
                    captionFor(photo) ||
                    `${organization.name} - ${index + 1}`
                  }
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* indikator tambahan foto apabila lebih dari 4 */}
                {index === 3 && photos.length > 4 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                    +{photos.length - 4}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FULLSCREEN GALERI */}
      {active !== null &&
        active < photos.length &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-3 sm:p-8"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setActive(null);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={
                isId
                  ? "Galeri dokumentasi"
                  : "Documentation gallery"
              }
              className="flex h-full w-full max-w-5xl flex-col"
            >
              {/* HEADER GALERI */}
              <div className="flex shrink-0 items-center justify-between gap-3 py-2 text-sm text-white">
                <span className="truncate">
                  {organization.name} · {active + 1}/{photos.length}
                </span>

                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="rounded-lg p-2 hover:bg-white/15"
                  aria-label={isId ? "Tutup" : "Close"}
                >
                  <HiOutlineXMark size={22} />
                </button>
              </div>

              {/* FOTO UTAMA DAN NAVIGASI */}
              <div className="relative flex min-h-0 flex-1 items-center justify-center gap-2">
                {photos.length > 1 && (
                  <button
                    type="button"
                    aria-label={
                      isId ? "Foto sebelumnya" : "Previous photo"
                    }
                    onClick={() =>
                      setActive(
                        (active - 1 + photos.length) % photos.length
                      )
                    }
                    className="shrink-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  >
                    <HiOutlineChevronLeft size={20} />
                  </button>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[active].url}
                  alt={
                    captionFor(photos[active]) ||
                    organization.name
                  }
                  className="max-h-full min-w-0 max-w-full object-contain"
                />

                {photos.length > 1 && (
                  <button
                    type="button"
                    aria-label={
                      isId ? "Foto berikutnya" : "Next photo"
                    }
                    onClick={() =>
                      setActive((active + 1) % photos.length)
                    }
                    className="shrink-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  >
                    <HiOutlineChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* CAPTION MULTIBAHASA */}
              <p className="min-h-9 py-3 text-center text-xs leading-relaxed text-neutral-300">
                {captionFor(photos[active])}
              </p>
            </div>
          </div>,
          document.body
        )}
    </SpotlightCard>
  );
}
