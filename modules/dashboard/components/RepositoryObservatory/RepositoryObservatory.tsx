"use client";

import useSWR from "swr";
import { useLocale } from "next-intl";
import { FiExternalLink, FiGitBranch, FiGithub, FiStar } from "react-icons/fi";

import SectionHeading from "@/common/components/elements/SectionHeading";
import SectionSubHeading from "@/common/components/elements/SectionSubHeading";
import EmptyState from "@/common/components/elements/EmptyState";
import { fetcher } from "@/services/fetcher";

type Repository = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
};

type RepositoryResponse = { repositories: Repository[] };

export default function RepositoryObservatory() {
  const locale = useLocale();
  const isIndonesian = locale === "id";
  const { data, isLoading, error } = useSWR<RepositoryResponse>(
    "/api/github/repos",
    fetcher,
  );

  const labels = isIndonesian
    ? {
        subtitle: "Repositori publik yang terakhir saya perbarui di GitHub.",
        loading: "Memuat repositori...",
        error: "Gagal mengambil data repositori GitHub.",
        empty: "Belum ada repositori untuk ditampilkan.",
        pushed: "Push terakhir",
        noDescription: "Belum ada deskripsi repositori.",
        visit: "Buka repositori",
        all: "Lihat semua repositori",
        cache: "Data GitHub diperbarui maksimal setiap satu jam.",
      }
    : {
        subtitle: "Public repositories I've recently pushed to on GitHub.",
        loading: "Loading repositories...",
        error: "Could not load GitHub repositories.",
        empty: "No repositories to display yet.",
        pushed: "Last push",
        noDescription: "No repository description yet.",
        visit: "Open repository",
        all: "View all repositories",
        cache: "GitHub data refreshes up to once per hour.",
      };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(isIndonesian ? "id-ID" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(iso));

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <SectionHeading title="Repository Observatory" icon={<FiGithub />} />
        <SectionSubHeading>{labels.subtitle}</SectionSubHeading>
      </div>

      {error || (!isLoading && !Array.isArray(data?.repositories)) ? (
        <EmptyState message={labels.error} />
      ) : isLoading ? (
        <p className="py-4 text-sm text-neutral-500">{labels.loading}</p>
      ) : data?.repositories.length === 0 ? (
        <EmptyState message={labels.empty} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data?.repositories.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${labels.visit}: ${repo.name}`}
              className="group rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 font-medium text-neutral-800 dark:text-neutral-200">
                  {repo.name}
                </div>
                <FiExternalLink className="shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-700 dark:group-hover:text-neutral-200" />
              </div>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm text-neutral-500 dark:text-neutral-400">
                {repo.description || labels.noDescription}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
                <span>{repo.language || "—"}</span>
                <span className="flex items-center gap-1">
                  <FiStar /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <FiGitBranch /> {repo.forks_count}
                </span>
                <span>{labels.pushed}: {formatDate(repo.pushed_at)}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <span>{labels.cache}</span>
        <a
          href="https://github.com/syarif32?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
        >
          {labels.all}
        </a>
      </div>
    </section>
  );
}
