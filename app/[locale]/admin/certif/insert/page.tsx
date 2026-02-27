"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function InsertAchievement() {
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Gambar ke Bucket 'achievements'
      if (file) {
        console.log("Mulai mengunggah file:", file.name, file.type);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("achievements")
          .upload(`${formData.slug}.webp`, file, {
            cacheControl: "3600",
            upsert: true,
          });
          
        if (uploadError) {
          console.error("DETAIL ERROR UPLOAD:", uploadError);
          alert("Gagal Upload Gambar! Cek console browser (F12) untuk detailnya.");
          throw uploadError;
        }
        console.log("Upload gambar sukses!", uploadData);
      }

      
      const { error: dbError } = await supabase.from("achievements").insert([
        {
          name: formData.name,
          slug: formData.slug,
          issuing_organization: formData.issuing_organization,
          credential_id: formData.credential_id, 
          type: formData.type,
          category: formData.category,
          issue_date: formData.issue_date,
          is_show: true,
        },
      ]);

      if (dbError) {
         console.error("DETAIL ERROR DATABASE:", dbError);
         throw dbError;
      }

      alert("Sertifikat berhasil ditambahkan!");
      
      setFormData({ ...formData, name: "", slug: "", issuing_organization: "", credential_id: "" });
      setFile(null);
      
    } catch (error: any) {
      alert("❌ Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">
        🚀 Dashboard Input Penghargaan
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Nama Penghargaan</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none focus:border-blue-500" placeholder="Contoh: Juara 1 Web Design Nasional" />
        </div>

        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Slug (URL Unik)</label>
          <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none focus:border-blue-500" placeholder="contoh: juara-1-web-design" />
          <p className="text-xs text-neutral-500 mt-1">*Tanpa spasi, gunakan strip (-). Gambar otomatis bernama slug.webp</p>
        </div>

        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Penyelenggara</label>
          <input required name="issuing_organization" value={formData.issuing_organization} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none focus:border-blue-500" placeholder="Contoh: Universitas Indonesia" />
        </div>

        {/* ✅ FORM INPUT BARU UNTUK CREDENTIAL ID */}
        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Credential ID / Nomor Sertifikat</label>
          <input name="credential_id" value={formData.credential_id} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none focus:border-blue-500" placeholder="Contoh: 72ZDK46JLPYW (Kosongkan jika tidak ada)" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none focus:border-blue-500">
              <option value="Sertifikat">Sertifikat</option>
              <option value="Penghargaan">Penghargaan</option>
              <option value="Piala">Piala</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none focus:border-blue-500">
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
          <input required type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">File Gambar (.webp)</label>
          <input required type="file" accept=".webp , jpg , jpeg , png" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>

        <button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
          {loading ? "Menyimpan ke Database..." : "Simpan Penghargaan"}
        </button>
      </form>
    </div>
  );
}