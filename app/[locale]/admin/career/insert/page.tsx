"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function InsertCareer() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    company: "",
    logo: "", // Kita pakai URL gambar luar saja (misal link logo perusahaan) biar lebih cepat
    location: "",
    start_date: "",
    end_date: "",
    link: "",
    type: "Internship",
    location_type: "Remote",
    responsibilities: "", // Pisahkan dengan koma
    lessons_learned: "", // Pisahkan dengan koma
    impact: "", // Pisahkan dengan koma
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ubah string input menjadi Array (pisahkan dengan titik koma ; agar aman dari koma biasa di kalimat)
      const toArray = (str: string) => str.split(";").map(s => s.trim()).filter(s => s !== "");

      const { error: dbError } = await supabase.from("careers").insert([
        {
          position: formData.position,
          company: formData.company,
          logo: formData.logo || null,
          location: formData.location,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          link: formData.link || null,
          type: formData.type,
          location_type: formData.location_type,
          responsibilities: toArray(formData.responsibilities),
          lessons_learned: toArray(formData.lessons_learned),
          impact: toArray(formData.impact),
          is_show: true,
        },
      ]);

      if (dbError) throw dbError;

      alert("✅ Mantap! Pengalaman Karier berhasil ditambahkan!");
      setFormData({ ...formData, position: "", company: "", location: "", responsibilities: "", lessons_learned: "", impact: "" });
      
    } catch (error: any) {
      alert("❌ Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">💼 Dashboard Input Karier</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Mengembangkan fitur X; Memperbaiki bug Y; Berkolaborasi dengan tim Z..." /></div>
        
        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Apa yang dipelajari?</label>
        <textarea name="lessons_learned" value={formData.lessons_learned} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Belajar manajemen state dengan Zustand; Meningkatkan skill komunikasi;..." /></div>
        
        <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Dampak / Hasil</label>
        <textarea name="impact" value={formData.impact} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 outline-none" placeholder="Meningkatkan efisiensi sistem sebesar 20%; Menyelesaikan project tepat waktu..." /></div>

        <button type="submit" disabled={loading} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
          {loading ? "Menyimpan..." : "Simpan Pengalaman Karier"}
        </button>
      </form>
    </div>
  );
}