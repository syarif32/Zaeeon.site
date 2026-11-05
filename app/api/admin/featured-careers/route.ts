import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAuthorizedAdmin } from "@/common/libs/authOptions";

export const dynamic = "force-dynamic";

const TABLE = "home_featured_careers";

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
  // service role tidak boleh pernah dikirim ke browser.
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

// id pengalaman yang sudah ditampilkan di home boleh dibaca publik.
export async function GET() {
  try {
    const db = makeReadClient();
    const { data, error } = await db
      .from(TABLE)
      .select("career_ids")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    const careerIds: number[] = Array.isArray(data?.career_ids)
      ? data.career_ids.filter(isPositiveId)
      : [];

    return NextResponse.json(
      { careerIds },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[featured-careers] GET failed", error);
    return NextResponse.json({ error: "Gagal membaca pengaturan" }, { status: 500 });
  }
}

// hanya sesi admin sah yang boleh mengubah urutan pilihan.
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
      body && typeof body === "object" && "careerIds" in body
        ? (body as { careerIds: unknown }).careerIds
        : undefined;

    if (
      !Array.isArray(ids) ||
      ids.length > 4 ||
      !ids.every(isPositiveId) ||
      new Set(ids).size !== ids.length
    ) {
      return NextResponse.json(
        { error: "Pilih maksimal 4 ID pengalaman yang berbeda" },
        { status: 400 },
      );
    }

    const careerIds = ids as number[];
    const db = makeWriteClient();

    if (careerIds.length > 0) {
      const { data: careers, error: verifyError } = await db
        .from("careers")
        .select("id, is_show")
        .in("id", careerIds);
      if (verifyError) throw verifyError;

      const available = new Set(
        (careers ?? [])
          .filter((career) => career.is_show === true)
          .map((career) => career.id),
      );
      if (!careerIds.every((id) => available.has(id))) {
        return NextResponse.json(
          { error: "Ada pengalaman yang tidak ditemukan atau disembunyikan" },
          { status: 400 },
        );
      }
    }

    const { error } = await db.from(TABLE).upsert(
      {
        id: 1,
        career_ids: careerIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;

    return NextResponse.json(
      { success: true, careerIds },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[featured-careers] PUT failed", error);
    return NextResponse.json({ error: "Gagal menyimpan pengalaman unggulan" }, { status: 500 });
  }
}
