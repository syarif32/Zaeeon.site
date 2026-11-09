
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { HiOutlineUserGroup } from "react-icons/hi2";

import SectionHeading from "@/common/components/elements/SectionHeading";
import SectionSubHeading from "@/common/components/elements/SectionSubHeading";
import type { Organization } from "@/common/types/organizations";
import OrganizationCard from "./OrganizationCard";

export default function OrganizationList() {
  const t = useTranslations("AboutPage.organization");
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
          throw new Error("Supabase belum dikonfigurasi");
        }

        const db = createClient(url, key);

        const result = await db
          .from("organizations")
          .select(
            "id,name,role,period,location,description,logo_url,photos,is_show,sort_order"
          )
          .eq("is_show", true)
          .order("sort_order", { ascending: true })
          .order("id", { ascending: false });

        if (result.error) throw result.error;

        if (active) {
          setItems((result.data ?? []) as Organization[]);
        }
      } catch (cause) {
        console.error("Gagal memuat organisasi:", cause);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <SectionHeading
          title={t("title")}
          icon={<HiOutlineUserGroup />}
        />
        <SectionSubHeading>
          <p>{t("sub_title")}</p>
        </SectionSubHeading>
      </div>

      {loading ? (
        <p className="animate-pulse text-sm text-neutral-500">
          {t("loading")}
        </p>
      ) : error ? (
        <p className="text-sm text-neutral-500">
          {t("error")}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
            />
          ))}
        </div>
      )}
    </section>
  );
}
