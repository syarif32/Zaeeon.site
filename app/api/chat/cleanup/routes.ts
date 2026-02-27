import { createClient } from "@/common/utils/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const POST = async (req: Request) => {
  
  const session = await getServerSession();
  const adminEmail = process.env.NEXT_PUBLIC_AUTHOR_EMAIL;

  if (!session || session?.user?.email !== adminEmail) {
    return NextResponse.json({ message: "Akses Ditolak!" }, { status: 401 });
  }

  try {
    const { days } = await req.json(); 
    const supabase = createClient();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const isoDate = targetDate.toISOString();

    const { error } = await supabase
      .from("messages")
      .delete()
      .lt("created_at", isoDate);

    if (error) throw error;

    return NextResponse.json(`Chat yang lebih tua dari ${days} hari berhasil dibersihkan!`, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus chat" }, { status: 500 });
  }
};