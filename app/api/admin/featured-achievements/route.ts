
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAuthorizedAdmin } from "@/common/libs/authOptions";

export const dynamic = "force-dynamic";

const TABLE = "home_featured_achievements";

function getClient(admin = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key = admin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Konfigurasi Supabase belum lengkap");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function isValidId(id: unknown): id is number {
  return (
    typeof id === "number" &&
    Number.isSafeInteger(id) &&
    id > 0
  );
}

export async function GET() {
  try {
    const db = getClient();

    const { data, error } = await db
      .from(TABLE)
      .select("achievement_ids")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    const achievementIds: number[] =
      Array.isArray(data?.achievement_ids)
        ? data.achievement_ids.filter(isValidId)
        : [];

    return NextResponse.json(
      { achievementIds },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Featured Achievements GET:", error);

    return NextResponse.json(
      { error: "Gagal membaca sertifikat unggulan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const allowed = await isAuthorizedAdmin();

    if (!allowed) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
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

    const ids =
      body &&
      typeof body === "object" &&
      "achievementIds" in body
        ? (body as { achievementIds: unknown }).achievementIds
        : undefined;

    if (
      !Array.isArray(ids) ||
      ids.length > 2 ||
      !ids.every(isValidId) ||
      new Set(ids).size !== ids.length
    ) {
      return NextResponse.json(
        { error: "Pilih maksimal 2 sertifikat yang berbeda" },
        { status: 400 }
      );
    }

    const achievementIds = ids as number[];

    const db = getClient(true);

    if (achievementIds.length > 0) {
      const { data, error } = await db
        .from("achievements")
        .select("id, is_show")
        .in("id", achievementIds);

      if (error) throw error;

      const validIds = new Set(
        (data || [])
          .filter((item) => item.is_show === true)
          .map((item) => item.id)
      );

      if (!achievementIds.every((id) => validIds.has(id))) {
        return NextResponse.json(
          { error: "Ada sertifikat yang tidak tersedia" },
          { status: 400 }
        );
      }
    }

    const { error } = await db.from(TABLE).upsert(
      {
        id: 1,
        achievement_ids: achievementIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      achievementIds,
    });
  } catch (error) {
    console.error("Featured Achievements PUT:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan sertifikat unggulan" },
      { status: 500 }
    );
  }
}
