"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlineChartBar,
  HiOutlineDevicePhoneMobile,
  HiOutlineGlobeAlt,
  HiOutlineArrowRight,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineSparkles,
} from "react-icons/hi2";

const digitalServicesData = [
  {
    id: "kasir",
    icon: <HiOutlineChartBar size={32} />,
    title: "Sistem Kasir & Keuangan UMKM",
    description: "Digitalisasi total warung atau toko Anda. Tinggalkan nota kertas, pantau omzet dari HP.",
    priceRange: "Rp 1.500.000 - Rp 3.500.000",
    popular: true,
    features: ["Aplikasi Point of Sales (POS)", "Pencatatan Pemasukan & Pengeluaran", "Manajemen Stok Barang", "Laporan Laba/Rugi Otomatis", "Hosting & Domain 1 Tahun"]
  },
  {
    id: "web",
    icon: <HiOutlineGlobeAlt size={32} />,
    title: "Website Company Profile",
    description: "Tingkatkan kredibilitas bisnis Anda dengan website profesional yang cepat dan SEO-Friendly.",
    priceRange: "Rp 250.000 - Rp 2.500.000",
    popular: false,
    features: ["Desain Premium & Responsif (HP/PC)", "Optimasi SEO Dasar (Masuk Google)", "Integrasi Tombol WhatsApp", "Halaman Admin (Bisa update konten)", "Gratis Domain (.com/.id) 1 Tahun"]
  },
  {
    id: "mobile",
    icon: <HiOutlineDevicePhoneMobile size={32} />,
    title: "Aplikasi Android (Custom)",
    description: "Hadirkan bisnis Anda di genggaman pelanggan. Cocok untuk sistem internal atau marketplace lokal.",
    priceRange: "Rp 3.000.000 - Rp 8.000.000",
    popular: false,
    features: ["Aplikasi Android (APK/AAB)", "Desain UI/UX Modern", "Sistem Login & Database Realtime", "Fitur Notifikasi (Push Notification)", "Bantuan Upload ke Google Play Store"]
  }
];

// --- DATA: BISNIS KULINER ---
const kulinerServicesData = [
  {
    id: "porsi_harian",
    icon: <HiOutlineShoppingBag size={32} />,
    title: "Dine-in & Takeaway",
    description: "Nikmati semangkuk Mie Kopyok legendaris resep rahasia keluarga langsung di kedai kami atau bawa pulang untuk keluarga.",
    priceRange: "Mulai Rp 10.000 / Porsi",
    popular: true,
    features: ["Resep Otentik Semarang Asli", "Bahan Segar Setiap Hari", "Porsi Mengenyangkan", "Bisa Pesan via GoFood/GrabFood", "Tempat Nyaman & Bersih"]
  },
  {
    id: "catering",
    icon: <HiOutlineUserGroup size={32} />,
    title: "Catering & Pesanan Acara",
    description: "Sajikan menu tradisional yang menggugah selera untuk acara syukuran, arisan, atau meeting kantor Anda.",
    priceRange: "Menyesuaikan Jumlah Pesanan",
    popular: false,
    features: ["Harga Khusus untuk Partai Besar", "Lengkap dengan Peralatan Makan", "Diantar Tepat Waktu", "Pilihan Menu Tambahan", "Higienis dan Profesional"]
  },
  {
    id: "kemitraan",
    icon: <HiOutlineSparkles size={32} />,
    title: "Kemitraan / Franchise",
    description: "Tertarik membuka cabang Mie Kopyok di kota Anda? Kami membuka peluang kerja sama dengan sistem yang sudah teruji.",
    priceRange: "Hubungi Kami",
    popular: false,
    features: ["Sistem Kasir Digital (Gratis)", "Suplai Bumbu Rahasia", "Panduan Manajemen Outlet", "Dukungan Marketing"]
  }
];

export default function LayananPage() {
  const [category, setCategory] = useState<"digital" | "kuliner">("digital");
  const isKuliner = category === "kuliner";
  const currentData = isKuliner ? kulinerServicesData : digitalServicesData;

  return (
    <div data-responsive-services className="px-5 pb-16 pt-8 sm:px-8 lg:px-0 lg:pt-8">
      <header className="space-y-4">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {isKuliner ? "WARISAN RASA SEMARANG" : "SOLUSI TEKNOLOGI UMKM"}
        </p>
        <h1 className="text-2xl font-medium leading-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {isKuliner ? "Cita Rasa Legendaris Kuliner Khas" : "Digitalisasi Mudah untuk Bisnis Modern Anda."}
        </h1>
        <p className="max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400">
          {isKuliner
            ? "Lebih dari sekadar makanan. Ini adalah dedikasi rasa yang dipertahankan turun temurun. Siap memanjakan lidah Anda untuk porsi harian maupun acara besar."
            : "Berawal dari pencatatan keuangan, saya menyadari UMKM butuh teknologi yang mudah dan terjangkau. Mari digitalisasi bisnis Anda bersama saya."}
        </p>
      </header>

      <nav aria-label="Kategori layanan" className="mt-10 flex gap-7 border-b border-neutral-300 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => setCategory("digital")}
          aria-current={!isKuliner ? "page" : undefined}
          className={"border-b-2 pb-3 text-left text-sm font-medium transition-colors " + (!isKuliner ? "border-primary text-neutral-900 dark:text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200")}
        >
          Solusi Digital
        </button>
        <button
          type="button"
          onClick={() => setCategory("kuliner")}
          aria-current={isKuliner ? "page" : undefined}
          className={"border-b-2 pb-3 text-left text-sm font-medium transition-colors " + (isKuliner ? "border-primary text-neutral-900 dark:text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200")}
        >
          Bisnis Kuliner
        </button>
      </nav>

      <div>
        {currentData.map((service, index) => (
          <article key={service.id} className="border-b border-neutral-300 py-8 dark:border-neutral-700 sm:py-10">
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="pt-1 font-mono text-xs text-neutral-400 dark:text-neutral-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1 space-y-5">
                <div className="flex flex-wrap items-start gap-3 sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <span className="[&>svg]:h-5 [&>svg]:w-5">{service.icon}</span>
                      {service.popular && <span className="text-xs">Paling banyak dicari</span>}
                    </div>
                    <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                      {service.title}
                    </h2>
                  </div>
                  <p className="w-full text-base font-medium text-neutral-800 dark:text-neutral-200 sm:w-auto sm:max-w-[45%] sm:text-right">
                    {service.priceRange}
                  </p>
                </div>

                <p className="max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {service.description}
                </p>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">Layanan meliputi</h3>
                  <ul className="grid gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={isKuliner ? "https://miekopyokzain.my.id" : "https://wa.me/6289646753644"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  {isKuliner ? "Kunjungi Web" : "Konsultasi Proyek via WA"}
                  <HiOutlineArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
