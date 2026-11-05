
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
import FeaturedCertificates from "./FeaturedCertificates";

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
      <FeaturedCertificates />

      <Breakline className="my-6" />

      {/* teknologi yang digunakan */}
      <div className="pt-4">
        <SkillList />
      </div>
    </div>
  );
};

export default Home;
