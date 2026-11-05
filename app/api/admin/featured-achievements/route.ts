import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAuthorizedAdmin } from "@/common/libs/authOptions";

export const dynamic = "force-dynamic";

const TABLE = "home_featured_achievements";

function makeReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase public env missing");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function makeWriteClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server env missing");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isPositiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function notFound() {
  return NextResponse.json(
    { error: "Not found" },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  try {
    const db = makeReadClient();
    const { data, error } = await db
      .from(TABLE)
      .select("achievement_ids")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;

    const achievementIds: number[] = Array.isArray(data?.achievement_ids)
      ? data.achievement_ids.filter(isPositiveId)
      : [];

    return NextResponse.json(
      { achievementIds },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[featured-achievements] GET failed", error);
    return NextResponse.json({ error: "Gagal membaca sertifikat unggulan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await isAuthorizedAdmin())) return notFound();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
    }

    const ids =
      body && typeof body === "object" && "achievementIds" in body
        ? (body as { achievementIds: unknown }).achievementIds
        : undefined;

    if (
      !Array.isArray(ids) ||
      ids.length > 2 ||
      !ids.every(isPositiveId) ||
      new Set(ids).size !== ids.length
    ) {
      return NextResponse.json(
        { error: "Pilih maksimal 2 ID sertifikat yang berbeda" },
        { status: 400 },
      );
    }

    const achievementIds = ids as number[];
    const db = makeWriteClient();
    if (achievementIds.length > 0) {
      const { data, error } = await db
        .from("achievements")
        .select("id, is_show")
        .in("id", achievementIds);
      if (error) throw error;

      const available = new Set(
        (data ?? []).filter((item) => item.is_show === true).map((item) => item.id),
      );
      if (!achievementIds.every((id) => available.has(id))) {
        return NextResponse.json(
          { error: "Ada sertifikat yang tidak ditemukan atau disembunyikan" },
          { status: 400 },
        );
      }
    }

    const { error } = await db.from(TABLE).upsert(
      {
        id: 1,
        achievement_ids: achievementIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;

    return NextResponse.json(
      { success: true, achievementIds },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[featured-achievements] PUT failed", error);
    return NextResponse.json({ error: "Gagal menyimpan sertifikat unggulan" }, { status: 500 });
  }
}
