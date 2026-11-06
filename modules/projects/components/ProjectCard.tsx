import Link from "next/link";
import { HiOutlineArrowSmRight as ViewIcon } from "react-icons/hi";
import { useLocale, useTranslations } from "next-intl";
import { TbPinnedFilled as PinIcon } from "react-icons/tb";

import Image from "@/common/components/elements/Image";
import SpotlightCard from "@/common/components/elements/SpotlightCard";
import { ProjectItem } from "@/common/types/projects";
import { STACKS } from "@/common/constants/stacks";
import { getProjectTranslation } from "@/common/utils/projectLocale";

type BilingualProject = ProjectItem & {
  title_en?: string | null;
  description_en?: string | null;
};

const ProjectCard = ({
  title,
  title_en,
  slug,
  description,
  description_en,
  image,
  stacks,
  is_featured,
}: BilingualProject) => {
  const t = useTranslations("ProjectsPage");
  const locale = useLocale();
  const { title: displayTitle, description: displayDescription } =
    getProjectTranslation({ title, title_en, description, description_en }, locale);
  const trimmedContent =
    displayDescription.length > 85
      ? `${displayDescription.slice(0, 85).trimEnd()}...`
      : displayDescription;

  return (
    <Link href={`/projects/${slug}`}>
      <SpotlightCard className="group relative cursor-pointer">
        {is_featured && (
          <div className="absolute right-0 top-0 z-10 flex items-center gap-x-1 rounded-bl-lg rounded-tr-lg bg-primary px-2 py-1 text-sm font-medium text-neutral-900">
            <PinIcon size={15} />
            <span>{locale === "en" ? "Featured" : "Unggulan"}</span>
          </div>
        )}
        <div className="relative">
          <Image
            src={image}
            alt={displayTitle}
            width={450}
            height={200}
            className="h-[200px] w-full rounded-t-xl object-cover"
          />
          <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center gap-1 rounded-t-xl bg-black text-sm font-medium text-neutral-50 opacity-0 transition-opacity duration-300 group-hover:opacity-80">
            <span>{t("view_project")}</span>
            <ViewIcon size={20} />
          </div>
        </div>
        <div className="space-y-2 p-5">
          <h3 className="cursor-pointer text-neutral-700 transition-all duration-300 group-hover:text-primary dark:text-neutral-300">
            {displayTitle}
          </h3>
          <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {trimmedContent}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {stacks.map((stack: string, index: number) => {
              const stackData = STACKS[stack];

              if (!stackData) return null;
              return (
                <div key={index} className={stackData.color}>
                  {stackData.icon}
                </div>
              );
            })}
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
};

export default ProjectCard;
