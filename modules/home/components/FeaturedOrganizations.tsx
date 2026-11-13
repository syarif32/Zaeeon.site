
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import {
  HiOutlineArrowRight,
  HiOutlineUserGroup,
} from "react-icons/hi2";

import { createClient } from "@/common/utils/server";
import { localizeOrganizationPeriod } from "@/common/utils/organizationPeriod";

type FeaturedOrganization = {
  id: number;
  name: string;

  role: string;
  role_en: string | null;

  period: string;

  location: string;
  location_en: string | null;

  description: string;
  description_en: string | null;

  logo_url: string;
  photos: unknown;
};

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

function getCoverPhoto(
  organization: FeaturedOrganization
): string | null {
  if (Array.isArray(organization.photos)) {
    for (const item of organization.photos) {
      if (
        item &&
        typeof item === "object" &&
        "url" in item &&
        typeof item.url === "string" &&
        validImageUrl(item.url)
      ) {
        return item.url;
      }
    }
  }

  if (
    organization.logo_url &&
    validImageUrl(organization.logo_url)
  ) {
    return organization.logo_url;
  }

  return null;
}

export default async function FeaturedOrganizations() {
  // Memastikan pemilihan terbaru dari admin dibaca ulang
  noStore();

  const locale = await getLocale();
  const isId = locale === "id";
  const t = await getTranslations("HomePage.organization");
  const aboutHref = `/${locale}/about#organizations`;

  const supabase = createClient();

  const { data: settings, error: settingsError } =
    await supabase
      .from("home_featured_organizations")
      .select("organization_ids")
      .eq("id", 1)
      .maybeSingle();

  if (settingsError) {
    console.error(
      "Gagal membaca pengaturan organisasi unggulan:",
      settingsError.message
    );
  }

  // Urutan sesuai pilihan admin
  const selectedIds: number[] = Array.isArray(
    settings?.organization_ids
  )
    ? settings.organization_ids
        .filter(
          (id: unknown): id is number =>
            typeof id === "number" &&
            Number.isSafeInteger(id) &&
            id > 0
        )
        .slice(0, 3)
    : [];

  const query = supabase
    .from("organizations")
    .select(
      "id,name,role,role_en,period,location,location_en,description,description_en,logo_url,photos"
    )
    .eq("is_show", true);

  // Gunakan organisasi publik dari About jika belum ada pilihan admin.
  const { data, error } =
    selectedIds.length > 0
      ? await query.in("id", selectedIds)
      : await query
          .order("sort_order", { ascending: true })
          .order("id", { ascending: false })
          .limit(3);

  if (error) {
    console.error(
      "Gagal mengambil organisasi unggulan:",
      error.message
    );

    return null;
  }

  const rows = (data ?? []) as FeaturedOrganization[];

  const byId = new Map(
    rows.map((item) => [item.id, item])
  );

  const organizations =
    selectedIds.length === 0
      ? rows
      : selectedIds
          .map((id) => byId.get(id))
          .filter(
            (item): item is FeaturedOrganization =>
              Boolean(item)
          );

  if (organizations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* heading mengikuti Featured Careers */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <HiOutlineUserGroup
              size={21}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
            {t("title")}
          </h2>
        </div>

        <Link
          href={aboutHref}
          className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
        >
          {t("view_all")}

          <HiOutlineArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* maksimal tiga kartu */}
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => {
          const role =
            !isId && organization.role_en?.trim()
              ? organization.role_en
              : organization.role;

          const description =
            !isId &&
            organization.description_en?.trim()
              ? organization.description_en
              : organization.description;

          const location =
            !isId &&
            organization.location_en?.trim()
              ? organization.location_en
              : organization.location;

          const cover = getCoverPhoto(organization);

          return (
            <Link
              key={organization.id}
              href={aboutHref}
              className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors duration-300 hover:border-blue-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-blue-700"
            >
              {/* cover dokumentasi kegiatan */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt={`${organization.name} - ${t("documentation_alt")}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
                    <HiOutlineUserGroup size={42} />
                  </div>
                )}
              </div>

              {/* detail organisasi */}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {localizeOrganizationPeriod(organization.period, locale)}
                </p>

                <h3 className="mt-2 break-words text-base font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
                  {organization.name}
                </h3>

                <p className="mt-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {role}
                </p>

                {location && (
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    {location}
                  </p>
                )}

                {description && (
                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  {t("view_documentation")}

                  <HiOutlineArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
