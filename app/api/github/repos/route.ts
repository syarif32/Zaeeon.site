import { NextResponse } from "next/server";

export const revalidate = 3600;

interface GithubRepository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
  fork: boolean;
  archived: boolean;
}

export async function GET() {
  try {
    const token = process.env.GITHUB_READ_USER_TOKEN_PERSONAL;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const githubResponse = await fetch(
      "https://api.github.com/users/syarif32/repos?type=owner&sort=pushed&direction=desc&per_page=100",
      { headers, next: { revalidate: 3600 } },
    );

    if (!githubResponse.ok) {
      console.error("GitHub repositories API failed", githubResponse.status);
      return NextResponse.json(
        { message: "Gagal mengambil daftar repositori GitHub." },
        { status: 502 },
      );
    }

    const payload: unknown = await githubResponse.json();
    if (!Array.isArray(payload)) {
      return NextResponse.json(
        { message: "Format respons GitHub tidak sesuai." },
        { status: 502 },
      );
    }

    const repositories = (payload as GithubRepository[])
      .filter((repo) => !repo.fork && !repo.archived && repo.pushed_at)
      .sort((a, b) => Date.parse(b.pushed_at!) - Date.parse(a.pushed_at!))
      .slice(0, 6)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        pushed_at: repo.pushed_at,
      }));

    return NextResponse.json({ repositories });
  } catch (error) {
    console.error("Repository Observatory error", error);
    return NextResponse.json(
      { message: "Tidak dapat terhubung ke GitHub." },
      { status: 502 },
    );
  }
}
