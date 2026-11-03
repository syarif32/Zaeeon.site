import { NextResponse } from "next/server";

// Cache GitHub for 6 hours to avoid rate limits.
export const revalidate = 21600;

const USERNAME = "syarif32";
const CACHE_SECONDS = 21600;

interface GithubRepository {
  id: number;
  name: string;
  html_url: string;
  fork: boolean;
  archived: boolean;
  size: number;
}

interface RepositoryLanguage {
  name: string;
  url: string;
  bytes: number;
}

type GithubLanguages = Record<string, number>;

function getHeaders(): Record<string, string> {
  const token = process.env.GITHUB_READ_USER_TOKEN_PERSONAL;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubGet<T>(path: string, headers: Record<string, string>): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    // Never log token/header values.
    console.error("Technology Footprint GitHub request failed", {
      status: response.status,
      endpoint: path.split("?")[0],
    });
    throw new Error(`GitHub API returned ${response.status}`);
  }

  return (await response.json()) as T;
}

async function listRepositories(headers: Record<string, string>) {
  const result: GithubRepository[] = [];
  // Pagination: GitHub limits each page to 100 items.
  for (let page = 1; page <= 10; page++) {
    const repositories = await githubGet<GithubRepository[]>(
      `/users/${USERNAME}/repos?type=owner&sort=pushed&per_page=100&page=${page}`,
      headers,
    );
    if (!Array.isArray(repositories)) throw new Error("Invalid repositories response");
    result.push(...repositories);
    if (repositories.length < 100) return result;
  }
  throw new Error("More than 1000 repositories: increase pagination limit");
}

export async function GET() {
  try {
    const headers = getHeaders();
    const repositories = (await listRepositories(headers)).filter(
      (repo) => !repo.fork && !repo.archived && repo.size > 0,
    );

    const totals = new Map<string, { bytes: number; repositories: RepositoryLanguage[] }>();

    // Small batches avoid excessive concurrent GitHub requests.
    for (let index = 0; index < repositories.length; index += 5) {
      const batch = repositories.slice(index, index + 5);
      const responses = await Promise.all(
        batch.map(async (repo) => ({
          repo,
          languages: await githubGet<GithubLanguages>(
            `/repos/${USERNAME}/${encodeURIComponent(repo.name)}/languages`,
            headers,
          ),
        })),
      );

      for (const { repo, languages } of responses) {
        if (!languages || typeof languages !== "object" || Array.isArray(languages)) {
          throw new Error("Invalid languages response");
        }
        for (const [name, value] of Object.entries(languages)) {
          if (!Number.isFinite(value) || value <= 0) continue;
          const current = totals.get(name) ?? { bytes: 0, repositories: [] };
          current.bytes += value;
          current.repositories.push({
            name: repo.name,
            url: repo.html_url,
            bytes: value,
          });
          totals.set(name, current);
        }
      }
    }

    const totalBytes = Array.from(totals.values()).reduce((sum, item) => sum + item.bytes, 0);
    const languages = Array.from(totals.entries())
      .map(([name, item]) => ({
        name,
        bytes: item.bytes,
        percentage: totalBytes ? (item.bytes / totalBytes) * 100 : 0,
        repositories: item.repositories.sort((a, b) => b.bytes - a.bytes),
      }))
      .sort((a, b) => b.bytes - a.bytes);

    return NextResponse.json({
      username: USERNAME,
      totalRepositories: repositories.length,
      totalBytes,
      languages,
    });
  } catch (error) {
    console.error("Technology Footprint aggregation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { message: "Gagal mengambil distribusi bahasa dari GitHub." },
      { status: 502 },
    );
  }
}
