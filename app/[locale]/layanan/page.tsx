"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  HiOutlineChartBar,
  HiOutlineDevicePhoneMobile,
  HiOutlineGlobeAlt,
  HiOutlineArrowRight,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineSparkles,
} from "react-icons/hi2";

export default function LayananPage() {
  const t = useTranslations("ServicesPage");
const digitalServicesData = [
  {
    id: "kasir",
    icon: <HiOutlineChartBar size={32} />,
    title: t("kasir_title"),
    description: t("kasir_description"),
    priceRange: t("kasir_priceRange"),
    popular: true,
    features: [t("kasir_feature_0"), t("kasir_feature_1"), t("kasir_feature_2"), t("kasir_feature_3"), t("kasir_feature_4")]
  },
  {
    id: "web",
    icon: <HiOutlineGlobeAlt size={32} />,
    title: t("web_title"),
    description: t("web_description"),
    priceRange: t("web_priceRange"),
    popular: false,
    features: [t("web_feature_0"), t("web_feature_1"), t("web_feature_2"), t("web_feature_3"), t("web_feature_4")]
  },
  {
    id: "mobile",
    icon: <HiOutlineDevicePhoneMobile size={32} />,
    title: t("mobile_title"),
    description: t("mobile_description"),
    priceRange: t("mobile_priceRange"),
    popular: false,
    features: [t("mobile_feature_0"), t("mobile_feature_1"), t("mobile_feature_2"), t("mobile_feature_3"), t("mobile_feature_4")]
  }
];

// --- DATA: BISNIS KULINER ---
const kulinerServicesData = [
  {
    id: "porsi_harian",
    icon: <HiOutlineShoppingBag size={32} />,
    title: t("porsi_harian_title"),
    description: t("porsi_harian_description"),
    priceRange: t("porsi_harian_priceRange"),
    popular: true,
    features: [t("porsi_harian_feature_0"), t("porsi_harian_feature_1"), t("porsi_harian_feature_2"), t("porsi_harian_feature_3"), t("porsi_harian_feature_4")]
  },
  {
    id: "catering",
    icon: <HiOutlineUserGroup size={32} />,
    title: t("catering_title"),
    description: t("catering_description"),
    priceRange: t("catering_priceRange"),
    popular: false,
    features: [t("catering_feature_0"), t("catering_feature_1"), t("catering_feature_2"), t("catering_feature_3"), t("catering_feature_4")]
  },
  {
    id: "kemitraan",
    icon: <HiOutlineSparkles size={32} />,
    title: t("kemitraan_title"),
    description: t("kemitraan_description"),
    priceRange: t("kemitraan_priceRange"),
    popular: false,
    features: [t("kemitraan_feature_0"), t("kemitraan_feature_1"), t("kemitraan_feature_2"), t("kemitraan_feature_3")]
  }
];


  const [category, setCategory] = useState<"digital" | "kuliner">("digital");
  const isKuliner = category === "kuliner";
  const currentData = isKuliner ? kulinerServicesData : digitalServicesData;

  return (
    <div data-responsive-services className="px-5 pb-16 pt-8 sm:px-8 lg:px-0 lg:pt-8">
      <header className="space-y-4">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {isKuliner ? t("culinaryTag") : t("digitalTag")}
        </p>
        <h1 className="text-2xl font-medium leading-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {isKuliner ? t("culinaryTitle") : t("digitalTitle")}
        </h1>
        <p className="max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400">
          {isKuliner
            ? t("culinaryIntro")
            : t("digitalIntro")}
        </p>
      </header>

      <nav aria-label={t("categories")} className="mt-10 flex gap-7 border-b border-neutral-300 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => setCategory("digital")}
          aria-current={!isKuliner ? "page" : undefined}
          className={"border-b-2 pb-3 text-left text-sm font-medium transition-colors " + (!isKuliner ? "border-primary text-neutral-900 dark:text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200")}
        >
          {t("digital")}
        </button>
        <button
          type="button"
          onClick={() => setCategory("kuliner")}
          aria-current={isKuliner ? "page" : undefined}
          className={"border-b-2 pb-3 text-left text-sm font-medium transition-colors " + (isKuliner ? "border-primary text-neutral-900 dark:text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200")}
        >
          {t("culinary")}
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
                      {service.popular && <span className="text-xs">{t("popular")}</span>}
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
                  <h3 className="mb-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">{t("includes")}</h3>
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
                  {isKuliner ? t("website") : t("consult")}
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
