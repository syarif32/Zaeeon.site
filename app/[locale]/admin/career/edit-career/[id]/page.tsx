"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function EditCareer({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    position: "",
    position_en: "",
    company: "",
    logo: "", 
    location: "",
    start_date: "",
    end_date: "",
    link: "",
    type: "Internship",
    location_type: "Remote",
    responsibilities: "",
    responsibilities_en: "",
    lessons_learned: "",
    lessons_learned_en: "",
    impact: "",
    impact_en: "", 
  });

  // Tarik data lama dari database
  useEffect(() => {
    const fetchOldData = async () => {
      const { data, error } = await supabase.from("careers").select("*").eq("id", params.id).single();
      if (data) {
        setFormData({
          position: data.position || "",
          position_en: data.position_en || "",
          company: data.company || "",
          logo: data.logo || "",
          location: data.location || "",
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          link: data.link || "",
          type: data.type || "Internship",
          location_type: data.location_type || "Remote",
          // Kembalikan Array dari DB menjadi teks dengan pemisah titik koma (;)
          responsibilities: data.responsibilities?.join("; ") || "",
          responsibilities_en: data.responsibilities_en?.join("; ") || "",
          lessons_learned: data.lessons_learned?.join("; ") || "",
          lessons_learned_en: data.lessons_learned_en?.join("; ") || "",
          impact: data.impact?.join("; ") || "",
          impact_en: data.impact_en?.join("; ") || "",
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
      // Ubah kembali teks input menjadi Array
      const toArray = (str: string) => str.split(";").map(s => s.trim()).filter(s => s !== "");

      const { data: updatedData, error: dbError } = await supabase.from("careers").update({
        position: formData.position,
        position_en: formData.position_en.trim() || null,
        company: formData.company,
        logo: formData.logo || null,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        link: formData.link || null,
        type: formData.type,
        location_type: formData.location_type,
        responsibilities: toArray(formData.responsibilities),
        responsibilities_en: formData.responsibilities_en.trim() ? toArray(formData.responsibilities_en) : null,
        lessons_learned: toArray(formData.lessons_learned),
        lessons_learned_en: formData.lessons_learned_en.trim() ? toArray(formData.lessons_learned_en) : null,
        impact: toArray(formData.impact),
        impact_en: formData.impact_en.trim() ? toArray(formData.impact_en) : null,
      })
      .eq("id", params.id)
      .select(); // Mencegah silent failure RLS

      if (dbError) throw dbError;

      if (!updatedData || updatedData.length === 0) {
        throw new Error("Update ditolak oleh Supabase (RLS)! Silakan cek policy Anda.");
      }

      alert("✅ Mantap! Pengalaman Karier berhasil diperbarui!");
      router.push("/admin"); 
      
    } catch (error: any) {
      alert("❌ Gagal Update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-20 animate-pulse text-neutral-500">Menarik data karier... ⏳</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">✏️ Edit Data Karier</h1>
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Posisi / Jabatan</label>
          <input required name="position" value={formData.position} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Web Developer Intern" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Nama Perusahaan</label>
          <input required name="company" value={formData.company} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="PT. Nama Perusahaan" /></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Lokasi</label>
          <input required name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Semarang, Indonesia" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tipe</label>
          <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none">
            <option value="Internship">Internship</option><option value="Full-time">Full-time</option><option value="Freelance">Freelance</option>
          </select></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tipe Lokasi</label>
          <select name="location_type" value={formData.location_type} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none">
            <option value="Remote">Remote</option><option value="Onsite">Onsite</option><option value="Hybrid">Hybrid</option>
          </select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tanggal Mulai</label>
          <input required type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tanggal Selesai (Kosongkan jika masih aktif)</label>
          <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" /></div>
        </div>

        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link Web Perusahaan (Opsional)</label>
        <input name="link" value={formData.link} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="https://..." /></div>
        
        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link Logo Perusahaan (Opsional - Paste URL gambar)</label>
        <input name="logo" value={formData.logo} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="https://..." /></div>

        <p className="text-xs text-blue-500 font-semibold mt-4">⚠️ Untuk kotak di bawah ini, gunakan Titik Koma (;) untuk memisahkan setiap poin/kalimat baru.</p>

        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tugas / Tanggung Jawab</label>
        <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" /></div>
        
        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Apa yang dipelajari?</label>
        <textarea name="lessons_learned" value={formData.lessons_learned} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" /></div>
        
        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Dampak / Hasil</label>
        <textarea name="impact" value={formData.impact} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" /></div>


        {/* teks bahasa inggris disimpan pada kolom terpisah */}
        <div className="mt-6 space-y-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/10">
          <div>
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">English content (untuk /en)</h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Isi terjemahan bahasa Inggris di sini. Data Indonesia di atas tidak berubah.
              Jika kolom Inggris kosong, website memakai teks Indonesia sebagai cadangan.
            </p>
          </div>
          <div>
            <label htmlFor="career-position-en" className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">Job title — English</label>
            <input id="career-position-en" name="position_en" value={formData.position_en} onChange={handleChange}
              className="w-full rounded-lg border border-neutral-200 p-2 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
              placeholder="Full-Stack Web Developer (Intern)" />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Untuk daftar berikut, pisahkan tiap poin dengan titik koma (;).</p>
          <div>
            <label htmlFor="career-responsibilities-en" className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">Responsibilities — English</label>
            <textarea id="career-responsibilities-en" name="responsibilities_en" value={formData.responsibilities_en}
              onChange={handleChange} rows={3}
              className="w-full rounded-lg border border-neutral-200 p-2 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800" />
          </div>
          <div>
            <label htmlFor="career-lessons-en" className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">What I learned — English</label>
            <textarea id="career-lessons-en" name="lessons_learned_en" value={formData.lessons_learned_en}
              onChange={handleChange} rows={3}
              className="w-full rounded-lg border border-neutral-200 p-2 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800" />
          </div>
          <div>
            <label htmlFor="career-impact-en" className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">Impact — English</label>
            <textarea id="career-impact-en" name="impact_en" value={formData.impact_en}
              onChange={handleChange} rows={3}
              className="w-full rounded-lg border border-neutral-200 p-2 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800" />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button type="button" onClick={() => router.push("/admin")} className="w-1/3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-bold py-3 px-4 rounded-lg transition-colors">Batal</button>
          <button type="submit" disabled={loading} className="w-2/3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg">
            {loading ? "Menyimpan Perubahan..." : "Update Pengalaman Karier"}
          </button>
        </div>
      </form>
    </div>
  );
}