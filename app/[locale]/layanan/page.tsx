"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HiOutlineChartBar, 
  HiOutlineDevicePhoneMobile, 
  HiOutlineGlobeAlt, 
  HiCheckCircle,
  HiOutlineArrowRight,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineSparkles
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
  
  
  const [activeService, setActiveService] = useState(digitalServicesData[0].id);

 
  useEffect(() => {
    if (category === "digital") setActiveService(digitalServicesData[0].id);
    else setActiveService(kulinerServicesData[0].id);
  }, [category]);
  const isKuliner = category === "kuliner";
  const currentData = isKuliner ? kulinerServicesData : digitalServicesData;
  const currentService = currentData.find(s => s.id === activeService);
  const theme = {
    bgBadge: isKuliner ? "bg-orange-100 dark:bg-orange-900/30" : "bg-blue-100 dark:bg-blue-900/30",
    textBadge: isKuliner ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300",
    borderBadge: isKuliner ? "border-orange-200 dark:border-orange-800" : "border-blue-200 dark:border-blue-800",
    textHighlight: isKuliner ? "from-orange-500 to-red-500" : "from-blue-600 to-teal-500",
    bgActiveTab: isKuliner ? "bg-orange-500 text-white border-orange-500 shadow-orange-500/30" : "bg-blue-600 text-white border-blue-600 shadow-blue-500/30",
    hoverTab: isKuliner ? "hover:border-orange-400 dark:hover:border-orange-700" : "hover:border-blue-400 dark:hover:border-blue-700",
    glowColor: isKuliner ? "bg-orange-500/10" : "bg-blue-500/10",
    textPrice: isKuliner ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400",
    iconCheck: isKuliner ? "text-orange-500" : "text-teal-500",
    btnSubmit: isKuliner ? "hover:bg-orange-600 dark:hover:bg-orange-500" : "hover:bg-blue-600 dark:hover:bg-blue-500",
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex justify-center animate-fade-in-up">
          <div className="bg-neutral-200/50 dark:bg-neutral-800/50 p-1.5 rounded-full flex gap-1 shadow-inner backdrop-blur-sm border border-neutral-300/50 dark:border-neutral-700/50">
            <button 
              onClick={() => setCategory("digital")}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                !isKuliner ? "bg-white dark:bg-neutral-900 shadow-md text-blue-600 dark:text-blue-400" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              💻 Solusi Digital
            </button>
            <button 
              onClick={() => setCategory("kuliner")}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                isKuliner ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-md text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              🍜 Bisnis Kuliner
            </button>
          </div>
        </div>
        <section className="text-center space-y-6 animate-fade-in-up" key={category}>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold tracking-wide mb-2 shadow-sm border ${theme.bgBadge} ${theme.textBadge} ${theme.borderBadge}`}>
            {isKuliner ? "WARISAN RASA SEMARANG" : "SOLUSI TEKNOLOGI UMKM"}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight transition-colors">
            {isKuliner ? "Cita Rasa Legendaris " : "Digitalisasi Mudah untuk "}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.textHighlight}`}>
              {isKuliner ? "Kuliner Khas" : "Bisnis Modern Anda."}
            </span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {isKuliner 
              ? "Lebih dari sekadar makanan. Ini adalah dedikasi rasa yang dipertahankan turun temurun. Siap memanjakan lidah Anda untuk porsi harian maupun acara besar."
              : "Berawal dari pencatatan keuangan, saya menyadari UMKM butuh teknologi yang mudah dan terjangkau. Mari digitalisasi bisnis Anda bersama saya."}
          </p>
        </section>

        {/* INTERACTIVE SERVICES SECTION */}
        <section className="space-y-8">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-3">
              {currentData.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setActiveService(service.id)}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 border ${
                    activeService === service.id
                      ? `${theme.bgActiveTab} transform scale-[1.02]`
                      : `bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 ${theme.hoverTab} hover:bg-neutral-50 dark:hover:bg-neutral-800`
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 ${activeService === service.id ? "bg-white/20" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                    {service.icon}
                  </div>
                  <div>
                    <div className="font-bold">{service.title}</div>
                    <div className={`text-xs mt-1 ${activeService === service.id ? "text-white/80" : "text-neutral-500"}`}>
                      {service.popular ? "⭐ Paling banyak dicari" : "Tersedia untuk Anda"}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* KANAN: Detail Card Dinamis */}
            <div className="lg:col-span-7">
              {currentService && (
                <div key={currentService.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl relative overflow-hidden h-full flex flex-col animate-fade-in">
                  
                  {/* Efek Background Glow (Warna berubah sesuai tema) */}
                  <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors ${theme.glowColor}`}></div>
                  
                  {currentService.popular && (
                    <div className={`absolute top-4 right-6 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md bg-gradient-to-r ${theme.textHighlight}`}>
                      BEST CHOICE
                    </div>
                  )}

                  <div className="relative z-10 flex-1 mt-4">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{currentService.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
                      {currentService.description}
                    </p>

                    <div className="my-6 p-4 bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                      <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Estimasi Biaya</div>
                      <div className={`text-3xl font-extrabold ${theme.textPrice}`}>
                        {currentService.priceRange}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">Layanan meliputi:</div>
                      {currentService.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <HiCheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme.iconCheck}`} />
                          <span className="text-neutral-700 dark:text-neutral-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <Link
                      href="https://wa.me/6289646753644" 
                      target="_blank"
                      className={`group flex items-center justify-center gap-2 w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl ${theme.btnSubmit}`}
                    >
                      <span>{isKuliner ? "Hubungi via WhatsApp" : "Konsultasi Proyek via WA"}</span>
                      <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                </div>
              )}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}