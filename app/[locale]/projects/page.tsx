import { getTranslations } from "next-intl/server";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Projects from "@/modules/projects";
import { pageMetadata } from "@/common/constants/metadata";

interface ProjectsPageProps {
  params: { locale: string };
}

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "projects");
}

const ProjectsPage = async ({ params: { locale } }: ProjectsPageProps) => {
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });

  return (
    <Container data-aos="fade-up">
      <PageHeading title={t("title")} description={t("description")} />
      <Projects />
    </Container>
  );
};

export default ProjectsPage;
