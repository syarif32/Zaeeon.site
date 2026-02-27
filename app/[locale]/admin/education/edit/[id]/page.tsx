"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function EditEducation({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    school: "", major: "", logo: "", degree: "",
    start_year: "", end_year: "", link: "", location: "", gpa: "",
  });

  // Tarik data lama berdasarkan ID
  useEffect(() => {
    const fetchOldData = async () => {
      const { data, error } = await supabase.from("educations").select("*").eq("id", params.id).single();
      if (data) {
        setFormData({
          school: data.school, major: data.major, logo: data.logo || "", degree: data.degree,
          start_year: data.start_year?.toString() || "", end_year: data.end_year?.toString() || "", 
          link: data.link || "", location: data.location, gpa: data.gpa || "",
        });
      }
      setFetching(false);
    };
    fetchOldData();
  }, [params.id]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: dbError } = await supabase.from("educations").update({
        school: formData.school, major: formData.major, logo: formData.logo || null, degree: formData.degree,
        start_year: parseInt(formData.start_year), end_year: formData.end_year ? parseInt(formData.end_year) : null,
        link: formData.link || null, location: formData.location, gpa: formData.gpa || null,
      }).eq("id", params.id);

      if (dbError) throw dbError;

      alert("✅ Data Pendidikan berhasil diperbarui!");
      router.push("/admin"); 
      
    } catch (error: any) {
      alert("❌ Gagal Update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-20 animate-pulse text-neutral-500">Menarik data sekolah... ⏳</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">✏️ Edit Data Pendidikan</h1>
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Nama Sekolah / Kampus</label>
          <input required name="school" value={formData.school} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Jurusan</label>
          <input required name="major" value={formData.major} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tingkat Pendidikan</label>
          <input required name="degree" value={formData.degree} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Lokasi</label>
          <input required name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tahun Mulai</label>
          <input required type="number" name="start_year" value={formData.start_year} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Tahun Selesai</label>
          <input type="number" name="end_year" value={formData.end_year} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Nilai / GPA</label>
          <input name="gpa" value={formData.gpa} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link Web Sekolah</label>
          <input name="link" value={formData.link} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
          <div><label className="block text-sm mb-1 text-neutral-600 dark:text-neutral-300">Link Logo</label>
          <input name="logo" value={formData.logo} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-neutral-800 outline-none" /></div>
        </div>

        <div className="flex gap-4 mt-6">
          <button type="button" onClick={() => router.push("/admin")} className="w-1/3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-bold py-3 px-4 rounded-lg transition-colors">Batal</button>
          <button type="submit" disabled={loading} className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            {loading ? "Menyimpan Perubahan..." : "Update Data"}
          </button>
        </div>
      </form>
    </div>
  );
}