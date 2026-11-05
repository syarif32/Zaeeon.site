
import Link from "next/link";

import {
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
} from "react-icons/hi2";

import Breakline from "@/common/components/elements/Breakline";

import Introduction from "./Introduction";
import SkillList from "./SkillList";
import FeaturedCareers from "./FeaturedCareers";

// data pengalaman utama
const featuredExperiences = [
  {
    id: 1,
    role: "Information Tech Programmer",
    company: "PT Cipta Wijaya Mandiri",
    date: "Sep 2026 - Sekarang",
    description:
      "Menggelola dan mengembangkan sistem internal perusahaan, termasuk pemeliharaan server, pengembangan aplikasi web, dan integrasi sistem untuk meningkatkan efisiensi operasional.",
  },
  {
    id: 2,
    role: "Full-Stack Web Developer (Intern)",
    company: "Ritecs (Riset Teknologi dan Inovasi Computer Science)",
    date: "Agu 2025 - Des 2025",
    description:
      "Mengembangkan sistem berbasis web untuk riset dan inovasi teknologi dari tahap perancangan hingga presentasi akhir.",
  },
  {
    id: 3,
    role: "Full-Stack Web Developer (Intern)",
    company: "Dinas Komunikasi dan Informatika Kota Semarang",
    date: "Apr 2026 - Mei 2026",
    description:
      "Mengembangkan sistem manajemen dokumen yang terintegrasi dengan cloud untuk meningkatkan efisiensi pengelolaan dokumen di lingkungan pemerintahan.",
  },
  {
    id: 4,
    role: "Web Developer (Freelance)",
    company: "Freelance",
    date: "Jul 2025 - Sekarang",
    description:
      "Membangun website UMKM dan mengembangkan sistem pencatatan keuangan F&B menggunakan Laravel dan Next.js.",
  },
];

// data sertifikat pilihan
const featuredCertificates = [
  {
    id: 1,
    title: "Web Developer",
    issuer: "Badan Nasional Sertifikasi Profesi (BNSP)",
    year: "2026",
    image: "/images/careers/web.webp",
  },
  {
    id: 2,
    title: "Mobile App Developer",
    issuer: "Badan Nasional Sertifikasi Profesi (BNSP)",
    year: "2026",
    image: "/images/careers/mobile.webp",
  },
];

const Home = () => {
  return (
    <div
      data-responsive-home
      className="animate-fade-in space-y-12"
    >
      <Introduction />

      <Breakline className="my-6" />

      {/* pengalaman utama */}
      <FeaturedCareers />

      <Breakline className="my-6" />

      {/* sertifikat pilihan */}
      <section className="space-y-6">
        {/* section heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
              <HiOutlineAcademicCap
                size={21}
                className="text-teal-600 dark:text-teal-400"
              />
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
              Sertifikat Pilihan
            </h2>
          </div>

          <Link
            href="/achievements"
            className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-teal-600 dark:text-neutral-400 dark:hover:text-teal-400"
          >
            Lihat Semua

            <HiOutlineArrowRight
              size={16}
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* certificate cards */}
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {featuredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="group flex h-full min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:border-teal-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-teal-700 sm:flex-row sm:items-start"
            >
              {/* gambar sertifikat */}
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 sm:h-24 sm:w-32">
                <img
                  src={cert.image}
                  alt={cert.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* informasi sertifikat */}
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="break-words text-sm font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-teal-600 dark:text-neutral-100 dark:group-hover:text-teal-400">
                  {cert.title}
                </h3>

                <p className="mt-2 break-words text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {cert.issuer}
                </p>

                <div className="mt-3">
                  <span className="inline-flex rounded-md bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    {cert.year}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Breakline className="my-6" />

      {/* teknologi yang digunakan */}
      <div className="pt-4">
        <SkillList />
      </div>
    </div>
  );
};

export default Home;
