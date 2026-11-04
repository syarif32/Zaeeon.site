import { NextResponse } from "next/server";

// data publik yang boleh tampil di dashboard; token tidak pernah dikirim ke browser
export const dynamic = "force-dynamic";

const GITHUB_USERNAME = "syarif32";
const TIMEZONE = "Asia/Jakarta";
const DAY_MS = 24 * 60 * 60 * 1000;
const SOURCE_CACHE_SECONDS = 600;

type GithubDay = { date: string; count: number };

type GithubSummary = {
  days: GithubDay[];
  current7: number;
  previous7: number;
  activeDays7: number;
};

type WakaTimeSummary = {
  totalSeconds7: number;
  topLanguage: string | null;
  topLanguages: Array<{ name: string; totalSeconds: number }>;
  rangeLabel: string;
};

// tanggal kalender mengikuti zona waktu pengguna, bukan zona waktu server Vercel
function jakartaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function last14Dates(): string[] {
  return Array.from({ length: 14 }, (_, i) =>
    jakartaDate(new Date(Date.now() - (13 - i) * DAY_MS)),
  );
}

async function fetchGithub(): Promise<GithubSummary> {
  const token = process.env.GITHUB_READ_USER_TOKEN_PERSONAL;
  if (!token) throw new Error("github token missing");

  // 15 hari memberi buffer untuk perbedaan batas hari pada API GitHub
  const from = new Date(Date.now() - 15 * DAY_MS).toISOString();
  const to = new Date().toISOString();
  const query = `
    query DevelopmentPulse($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "zaeeon-development-pulse",
    },
    body: JSON.stringify({ query, variables: { login: GITHUB_USERNAME, from, to } }),
    next: { revalidate: SOURCE_CACHE_SECONDS },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`github http ${response.status}`);

  const payload: {
    errors?: unknown[];
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            weeks?: Array<{
              contributionDays?: Array<{ date?: string; contributionCount?: number }>;
            }>;
          };
        };
      };
    };
  } = await response.json();

  const weeks = payload.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (payload.errors?.length || !Array.isArray(weeks)) {
    throw new Error("github response invalid");
  }

  const counts = new Map<string, number>();
  for (const week of weeks) {
    for (const day of week.contributionDays ?? []) {
      if (
        typeof day.date === "string" &&
        typeof day.contributionCount === "number" &&
        Number.isFinite(day.contributionCount) &&
        day.contributionCount >= 0
      ) {
        counts.set(day.date, day.contributionCount);
      }
    }
  }

  const dates = last14Dates();
  // jangan anggap tanggal hilang dari respons API sebagai angka nol
  if (dates.some((date) => !counts.has(date))) {
    throw new Error("github dates incomplete");
  }

  const days = dates.map((date) => ({ date, count: counts.get(date)! }));
  const previous7 = days.slice(0, 7).reduce((sum, day) => sum + day.count, 0);
  const recent = days.slice(7);
  const current7 = recent.reduce((sum, day) => sum + day.count, 0);
  const activeDays7 = recent.filter((day) => day.count > 0).length;

  return { days, current7, previous7, activeDays7 };
}

async function fetchWakaTime(): Promise<WakaTimeSummary> {
  const token = process.env.WAKATIME_ACCESS_TOKEN;
  if (!token) throw new Error("wakatime token missing");

  const response = await fetch(
    "https://wakatime.com/api/v1/users/current/stats/last_7_days",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: SOURCE_CACHE_SECONDS },
      signal: AbortSignal.timeout(12000),
    },
  );
  if (!response.ok) throw new Error(`wakatime http ${response.status}`);

  const payload: {
    data?: {
      total_seconds?: number;
      human_readable_range?: string;
      languages?: Array<{ name?: string; total_seconds?: number }>;
    };
  } = await response.json();
  const stats = payload.data;
  if (
    !stats ||
    typeof stats.total_seconds !== "number" ||
    !Number.isFinite(stats.total_seconds) ||
    stats.total_seconds < 0
  ) {
    throw new Error("wakatime response incomplete");
  }

  const languages = [...(stats.languages ?? [])]
    .filter(
      (language) =>
        typeof language.name === "string" &&
        typeof language.total_seconds === "number" &&
        Number.isFinite(language.total_seconds) &&
        language.total_seconds >= 0,
    )
    .sort((a, b) => (b.total_seconds ?? 0) - (a.total_seconds ?? 0))
    .slice(0, 3)
    .map((language) => ({
      name: language.name!,
      totalSeconds: language.total_seconds!,
    }));

  return {
    totalSeconds7: stats.total_seconds,
    topLanguage: languages[0]?.name ?? null, // tetap ada untuk kompatibilitas
    topLanguages: languages,
    rangeLabel: stats.human_readable_range ?? "Last 7 days",
  };
}

export async function GET() {
  const [githubResult, wakatimeResult] = await Promise.allSettled([
    fetchGithub(),
    fetchWakaTime(),
  ]);

  const github = githubResult.status === "fulfilled" ? githubResult.value : null;
  const wakatime = wakatimeResult.status === "fulfilled" ? wakatimeResult.value : null;
  const health = {
    github: github ? "ok" : "unavailable",
    wakatime: wakatime ? "ok" : "unavailable",
  } as const;

  return NextResponse.json(
    {
      github,
      wakatime,
      health,
      updatedAt: new Date().toISOString(),
      timezone: TIMEZONE,
    },
    {
      status: github || wakatime ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
