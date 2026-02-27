"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HiOutlineBriefcase as CareerIcon } from "react-icons/hi";
import { createClient } from "@supabase/supabase-js";

import SectionHeading from "@/common/components/elements/SectionHeading";
import SectionSubHeading from "@/common/components/elements/SectionSubHeading";
import { CareerProps } from "@/common/types/careers";
import CareerCard from "./CareerCard";

// Memanggil Satpam Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const CareerList = () => {
  const t = useTranslations("AboutPage.career");
  
  // State untuk menyimpan data dari database
  const [careers, setCareers] = useState<CareerProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Menarik data dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const { data, error } = await supabase
          .from("careers")
          .select("*")
          .eq("is_show", true)
          .order("start_date", { ascending: false }); // Otomatis mengurutkan dari yang paling baru

        if (error) throw error;
        setCareers(data || []);
      } catch (error) {
        console.error("Gagal menarik data karier:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <SectionHeading title={t("title")} icon={<CareerIcon />} />
        <SectionSubHeading>
          <p>{t("sub_title")}</p>
        </SectionSubHeading>
      </div>

      {loading ? (
        <div className="animate-pulse text-sm text-neutral-500">
          Memuat pengalaman karier...
        </div>
      ) : careers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {careers.map((career, index) => (
            <CareerCard key={index} {...career} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-neutral-500">
          Belum ada data pengalaman karier yang ditampilkan.
        </div>
      )}
    </section>
  );
};

export default CareerList;