import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/common/utils/server";

export const getProjectsData = async () => {
  const supabase = createClient();

  let { data, error } = await supabase.from("projects").select();

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data.map((item) => {
    const { data: imageData } = supabase.storage
      .from("projects")
      .getPublicUrl(`${item.slug}.webp`);

    return {
      ...item,
      // Gunakan URL yang benar-benar disimpan saat upload, jika ada.
      image:
        typeof item.image === "string" && item.image.trim()
          ? item.image
          : imageData.publicUrl,
    };
  });
};

export const getProjectsDataBySlug = async (slug: string) => {
  const supabase = createClient();

  let { data, error } = await supabase
    .from("projects")
    .select()
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: imageData } = supabase.storage
    .from("projects")
    .getPublicUrl(`${data.slug}.webp`);

  return {
    ...data,
    image:
      typeof data.image === "string" && data.image.trim()
        ? data.image
        : imageData.publicUrl,
  };
};

// Anonymous client: sitemap must never depend on an administrator's session.
export async function getPublicProjectsForSitemap() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
  // Select existing row fields so optional timestamps require no schema change.
  const { data, error } = await supabase.from("projects").select("*").eq("is_show", true);
  if (error) throw new Error(error.message);
  return data || [];
}
