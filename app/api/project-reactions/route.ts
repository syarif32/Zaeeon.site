
import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const REACTIONS = ["love", "fire", "idea"] as const;
type Reaction = (typeof REACTIONS)[number];

const COOKIE_NAME = "zaeeon_reaction_visitor";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Konfigurasi Supabase server belum lengkap");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function validSlug(value: string | null): value is string {
  return (
    typeof value === "string" &&
    /^[a-z0-9-]{1,100}$/.test(value)
  );
}

function validVisitor(value: string | undefined) {
  return (
    !!value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

async function getSummary(
  db: SupabaseClient,
  slug: string,
  visitorId?: string
) {
  const entries = await Promise.all(
    REACTIONS.map(async (reaction) => {
      const { count, error } = await db
        .from("project_reactions")
        .select("*", { count: "exact", head: true })
        .eq("project_slug", slug)
        .eq("reaction", reaction);

      if (error) throw error;

      return [reaction, count ?? 0] as const;
    })
  );

  const counts: Record<Reaction, number> = {
    love: 0,
    fire: 0,
    idea: 0,
  };

  for (const [reaction, count] of entries) {
    counts[reaction] = count;
  }

  let selected: Reaction | null = null;

  if (visitorId) {
    const { data, error } = await db
      .from("project_reactions")
      .select("reaction")
      .eq("project_slug", slug)
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (error) throw error;

    if (
      data &&
      REACTIONS.some((item) => item === data.reaction)
    ) {
      selected = data.reaction as Reaction;
    }
  }

  return { counts, selected };
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!validSlug(slug)) {
    return NextResponse.json(
      { error: "Slug proyek tidak valid" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const visitor = req.cookies.get(COOKIE_NAME)?.value;

    const summary = await getSummary(
      db,
      slug,
      validVisitor(visitor) ? visitor : undefined
    );

    return NextResponse.json(summary, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Project reactions GET:", error);

    return NextResponse.json(
      { error: "Gagal membaca reaksi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json(
      { error: "Origin tidak diizinkan" },
      { status: 403 }
    );
  }

  if (
    req.headers.get("content-type")?.split(";")[0] !==
    "application/json"
  ) {
    return NextResponse.json(
      { error: "Content-Type harus application/json" },
      { status: 415 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "JSON tidak valid" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Data tidak valid" },
      { status: 400 }
    );
  }

  const { slug, reaction } = body as {
    slug?: unknown;
    reaction?: unknown;
  };

  if (
    !validSlug(typeof slug === "string" ? slug : null) ||
    (reaction !== null &&
      !REACTIONS.some((item) => item === reaction))
  ) {
    return NextResponse.json(
      { error: "Proyek atau reaksi tidak valid" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();

    const { data: project, error: projectError } = await db
      .from("projects")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (projectError) throw projectError;

    if (!project) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    const existingVisitor =
      req.cookies.get(COOKIE_NAME)?.value;

    const visitorId = validVisitor(existingVisitor)
      ? existingVisitor!
      : crypto.randomUUID();

    if (reaction === null) {
      const { error } = await db
        .from("project_reactions")
        .delete()
        .eq("project_slug", slug)
        .eq("visitor_id", visitorId);

      if (error) throw error;
    } else {
      const { error } = await db
        .from("project_reactions")
        .upsert(
          {
            project_slug: slug,
            visitor_id: visitorId,
            reaction,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "project_slug,visitor_id",
          }
        );

      if (error) throw error;
    }

    const summary = await getSummary(
      db,
      slug,
      visitorId
    );

    const response = NextResponse.json(summary, {
      headers: { "Cache-Control": "no-store" },
    });

    if (!validVisitor(existingVisitor)) {
      response.cookies.set(COOKIE_NAME, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (error) {
    console.error("Project reactions POST:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan reaksi" },
      { status: 500 }
    );
  }
}
