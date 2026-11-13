
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  isOrganizationAdmin,
  organizationAdminDb,
} from "@/common/utils/organizationAdmin";

export const dynamic = "force-dynamic";

const TABLE = "home_featured_organizations";
const MAX_SELECTED = 3;

function responseHeaders() {
  return {
    "Cache-Control": "no-store",
  };
}

function unauthorized() {
  return NextResponse.json(
    { error: "Not found" },
    {
      status: 404,
      headers: responseHeaders(),
    }
  );
}

// Membaca pilihan organisasi yang disimpan admin.
// Hanya konfigurasi ID yang dibuka untuk publik.
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        "Konfigurasi Supabase belum tersedia"
      );
    }

    const db = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await db
      .from(TABLE)
      .select("organization_ids")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    const organizationIds: number[] = Array.isArray(
      data?.organization_ids
    )
      ? data.organization_ids
          .filter(
            (id: unknown): id is number =>
              typeof id === "number" &&
              Number.isSafeInteger(id) &&
              id > 0
          )
          .slice(0, MAX_SELECTED)
      : [];

    return NextResponse.json(
      { organizationIds },
      {
        headers: responseHeaders(),
      }
    );
  } catch (error) {
    console.error(
      "Failed to read featured organizations:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal membaca organisasi unggulan",
      },
      {
        status: 500,
        headers: responseHeaders(),
      }
    );
  }
}

// Menyimpan pilihan admin, termasuk urutannya.
export async function PUT(
  request: NextRequest
) {
  if (!(await isOrganizationAdmin(request))) {
    return unauthorized();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON tidak valid" },
      { status: 400 }
    );
  }

  const rawIds =
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    "organizationIds" in body
      ? (body as { organizationIds: unknown })
          .organizationIds
      : undefined;

  if (
    !Array.isArray(rawIds) ||
    rawIds.length > MAX_SELECTED ||
    !rawIds.every(
      (id) =>
        typeof id === "number" &&
        Number.isSafeInteger(id) &&
        id > 0
    ) ||
    new Set(rawIds).size !== rawIds.length
  ) {
    return NextResponse.json(
      {
        error:
          "Pilih maksimal 3 ID organisasi yang berbeda",
      },
      { status: 400 }
    );
  }

  const ids = rawIds as number[];

  try {
    const db = organizationAdminDb();

    // Pastikan ID benar-benar tersedia
    // dan organisasinya boleh ditampilkan.
    if (ids.length > 0) {
      const { data, error } = await db
        .from("organizations")
        .select("id, is_show")
        .in("id", ids);

      if (error) throw error;

      const available = new Set(
        (data ?? [])
          .filter((item) => item.is_show === true)
          .map((item) => item.id)
      );

      if (!ids.every((id) => available.has(id))) {
        return NextResponse.json(
          {
            error:
              "Ada organisasi yang tidak ditemukan atau sedang disembunyikan",
          },
          { status: 400 }
        );
      }
    }

    // Satu baris menyimpan seluruh pilihan dan urutan.
    const { error } = await db
      .from(TABLE)
      .upsert(
        {
          id: 1,
          organization_ids: ids,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        organizationIds: ids,
      },
      {
        headers: responseHeaders(),
      }
    );
  } catch (error) {
    console.error(
      "Failed to save featured organizations:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal menyimpan organisasi unggulan",
      },
      { status: 500 }
    );
  }
}
