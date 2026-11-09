
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import {
  isOrganizationAdmin,
  organizationAdminDb,
} from "@/common/utils/organizationAdmin";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  if (!(await isOrganizationAdmin(request))) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.formData();
    const file = body.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 400 }
      );
    }

    const extension = TYPES[file.type];

    if (
  !extension ||
  file.size === 0 ||
  file.size > 4_000_000
) {
  return NextResponse.json(
    {
      error:
        "Gunakan JPG, PNG atau WebP maksimal 4 MB",
    },
    { status: 400 }
  );
}

    const path = `events/${randomUUID()}.${extension}`;
    const bytes = new Uint8Array(
      await file.arrayBuffer()
    );

    const db = organizationAdminDb();

    const { error } = await db.storage
      .from("organization-photos")
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (error) throw error;

    const { data } = db.storage
      .from("organization-photos")
      .getPublicUrl(path);

    return NextResponse.json({
      url: data.publicUrl,
    });
  } catch (cause) {
    console.error(
      "organization photo upload:",
      cause
    );

    return NextResponse.json(
      { error: "Gagal mengunggah foto" },
      { status: 500 }
    );
  }
}
