import Breakline from "@/common/components/elements/Breakline";
import Introduction from "./Introduction";
import SkillList from "./SkillList";
import Link from "next/link";
import { HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineArrowRight } from "react-icons/hi2";

// 👉 1. IMPORT SERVICE DATABASE BOS DI SINI
// Saya melihat di file tree Bos ada folder services. 
// Nanti uncomment (hapus garis miring) pada kode di bawah ini dan sesuaikan nama fungsinya!
// import { getCareers } from "@/services/careers"; 
// import { getAchievements } from "@/services/achievements";

// 👉 2. UBAH JADI ASYNC COMPONENT AGAR BISA FETCH DATA
const Home = async () => {
  
  // 👉 3. LOGIKA AMBIL DATA DARI DATABASE
  // Uncomment blok kode di bawah ini jika file services Bos sudah siap!
  
  /*
  const allCareers = await getCareers();
  const allAchievements = await getAchievements();

  // Ambil 2 saja yang paling ditonjolkan (Bisa pakai filter atau langsung slice 2 teratas)
  const featuredExperiences = allCareers
    // .filter((career: any) => career.is_featured === true) // Opsional: kalau di DB ada penanda khusus
    .slice(0, 2); // Ambil 2 data pertama

  const featuredCertificates = allAchievements
    // .filter((cert: any) => cert.is_featured === true) // Opsional
    .slice(0, 2); // Ambil 2 data pertama
  */
  const featuredExperiences = [
    {
      id: 1,
      role: "Full-Stack Web Developer (Intern)",
      company: "Ritecs (Riset Teknologi dan Inovasi Computer Science)",
      date: "Agu 2025 - Des 2025",
      description: "Mengembangkan sistem berbasis web untuk riset dan inovasi teknologi dari tahap perancangan hingga presentasi akhir.",
    },
    {
      id: 2,
      role: "Web Developer (Freelance)",
      company: "Freelance",
      date: "July 2025 - Now",
      description: "Membangun Website seperti Lapak Siswa dan mendevelop sistem pencatatan keuangan F&B menggunakan Laravel & React.",
    }
  ];

  const featuredCertificates = [
    {
      id: 1,
      title: "IBM SkillsBuild: AI Ethics and Responsible AI",
      issuer: "IBM SkillsBuild",
      year: "2026",
      image: "/images/careers/ai.webp", 
    },
    {
      id: 2,
      title: "Penerapan Data Science dengan Microsoft Fabric",
      issuer: "Dicoding Indonesia",
      year: "2026",
      image: "/images/careers/d.png",
    }
  ];
  

  return (
    <div className="space-y-12 animate-fade-in">
      
      <Introduction />
      <Breakline className="my-6" />
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <HiOutlineBriefcase className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2>Pengalaman Utama</h2>
          </div>
          <Link href="/about" className="text-sm font-medium text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors group">
            Lihat Sekengkapnya <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid gap-5 md:grid-cols-2">
          {featuredExperiences?.map((exp: any, index: number) => (
            // Menggunakan index sebagai fallback key jika ID tidak ada
            <div key={exp.id || index} className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/50 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <div className="text-xs font-semibold tracking-wider text-neutral-400 mb-3 uppercase">{exp.date}</div>
              <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 transition-colors">{exp.role || exp.position}</h3>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-3">{exp.company}</div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Breakline className="my-6" />

      {/* SECTION SERTIFIKAT DENGAN GAMBAR */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
              <HiOutlineAcademicCap className="text-teal-600 dark:text-teal-400" />
            </div>
            <h2>Sertifikat Pilihan</h2>
          </div>
          <Link href="/achievements" className="text-sm font-medium text-neutral-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 transition-colors group">
            Lihat Semua <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {featuredCertificates?.map((cert: any, index: number) => (
            <div key={cert.id || index} className="group flex flex-col sm:flex-row items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 hover:border-teal-500 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden">
              
              <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden relative flex-shrink-0 border border-neutral-200 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-800">
                <img 
                  // Pastikan nama properti gambar sesuai dengan database Bos (misal: cert.image_url atau cert.image)
                  src={cert.image || cert.image_url || "/images/placeholder.webp"} 
                  alt={cert.title} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 text-center sm:text-left w-full">
                <h3 className="font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-teal-500 transition-colors line-clamp-1">
                  {cert.title}
                </h3>
                {/* Sesuaikan properti publisher/issuer dengan database */}
                <p className="text-sm text-neutral-500 mb-2 line-clamp-1">{cert.issuer || cert.publisher}</p>
                <div className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-md">
                  {/* Sesuaikan properti tahun (bisa tahun aja, atau format tanggal) */}
                  {cert.year || cert.date}
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      <Breakline className="my-6" />
      
      {/* TECH STACK SECTION */}
      <div className="pt-4">
        <SkillList />
      </div>
      
    </div>
  );
};

export default Home;