"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { STACKS } from "@/common/constants/stacks";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function EditProject({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", image: "",
    tech_stack: [] as string[], link_demo: "", link_github: "",
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  useEffect(() => {
    const fetchOldData = async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", params.id).single();
      if (data) {
        setFormData({
          title: data.title || "", 
          slug: data.slug || "", 
          description: data.description || "", 
          image: data.image || "",
          tech_stack: data.stacks || [],
          link_demo: data.link_demo || "", 
          link_github: data.link_github || "",
        });
      }
      setFetching(false);
    };
    fetchOldData();
  }, [params.id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData({ ...formData, title: value, slug: generateSlug(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleStackToggle = (stackName: string) => {
    setFormData((prev) => {
      const isSelected = prev.tech_stack.includes(stackName);
      if (isSelected) {
        return { ...prev, tech_stack: prev.tech_stack.filter((s) => s !== stackName) };
      } else {
        return { ...prev, tech_stack: [...prev.tech_stack, stackName] };
      }
    });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image;

      if (file) {
        const fileName = `${formData.slug}.webp`; 
        
        const { error: uploadError } = await supabase.storage
          .from("projects")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw new Error("Gagal mengunggah gambar: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("projects")
          .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { data: updatedData, error: dbError } = await supabase.from("projects").update({
        title: formData.title, 
        slug: formData.slug, 
        description: formData.description, 
        image: finalImageUrl,
        stacks: formData.tech_stack,
        link_demo: formData.link_demo || null, 
        link_github: formData.link_github || null,
      })
      .eq("id", params.id)
      .select();

      if (dbError) throw dbError;

      if (!updatedData || updatedData.length === 0) {
        throw new Error("Update ditolak oleh Supabase (RLS)! Silakan cek policy Anda.");
      }

      alert("✅ Data Proyek berhasil diperbarui!");
      router.push("/admin"); 
      
    } catch (error: any) {
      alert("❌ Gagal Update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-20 animate-pulse text-neutral-500">Menarik data proyek... ⏳</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">✏️ Edit Data Proyek</h1>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Judul Proyek</label>
          <input required name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Slug (URL)</label>
          <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none bg-neutral-100 dark:bg-neutral-900" /></div>
        </div>

        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Deskripsi Singkat</label>
        <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>

        <div className="p-4 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Ganti Thumbnail Proyek (.webp) - <i>Opsional</i></label>
          <p className="text-xs text-neutral-500 mb-2">Biarkan kosong jika tidak ingin mengubah gambar.</p>
          <input type="file" accept=".webp, .jpg, .jpeg, .png" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>

        <div className="p-4 border rounded-xl dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <label className="block text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-200">
            Pilih Tech Stack (Bisa pilih banyak)
          </label>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {Object.keys(STACKS).map((key) => {
              const isSelected = formData.tech_stack.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleStackToggle(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    isSelected 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105" 
                      : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  <span className={isSelected ? "text-white" : STACKS[key].color}>
                    {STACKS[key].icon}
                  </span>
                  {key}
                </button>
              );
            })}
          </div>
          {formData.tech_stack.length > 0 && (
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
              Terpilih: {formData.tech_stack.join(", ")}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link Live Demo</label>
          <input name="link_demo" value={formData.link_demo} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link GitHub Repo</label>
          <input name="link_github" value={formData.link_github} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
        </div>

        <div className="flex gap-4 mt-6">
          <button type="button" onClick={() => router.push("/admin")} className="w-1/3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-bold py-3 px-4 rounded-lg transition-colors">Batal</button>
          <button type="submit" disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg">
            {loading ? "Menyimpan Perubahan..." : "Update Proyek"}
          </button>
        </div>
      </form>
    </div>
  );
}