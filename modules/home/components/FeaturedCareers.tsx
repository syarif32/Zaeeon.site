import Link from "next/link";
import { getLocale } from "next-intl/server";
import { HiOutlineArrowRight, HiOutlineBriefcase } from "react-icons/hi2";

import { createClient } from "@/common/utils/server";

type Career = {
  id: number;
  position: string;
  position_en: string | null;
  company: string;
  start_date: string;
  end_date: string | null;
  responsibilities: string[] | null;
  responsibilities_en: string[] | null;
};

function formatMonth(value: string | null, locale: string, current: string) {
  if (!value) return current;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function FeaturedCareers() {
  const locale = await getLocale();
  const isId = locale === "id";
  const supabase = createClient();

  // Urutan disimpan sebagai array id pada satu record pengaturan.
  const { data: settings, error: settingsError } = await supabase
    .from("home_featured_careers")
    .select("career_ids")
    .eq("id", 1)
    .maybeSingle();

  if (settingsError) {
    console.error("Failed to read featured careers settings", settingsError);
    return null;
  }

  const ids: number[] = Array.isArray(settings?.career_ids)
    ? settings.career_ids.filter((id: unknown) => Number.isSafeInteger(id)).slice(0, 4)
    : [];
  if (ids.length === 0) return null;

  const { data, error } = await supabase
    .from("careers")
    .select("id, position, position_en, company, start_date, end_date, responsibilities, responsibilities_en")
    .eq("is_show", true)
    .in("id", ids);

  if (error) {
    console.error("Failed to load featured careers", error);
    return null;
  }

  const byId = new Map((data ?? []).map((career) => [career.id, career as Career]));
  const careers = ids
    .map((id) => byId.get(id))
    .filter((career): career is Career => Boolean(career));
  if (careers.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <HiOutlineBriefcase size={21} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
            {isId ? "Pengalaman Utama" : "Featured Experience"}
          </h2>
        </div>
        <Link href="/about" className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400">
          {isId ? "Lihat Selengkapnya" : "View All"}
          <HiOutlineArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
        {careers.map((career) => {
          const localizedResponsibilities =
            !isId && Array.isArray(career.responsibilities_en) && career.responsibilities_en.some((item) => typeof item === "string" && item.trim())
              ? career.responsibilities_en
              : career.responsibilities;
          const description = Array.isArray(localizedResponsibilities)
            ? localizedResponsibilities.find((item) => typeof item === "string" && item.trim().length > 0)
            : null;
          const position = !isId && career.position_en?.trim()
            ? career.position_en
            : career.position;

          return (
            <article key={career.id} className="group flex h-full min-w-0 flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-blue-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-blue-700 sm:p-6">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {formatMonth(career.start_date, locale, "")} – {formatMonth(career.end_date, locale, isId ? "Sekarang" : "Present")}
              </div>
              <h3 className="break-words text-base font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400 sm:text-lg">
                {position}
              </h3>
              <p className="mt-1.5 break-words text-sm font-medium leading-relaxed text-neutral-600 dark:text-neutral-400">
                {career.company}
              </p>
              {description && (
                <p className="mt-4 flex-1 whitespace-normal break-words text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {description}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
