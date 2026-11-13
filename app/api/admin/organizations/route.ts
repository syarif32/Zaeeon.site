
import { NextRequest, NextResponse } from "next/server";

import type {
  OrganizationInput,
  OrganizationPhoto,
} from "@/common/types/organizations";

import {
  isOrganizationAdmin,
  organizationAdminDb,
} from "@/common/utils/organizationAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () =>
  NextResponse.json(
    { error: "Not found" },
    { status: 404 }
  );

function validImageUrl(url: string): boolean {
  if (!url) return true;

  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }

  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

function safeString(
  value: unknown,
  maxLength: number
): string | null {
  if (
    typeof value !== "string" ||
    value.length > maxLength
  ) {
    return null;
  }

  return value.trim();
}

// undefined berarti input tidak valid
// null berarti terjemahan opsional dikosongkan
function optionalTranslation(
  value: unknown,
  maxLength: number
): string | null | undefined {
  if (value === undefined || value === null) {
    return null;
  }

  if (
    typeof value !== "string" ||
    value.length > maxLength
  ) {
    return undefined;
  }

  return value.trim() || null;
}

function parseInput(
  raw: unknown
): OrganizationInput | null {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw)
  ) {
    return null;
  }

  const x = raw as Record<string, unknown>;

  const name = safeString(x.name, 120);
  const role = safeString(x.role, 120);
  const period = safeString(x.period, 100);
  const location = safeString(x.location, 120);
  const description = safeString(x.description, 3000);
  const logo_url = safeString(x.logo_url, 1000);

  // Terjemahan English
  const role_en = optionalTranslation(x.role_en, 120);
  const description_en = optionalTranslation(
    x.description_en,
    3000
  );
  const location_en = optionalTranslation(
    x.location_en,
    120
  );

  if (
    !name ||
    !role ||
    period === null ||
    location === null ||
    description === null ||
    logo_url === null ||
    !validImageUrl(logo_url) ||
    role_en === undefined ||
    description_en === undefined ||
    location_en === undefined
  ) {
    return null;
  }

  if (
    !Array.isArray(x.photos) ||
    x.photos.length > 20
  ) {
    return null;
  }

  const photos: OrganizationPhoto[] = [];

  for (const item of x.photos) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return null;
    }

    const p = item as Record<string, unknown>;

    const url = safeString(p.url, 1000);
    const caption = safeString(p.caption, 300);

    // Caption English opsional, foto lama tetap didukung
    const caption_en = optionalTranslation(
      p.caption_en,
      300
    );

    if (
      !url ||
      caption === null ||
      caption_en === undefined ||
      !validImageUrl(url)
    ) {
      return null;
    }

    photos.push({
      url,
      caption,
      caption_en,
    });
  }

  const sort_order = x.sort_order;

  if (
    !Number.isSafeInteger(sort_order) ||
    (sort_order as number) < 0 ||
    (sort_order as number) > 10000 ||
    typeof x.is_show !== "boolean"
  ) {
    return null;
  }

  return {
    name,
    role,
    role_en,
    period,
    location,
    location_en,
    description,
    description_en,
    logo_url,
    photos,
    is_show: x.is_show,
    sort_order: sort_order as number,
  };
}

function parseId(raw: unknown): number | null {
  const id =
    raw &&
    typeof raw === "object" &&
    "id" in raw
      ? (raw as { id: unknown }).id
      : null;

  return typeof id === "number" &&
    Number.isSafeInteger(id) &&
    id > 0
    ? id
    : null;
}

// GET: mengambil seluruh organisasi untuk dashboard admin
export async function GET(request: NextRequest) {
  if (!(await isOrganizationAdmin(request))) {
    return notFound();
  }

  try {
    const { data, error } = await organizationAdminDb()
      .from("organizations")
      .select("*")
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: false,
      });

    if (error) throw error;

    return NextResponse.json(
      { organizations: data ?? [] },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (cause) {
    console.error("organizations GET:", cause);

    return NextResponse.json(
      { error: "Gagal memuat organisasi" },
      { status: 500 }
    );
  }
}

// POST: menambahkan organisasi baru
export async function POST(request: NextRequest) {
  if (!(await isOrganizationAdmin(request))) {
    return notFound();
  }

  const body: unknown = await request
    .json()
    .catch(() => null);

  const input = parseInput(body);

  if (!input) {
    return NextResponse.json(
      { error: "Data organisasi tidak valid" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await organizationAdminDb()
      .from("organizations")
      .insert(input)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { organization: data },
      { status: 201 }
    );
  } catch (cause) {
    console.error("organizations POST:", cause);

    return NextResponse.json(
      { error: "Gagal menyimpan organisasi" },
      { status: 500 }
    );
  }
}

// PUT: memperbarui organisasi beserta terjemahannya
export async function PUT(request: NextRequest) {
  if (!(await isOrganizationAdmin(request))) {
    return notFound();
  }

  const body: unknown = await request
    .json()
    .catch(() => null);

  const id = parseId(body);
  const input = parseInput(body);

  if (!id || !input) {
    return NextResponse.json(
      { error: "Data organisasi tidak valid" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await organizationAdminDb()
      .from("organizations")
      .update(input)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return notFound();

    return NextResponse.json({
      ok: true,
    });
  } catch (cause) {
    console.error("organizations PUT:", cause);

    return NextResponse.json(
      { error: "Gagal memperbarui organisasi" },
      { status: 500 }
    );
  }
}

// DELETE: menghapus record organisasi
export async function DELETE(request: NextRequest) {
  if (!(await isOrganizationAdmin(request))) {
    return notFound();
  }

  const body: unknown = await request
    .json()
    .catch(() => null);

  const id = parseId(body);

  if (!id) {
    return NextResponse.json(
      { error: "ID tidak valid" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await organizationAdminDb()
      .from("organizations")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return notFound();

    return NextResponse.json({
      ok: true,
    });
  } catch (cause) {
    console.error("organizations DELETE:", cause);

    return NextResponse.json(
      { error: "Gagal menghapus organisasi" },
      { status: 500 }
    );
  }
}
