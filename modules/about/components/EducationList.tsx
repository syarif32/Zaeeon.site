"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HiOutlineAcademicCap as EducationIcon } from "react-icons/hi";
import { createClient } from "@supabase/supabase-js";

import SectionHeading from "@/common/components/elements/SectionHeading";
import SectionSubHeading from "@/common/components/elements/SectionSubHeading";
import { EducationProps } from "@/common/types/education";
import EducationCard from "./EducationCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const EducationList = () => {
  const t = useTranslations("AboutPage.education");
  
  const [educations, setEducations] = useState<EducationProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducations = async () => {
      try {
        const { data, error } = await supabase
          .from("educations")
          .select("*")
          .eq("is_show", true)
          .order("end_year", { ascending: false });

        if (error) throw error;
        const formattedData = data?.map((item: any) => ({
       ...item,
       GPA: item.gpa
     }));
     setEducations(formattedData || []);
      } catch (error) {
        console.error("Gagal menarik data pendidikan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEducations();
  }, []);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <SectionHeading title={t("title")} icon={<EducationIcon />} />
        <SectionSubHeading>
          <p>{t("sub_title")}</p>
        </SectionSubHeading>
      </div>

      {loading ? (
        <div className="animate-pulse text-sm text-neutral-500">
          Memuat riwayat pendidikan...
        </div>
      ) : educations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {educations.map((item, index) => (
            <EducationCard key={index} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-neutral-500">
          Belum ada data riwayat pendidikan yang ditampilkan.
        </div>
      )}
    </section>
  );
};

export default EducationList;