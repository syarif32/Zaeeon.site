"use client";

import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import {
  BsListCheck as ResponsibilityIcon,
  BsBuildings as CompanyIcon,
  BsLightbulb as LearnIcon,
} from "react-icons/bs";
import { HiChevronRight as ChevronIcon } from "react-icons/hi";
import { HiOutlineRocketLaunch as ImpactIcon } from "react-icons/hi2";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "next-intl";
// @ts-ignore
import { differenceInMonths, differenceInYears } from "date-fns";

import SpotlightCard from "@/common/components/elements/SpotlightCard";
import { CareerProps } from "@/common/types/careers";

const CareerCard = ({
  position,
  position_en,
  company,
  logo,
  location,
  start_date,
  end_date,
  link,
  type,
  location_type,
  responsibilities,
  responsibilities_en,
  lessons_learned,
  lessons_learned_en,
  impact,
  impact_en,
}: CareerProps & {
  position_en?: string | null;
  responsibilities_en?: string[] | null;
  lessons_learned_en?: string[] | null;
  impact_en?: string[] | null;
}) => {
  const [isShowDetails, setIsShowDetails] = useState(false);

  const locale = useLocale();
  const isId = locale === "id";
  const displayPosition = !isId && position_en?.trim() ? position_en : position;
  const validList = (items?: string[] | null) => Array.isArray(items) && items.some((item) => typeof item === "string" && item.trim());
  const displayResponsibilities = !isId && validList(responsibilities_en) ? responsibilities_en : responsibilities;
  const displayLessons = !isId && validList(lessons_learned_en) ? lessons_learned_en : lessons_learned;
  const displayImpact = !isId && validList(impact_en) ? impact_en : impact;
  const formatMonth = (date: Date) => new Intl.DateTimeFormat(isId ? "id-ID" : "en-US", { month: "short", year: "numeric" }).format(date);
  const displayType = isId ? ({ Internship: "Magang", "Full-time": "Penuh waktu", Freelance: "Freelance" } as Record<string, string>)[type] || type : type;
  const displayLocationType = isId ? ({ Remote: "Jarak jauh", Onsite: "Di lokasi", Hybrid: "Hybrid" } as Record<string, string>)[location_type] || location_type : location_type;

  const startDate = new Date(start_date);
  const endDate = end_date ? new Date(end_date) : new Date();

  const durationYears = differenceInYears(endDate, startDate);
  const durationMonths = differenceInMonths(endDate, startDate) % 12;

  const yearText =
    locale === "en" ? `year${durationYears > 1 ? "s" : ""}` : "tahun";
  const monthText =
    locale === "en" ? `month${durationMonths !== 1 ? "s" : ""}` : "bulan";

  let durationText = "";
  if (durationYears > 0) {
    durationText += `${durationYears} ${yearText} `;
  }
  if (durationMonths > 0 || durationYears === 0) {
    durationText += `${durationMonths} ${monthText}`;
  }

  const hideText = locale === "en" ? "Hide" : "Sembunyikan";
  const showText = locale === "en" ? "Show" : "Tampilkan";
  const detailsText = locale === "en" ? "details" : "detail";

  const learnedLabel =
    locale === "en" ? "What I Learned" : "Apa yang saya pelajari";
  const impactLabel = locale === "en" ? "Impact" : "Dampak";
  const responsibilityLabel = locale === "en" ? "Responsibilities" : "Tugas";

  return (
    <SpotlightCard className="flex items-start gap-5 p-6">
      {logo ? (
        <Image
          width={60}
          height={60}
          src={logo}
          alt={company}
          className="shrink-0 rounded-lg border-[1.5px] border-neutral-300 bg-neutral-100 dark:border-neutral-700"
        />
      ) : (
        <CompanyIcon size={60} className="shrink-0 text-neutral-500" />
      )}

      <div className="w-full space-y-1">
        <h5>{displayPosition}</h5>
        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex flex-col gap-2 md:flex-row">
            <Link href={link || "#"} target="_blank">
              <span className="cursor-pointer hover:text-neutral-900 hover:underline hover:dark:text-neutral-50">
                {company}
              </span>
            </Link>
            <span className="hidden text-neutral-300 dark:text-neutral-700 md:block">
              •
            </span>
            <span>{location}</span>
          </div>

          <div className="flex flex-col gap-2 text-[13px] md:flex-row">
            <div className="flex gap-1 text-neutral-600 dark:text-neutral-400">
              <span>{formatMonth(startDate)}</span> -{" "}
              <span>{end_date ? formatMonth(endDate) : (isId ? "Sekarang" : "Present")}</span>
            </div>

            <span className="hidden text-neutral-300 dark:text-neutral-700 md:block">
              •
            </span>
            <span className="text-neutral-500">{durationText}</span>

            <span className="hidden text-neutral-300 dark:text-neutral-700 md:block">
              •
            </span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {displayType}
            </span>

            <span className="hidden text-neutral-300 dark:text-neutral-700 md:block">
              •
            </span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {displayLocationType}
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsShowDetails(!isShowDetails)}
              className="-ml-1 flex items-center justify-center gap-x-1 transition duration-300 hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <motion.span
                animate={{ rotate: isShowDetails ? 90 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="inline-block"
              >
                <ChevronIcon size={18} />
              </motion.span>
              <p className="text-sm font-medium">
                {isShowDetails ? hideText : showText} {detailsText}
              </p>
            </button>

            <AnimatePresence>
              {isShowDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 py-3 leading-normal text-neutral-600 dark:text-neutral-400">
                    {/* Responsibilities Section */}
                    {displayResponsibilities && displayResponsibilities.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                          <ResponsibilityIcon size={16} />
                          <span className="text-xs uppercase tracking-wider">
                            {responsibilityLabel}
                          </span>
                        </div>
                        <ul className="space-y-1 text-xs leading-relaxed opacity-90">
                          {displayResponsibilities.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                ✓
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lessons Learned & Impact Grid */}
                    <div className="grid grid-cols-1 gap-4 dark:border-neutral-800 sm:grid-cols-2 md:mt-4 md:border-t md:border-neutral-200 md:pt-4">
                      {/* What I Learned */}
                      {displayLessons && displayLessons.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-semibold text-primary">
                            <LearnIcon size={16} />
                            <span className="text-xs uppercase tracking-wider">
                              {learnedLabel}
                            </span>
                          </div>
                          <ul className="space-y-1 text-xs leading-relaxed opacity-90">
                            {displayLessons.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                  ✓
                                </span>{" "}
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Impact */}
                      {displayImpact && displayImpact.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-semibold text-primary dark:text-primary">
                            <ImpactIcon size={16} />
                            <span className="text-xs uppercase tracking-wider ">
                              {impactLabel}
                            </span>
                          </div>
                          <ul className="space-y-1 text-xs leading-relaxed opacity-90">
                            {displayImpact.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                  ✓
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default CareerCard;
