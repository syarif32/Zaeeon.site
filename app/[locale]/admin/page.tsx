"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineTrophy, HiOutlineQrCode, HiOutlineTrash, HiOutlinePencil } from "react-icons/hi2";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  
  // State data
  const [careers, setCareers] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]); 
  
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [isCleaning, setIsCleaning] = useState(false);
  const ADMIN_EMAIL = "najwasyarif563@gmail.com"; 

  // --- FUNGSI TARIK DATA ---
  const fetchCareers = async () => {
    const { data } = await supabase.from("careers").select("*").order("start_date", { ascending: false });
    if (data) setCareers(data);
  };

  const fetchEducations = async () => {
    const { data } = await supabase.from("educations").select("*").order("start_year", { ascending: false });
    if (data) setEducations(data);
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("id", { ascending: false });
    if (data) setProjects(data);
  };

  const fetchAchievements = async () => {
    // Menarik data dari tabel achievements milik Anda
    const { data } = await supabase.from("achievements").select("*").order("issue_date", { ascending: false });
    if (data) setAchievements(data);
  };

  
  const handleDeleteCareer = async (id: number, companyName: string) => {
    if (!window.confirm(`Hapus data magang di ${companyName}?`)) return;
    const { error } = await supabase.from("careers").delete().eq("id", id);
    if (!error) { alert("✅ Dihapus!"); fetchCareers(); }
  };

  const handleDeleteEducation = async (id: number, schoolName: string) => {
    if (!window.confirm(`Hapus data pendidikan di ${schoolName}?`)) return;
    const { error } = await supabase.from("educations").delete().eq("id", id);
    if (!error) { alert("✅ Dihapus!"); fetchEducations(); }
  };

  const handleDeleteProject = async (id: number, title: string) => {
    if (!window.confirm(`Hapus data proyek ${title}?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) { alert("✅ Proyek Dihapus!"); fetchProjects(); }
  };

  const handleDeleteAchievement = async (id: number, name: string) => {
    if (!window.confirm(`Hapus sertifikat/penghargaan: ${name}?`)) return;
    const { error: dbError } = await supabase.from("achievements").delete().eq("id", id);
    
    if (!dbError) { 
      alert("✅ Penghargaan Dihapus!"); 
      fetchAchievements(); 
    }
  };
  const handleCleanupChat = async () => {
    if (!window.confirm(`Yakin ingin menghapus semua chat yang lebih tua dari ${retentionDays} hari?`)) return;
    setIsCleaning(true);
    try {
      const res = await fetch("/api/chat/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: retentionDays }),
      });
      if (res.ok) {
        alert(`✅ Sukses! Chat lebih dari ${retentionDays} hari telah dihapus.`);
      } else {
        alert("❌ Gagal membersihkan chat.");
      }
    } catch (error) {
      alert("❌ Terjadi kesalahan jaringan.");
    } finally {
      setIsCleaning(false);
    }
  };

  // Jalankan saat halaman dibuka
  useEffect(() => {
    if (session?.user?.email === ADMIN_EMAIL) {
      fetchCareers();
      fetchEducations();
      fetchProjects();
      fetchAchievements(); // Panggil data penghargaan
    }
  }, [session]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center animate-pulse">Loading</div>;

  if (!session || session?.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-500">Akses Ditolak! 🚫</h1>
        <p className="p-3 bg-red-100 text-red-800 rounded-lg font-mono text-sm">
          Sistem mendeteksi Anda login dengan email: <b>{session?.user?.email || "Belum Login"}</b>
        </p>
        <Link href="/chat" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Kembali & Login Ulang</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 mt-10 mb-20">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Dashboard Admin Web Porto Eaa</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Selamat datang {session.user?.name}!</p>
        </div>
        <img src={session.user?.image || ""} alt="Profile" className="w-12 h-12 rounded-full border-2 border-blue-500" />
      </div>

      <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Menu Tambah Data (Insert)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Link href="/admin/project/insert-project" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all group">
          <HiOutlineQrCode className="text-4xl text-neutral-400 group-hover:text-blue-500 mb-3" />
          <span className="font-semibold dark:text-neutral-200">Proyek Baru</span>
        </Link>
        <Link href="/admin/career/insert" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all group">
          <HiOutlineBriefcase className="text-4xl text-neutral-400 group-hover:text-purple-500 mb-3" />
          <span className="font-semibold dark:text-neutral-200">Karier / Magang</span>
        </Link>
        <Link href="/admin/education/insert-educations" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all group">
          <HiOutlineAcademicCap className="text-4xl text-neutral-400 group-hover:text-emerald-500 mb-3" />
          <span className="font-semibold dark:text-neutral-200">Pendidikan</span>
        </Link>
        
       
        <Link href="/admin/certif/insert" className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all group">
          <HiOutlineTrophy className="text-4xl text-neutral-400 group-hover:text-orange-500 mb-3" />
          <span className="font-semibold dark:text-neutral-200">Sertifikat</span>
        </Link>
      </div>

      {/* PANEL MANAJEMEN CHAT (BARU) */}
      <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Manajemen Ruang Chat</h2>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-bold text-red-800 dark:text-red-400 text-lg">Pembersih Obrolan Otomatis</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            Hapus pesan-pesan obrolan jomoks
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden">
            <span className="px-3 text-sm text-neutral-500">Waktu (Hari):</span>
            <input 
              type="number" 
              min="1" 
              max="30" 
              value={retentionDays} 
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-16 p-2 text-center outline-none dark:bg-neutral-800 font-bold"
            />
          </div>
          <button 
            onClick={handleCleanupChat}
            disabled={isCleaning}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors whitespace-nowrap"
          >
            {isCleaning ? "Menghapus..." : " Bersihkan Chat"}
          </button>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Manajemen Data: Sertifikat & Penghargaan</h2>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm mb-10">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-800">
            <tr><th className="px-6 py-4">Nama Sertifikat</th><th className="px-6 py-4">Penyelenggara</th><th className="px-6 py-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {achievements.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-neutral-500">Belum ada data Sertifikat.</td></tr>
            ) : (
              achievements.map((ach) => (
                <tr key={ach.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-6 py-4 font-medium text-orange-600 dark:text-orange-400">{ach.name}</td>
                  <td className="px-6 py-4">{ach.issuing_organization}</td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <Link href={`/admin/certif/edit/${ach.id}`} className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg block"><HiOutlinePencil size={18} /></Link>
                    <button onClick={() => handleDeleteAchievement(ach.id, ach.name)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"><HiOutlineTrash size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TABEL PROYEK */}
      <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Manajemen Data: Proyek</h2>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm mb-10">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-800">
            <tr><th className="px-6 py-4">Judul Proyek</th><th className="px-6 py-4">Slug (URL)</th><th className="px-6 py-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{project.title}</td>
                <td className="px-6 py-4 font-mono text-xs">{project.slug}</td>
                <td className="px-6 py-4 flex justify-center gap-3">
                  <Link href={`/admin/project/edit/${project.id}`} className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg"><HiOutlinePencil size={18} /></Link>
                  <button onClick={() => handleDeleteProject(project.id, project.title)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"><HiOutlineTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TABEL KARIER */}
      <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Manajemen Data: Karier & Magang</h2>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm mb-10">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-800">
            <tr><th className="px-6 py-4">Posisi</th><th className="px-6 py-4">Perusahaan</th><th className="px-6 py-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {careers.map((career) => (
              <tr key={career.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-6 py-4 font-medium">{career.position}</td>
                <td className="px-6 py-4">{career.company}</td>
                <td className="px-6 py-4 flex justify-center gap-3">
                  <Link href={`/admin/career/edit/${career.id}`} className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg"><HiOutlinePencil size={18} /></Link>
                  <button onClick={() => handleDeleteCareer(career.id, career.company)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"><HiOutlineTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TABEL PENDIDIKAN */}
      <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Manajemen Data: Pendidikan</h2>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-800">
            <tr><th className="px-6 py-4">Sekolah / Kampus</th><th className="px-6 py-4">Jurusan</th><th className="px-6 py-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {educations.map((edu) => (
              <tr key={edu.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-6 py-4 font-medium">{edu.school}</td>
                <td className="px-6 py-4">{edu.major}</td>
                <td className="px-6 py-4 flex justify-center gap-3">
                  <Link href={`/admin/education/edit/${edu.id}`} className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg"><HiOutlinePencil size={18} /></Link>
                  <button onClick={() => handleDeleteEducation(edu.id, edu.school)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"><HiOutlineTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}