import { createClient } from "@/common/utils/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; 
export const DELETE = async (req: Request, { params }: { params: { slug: string } }) => {
  
  const session = await getServerSession();
  const adminEmail = process.env.NEXT_PUBLIC_AUTHOR_EMAIL;
  if (!session || session?.user?.email !== adminEmail) {
    return NextResponse.json(
      { message: "Akses Ditolak!." },
      { status: 401 }
    );
  }

  
  const supabase = createClient();
  try {
    await supabase.from("messages").delete().eq("id", params.slug);
    return NextResponse.json("Data berhasil dihapus", { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};