"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function EditAchievement({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", 
    slug: "", 
    issuing_organization: "",
    credential_id: "",  
    type: "Sertifikat", 
    category: "Web Development", 
    issue_date: "",
  });

  // Tarik data lama dari database
  useEffect(() => {
    const fetchOldData = async () => {
      const { data, error } = await supabase.from("achievements").select("*").eq("id", params.id).single();
      if (data) {
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          issuing_organization: data.issuing_organization || "",
          credential_id: data.credential_id || "",
          type: data.type || "Sertifikat",
          category: data.category || "Web Development",
          issue_date: data.issue_date || "",
        });
      }
      setFetching(false);
    };
    fetchOldData();
  }, [params.id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      if (file) {
        const { error: uploadError } = await supabase.storage
          .from("achievements")
          .upload(`${formData.slug}.webp`, file, {
            cacheControl: "3600",
            upsert: true, // 
          });
          
        if (uploadError) throw uploadError;
      }

      // 2. Update text data di Database
      const { error: dbError } = await supabase.from("achievements").update({
        name: formData.name,
        slug: formData.slug,
        issuing_organization: formData.issuing_organization,
        credential_id: formData.credential_id, 
        type: formData.type,
        category: formData.category,
        issue_date: formData.issue_date,
      }).eq("id", params.id);

      if (dbError) throw dbError;

      alert(" Data Penghargaan berhasil diperbarui!");
      router.push("/admin"); 
      
    } catch (error: any) {
      alert("Gagal Update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-20 animate-pulse text-neutral-500">Menarik data penghargaan... ⏳</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 mb-20 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">✏️ Edit Data Penghargaan</h1>
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Nama Penghargaan</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" />
        </div>

        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Slug (URL Unik)</label>
          <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none bg-neutral-100 dark:bg-neutral-900" />
        </div>

        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Penyelenggara</label>
          <input required name="issuing_organization" value={formData.issuing_organization} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" />
        </div>
        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Credential ID / Nomor Sertifikat</label>
          <input name="credential_id" value={formData.credential_id} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none focus:border-blue-500" placeholder="Kosongkan jika tidak ada" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none">
              <option value="Sertifikat">Sertifikat</option>
              <option value="Penghargaan">Penghargaan</option>
              <option value="Piala">Piala</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none">
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Competition">Competition</option>
              <option value="Academic">Academic</option>
              <option value="Course">Course</option>
              <option value="Training">Training</option>
              <option value="Organization">Organization</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tanggal Didapat</label>
          <input required type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" />
        </div>

        <div className="p-4 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">File Gambar (.webp) - <i>Opsional</i></label>
          <p className="text-xs text-neutral-500 mb-2">Biarkan kosong jika tidak ingin mengubah gambar.</p>
          <input type="file" accept=".webp, .jpg, .jpeg, .png" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>

        <div className="flex gap-4 mt-6">
          <button type="button" onClick={() => router.push("/admin")} className="w-1/3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-bold py-3 px-4 rounded-lg transition-colors">Batal</button>
          <button type="submit" disabled={loading} className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            {loading ? "Menyimpan Perubahan..." : "Update Penghargaan"}
          </button>
        </div>
      </form>
    </div>
  );
}