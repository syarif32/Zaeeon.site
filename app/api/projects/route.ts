
import { NextResponse } from "next/server";
import { getProjectsData } from "@/services/projects";

// jalankan api secara dinamis, bukan saat static generation
export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    // mengambil data proyek
    const data = await getProjectsData();

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    // mencatat error untuk debugging di server
    console.error("Project API Error:", error);

    // tidak mengekspos detail internal kepada pengguna
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
