import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
} from "react-icons/hi2";

import { createClient } from "@/common/utils/server";

type Certificate = {
  id: number;
  name: string;
  slug: string;
  issuing_organization: string | null;
  issue_date: string | null;
};

export default async function FeaturedCertificates() {
  noStore();
  const locale = await getLocale();
  const isId = locale === "id";
  const supabase = createClient();

  // prioritas pilihan admin. jika belum ada konfigurasi, tampilkan 2 terbaru.
  const { data: preference, error: preferenceError } = await supabase
    .from("home_featured_achievements")
    .select("achievement_ids")
    .eq("id", 1)
    .maybeSingle();

  if (preferenceError) {
    console.error("Gagal membaca sertifikat unggulan:", preferenceError.message);
  }

  const selectedIds: number[] = Array.isArray(preference?.achievement_ids)
    ? preference.achievement_ids.filter(
        (id: unknown): id is number =>
          typeof id === "number" && Number.isSafeInteger(id) && id > 0,
      ).slice(0, 2)
    : [];

  let certificates: Certificate[] = [];

  if (preference && !preferenceError) {
    if (selectedIds.length > 0) {
      const { data, error } = await supabase
        .from("achievements")
        .select("id, name, slug, issuing_organization, issue_date")
        .eq("is_show", true)
        .in("id", selectedIds);

      if (error) console.error("Gagal mengambil sertifikat pilihan:", error.message);
      const rows = (data ?? []) as Certificate[];
      const byId = new Map(rows.map((item) => [item.id, item]));
      certificates = selectedIds
        .map((id) => byId.get(id))
        .filter((item): item is Certificate => Boolean(item));
    }
  } else {
    const { data, error } = await supabase
      .from("achievements")
      .select("id, name, slug, issuing_organization, issue_date")
      .eq("is_show", true)
      .order("issue_date", { ascending: false })
      .limit(2);
    if (error) console.error("Gagal mengambil sertifikat terbaru:", error.message);
    certificates = (data ?? []) as Certificate[];
  }

  return (
    <section className="space-y-6">
      {/* heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
            <HiOutlineAcademicCap
              size={21}
              className="text-teal-600 dark:text-teal-400"
            />
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
            {isId
              ? "Sertifikat Pilihan"
              : "Featured Certificates"}
          </h2>
        </div>

        <Link
          href="/achievements"
          className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-teal-600 dark:text-neutral-400 dark:hover:text-teal-400"
        >
          {isId ? "Lihat Semua" : "View All"}

          <HiOutlineArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* daftar sertifikat */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {certificates.map((cert) => {
            // nama gambar mengikuti slug di supabase storage
            const { data: imageData } = supabase.storage
              .from("achievements")
              .getPublicUrl(`${cert.slug}.webp`);

            const year = cert.issue_date
              ? cert.issue_date.slice(0, 4)
              : null;

            return (
              <Link
                key={cert.id}
                href="/achievements"
                className="group flex h-full min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-colors duration-300 hover:border-teal-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-teal-700 sm:flex-row sm:items-start"
              >
                {/* thumbnail */}
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 sm:h-24 sm:w-32">
                  <img
                    src={imageData.publicUrl}
                    alt={cert.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* informasi */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="break-words text-sm font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-teal-600 dark:text-neutral-100 dark:group-hover:text-teal-400">
                    {cert.name}
                  </h3>

                  <p className="mt-2 break-words text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {cert.issuing_organization}
                  </p>

                  {year && (
                    <div className="mt-3">
                      <span className="inline-flex rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        {year}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-200 p-5 text-sm text-neutral-500 dark:border-neutral-800">
          {isId
            ? "Belum ada sertifikat yang ditampilkan."
            : "No certificates available yet."}
        </p>
      )}
    </section>
  );
}
