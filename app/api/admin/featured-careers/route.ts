import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const TABLE = "home_featured_careers";

function createAdminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase server environment is not configured");
  }

  // kunci service_role hanya boleh dipakai di route server.
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function isAdmin(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!secret || !adminEmail) return false;

  // Membutuhkan NextAuth v4 dengan JWT session strategy.
  const token = await getToken({ req, secret });
  return (
    typeof token?.email === "string" &&
    token.email.toLowerCase() === adminEmail.toLowerCase()
  );
}

function unauthorized() {
  return NextResponse.json(
    { error: "Not found" },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}


export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error("Konfigurasi Supabase belum tersedia");
    }

    // membaca pilihan publik dengan akses terbatas RLS
    const db = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await db
      .from("home_featured_careers")
      .select("career_ids")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    
const careerIds: number[] = Array.isArray(data?.career_ids)
  ? data.career_ids.filter(
      (id: unknown): id is number =>
        typeof id === "number" &&
        Number.isSafeInteger(id) &&
        id > 0
    )
  : [];


    return NextResponse.json(
      { careerIds },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Failed to read featured careers:", error);

    return NextResponse.json(
      { error: "Gagal membaca pengaturan unggulan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin(req))) return unauthorized();

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
    !ids.every((id) => Number.isSafeInteger(id) && id > 0) ||
    new Set(ids).size !== ids.length
  ) {
    return NextResponse.json(
      { error: "Pilih maksimal 4 ID pengalaman yang berbeda" },
      { status: 400 },
    );
  }

  try {
    const db = createAdminDb();

    if (ids.length > 0) {
      const { data: careers, error: verifyError } = await db
        .from("careers")
        .select("id, is_show")
        .in("id", ids);
      if (verifyError) throw verifyError;
      const available = new Set(
        (careers ?? [])
          .filter((career) => career.is_show === true)
          .map((career) => career.id),
      );
      if (!ids.every((id) => available.has(id))) {
        return NextResponse.json(
          { error: "Ada pengalaman yang tidak ditemukan atau tidak ditampilkan" },
          { status: 400 },
        );
      }
    }

    // Satu upsert, sehingga pilihan dan urutan disimpan bersama.
    const { error } = await db.from(TABLE).upsert(
      {
        id: 1,
        career_ids: ids,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;

    return NextResponse.json(
      { success: true, careerIds: ids },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to save featured careers", error);
    return NextResponse.json({ error: "Gagal menyimpan pengalaman unggulan" }, { status: 500 });
  }
}
