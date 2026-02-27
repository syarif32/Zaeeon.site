"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function InsertEducation() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    school: "",
    major: "",
    logo: "",
    degree: "Sekolah Menengah Kejuruan (SMK)",
    start_year: "",
    end_year: "",
    link: "",
    location: "Semarang, Indonesia",
    GPA: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: dbError } = await supabase.from("educations").insert([
        {
          school: formData.school,
          major: formData.major,
          logo: formData.logo || null,
          degree: formData.degree,
          start_year: parseInt(formData.start_year),
          end_year: formData.end_year ? parseInt(formData.end_year) : null,
          link: formData.link || null,
          location: formData.location,
          gpa: formData.GPA || null,
          is_show: true,
        },
      ]);

      if (dbError) throw dbError;

      alert("✅ Mantap! Riwayat Pendidikan berhasil ditambahkan!");
      setFormData({ ...formData, school: "", major: "", start_year: "", end_year: "", GPA: "" });
      
    } catch (error: any) {
      alert("❌ Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">🎓 Dashboard Input Pendidikan</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Nama Sekolah / Kampus</label>
          <input required name="school" value={formData.school} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Contoh: SMKN 10 Semarang" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Jurusan</label>
          <input required name="major" value={formData.major} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Contoh: Rekayasa Perangkat Lunak" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tingkat Pendidikan</label>
          <input required name="degree" value={formData.degree} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Lokasi</label>
          <input required name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" /></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tahun Mulai (Angka)</label>
          <input required type="number" name="start_year" value={formData.start_year} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="2023" /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tahun Selesai (Angka)</label>
          <input type="number" name="end_year" value={formData.end_year} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="2026" /></div>

          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Nilai / Rata-rata (Opsional)</label>
          <input name="GPA" value={formData.GPA} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Misal: 90.5 atau 3.80" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link Web Sekolah (Opsional)</label>
          <input name="link" value={formData.link} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="https://..." /></div>
          
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link Logo (Opsional - Paste URL gambar)</label>
          <input name="logo" value={formData.logo} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="https://..." /></div>
        </div>

        <button type="submit" disabled={loading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
          {loading ? "Menyimpan..." : "Simpan Riwayat Pendidikan"}
        </button>
      </form>
    </div>
  );
}