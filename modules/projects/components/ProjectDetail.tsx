
import { useLocale, useTranslations } from "next-intl";

import Tooltip from "@/common/components/elements/Tooltip";
import Image from "@/common/components/elements/Image";
import MDXComponent from "@/common/components/elements/MDXComponent";
import { ProjectItem } from "@/common/types/projects";
import { STACKS } from "@/common/constants/stacks";
import { getProjectTranslation } from "@/common/utils/projectLocale";

import ProjectLink from "./ProjectLink";
import ProjectReactions from "./ProjectReactions";

type BilingualProject = ProjectItem & {
  slug?: string | null;
  title_en?: string | null;
  description_en?: string | null;
  content_en?: string | null;
};

const ProjectDetail = ({
  slug,
  title,
  title_en,
  description,
  description_en,
  image,
  stacks,
  link_demo,
  link_github,
  content,
  content_en,
}: BilingualProject) => {
  const t = useTranslations("ProjectsPage");
  const locale = useLocale();

  const { title: displayTitle } = getProjectTranslation(
    { title, title_en, description, description_en },
    locale,
  );

  // gunakan konten bahasa inggris jika tersedia
  const displayContent =
    locale === "en" && content_en?.trim()
      ? content_en
      : content;

  return (
    <div className="space-y-8">
      {/* teknologi dan tautan proyek */}
      <div className="flex flex-col items-center justify-between gap-5 sm:flex-row lg:flex-row lg:items-start">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mb-1 text-sm text-neutral-700 dark:text-neutral-300">
            {t("tech_stack")} :{" "}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {stacks.map((stack: string, index: number) => {
              const stackData = STACKS[stack];

              if (!stackData) return null;

              return (
                <Tooltip title={stack} key={index}>
                  <div className={`${stackData.color}`}>
                    {stackData.icon}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <ProjectLink
          title={displayTitle}
          link_demo={link_demo || ""}
          link_github={link_github || ""}
        />
      </div>

      {/* gambar utama proyek */}
      <div className="overflow-hidden">
        <Image
          src={image}
          alt={displayTitle}
          width={1000}
          height={400}
          className="transition duration-500 hover:scale-[1.04]"
        />
      </div>

      {/* deskripsi lengkap proyek */}
      {displayContent ? (
        <div className="mt-5 space-y-6 leading-[1.8] dark:text-neutral-300">
          <MDXComponent>{displayContent}</MDXComponent>
        </div>
      ) : null}

      {/* reaksi pengunjung */}
      {slug && (
        <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <ProjectReactions slug={slug} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
