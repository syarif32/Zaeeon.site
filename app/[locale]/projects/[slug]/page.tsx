import { cache } from "react";
import { notFound } from "next/navigation";
import BackButton from "@/common/components/elements/BackButton";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import { JsonLd } from "@/common/components/elements/SeoJsonLd";
import ProjectDetail from "@/modules/projects/components/ProjectDetail";
import { pageMetadata, pageUrl } from "@/common/constants/metadata";
import { loadMdxFiles } from "@/common/libs/mdx";
import { getProjectsDataBySlug } from "@/services/projects";
import { getProjectTranslation } from "@/common/utils/projectLocale";

type Props = { params: { slug: string; locale: string } };

// Share the query between metadata and rendering for this request.
const getProject = cache(async (slug: string) => {
  const project = await getProjectsDataBySlug(slug);
  if (!project || project.is_show !== true) notFound();
  return project;
});

export async function generateMetadata({ params: { slug, locale } }: Props) {
  const project = await getProject(slug);
  return pageMetadata(locale, "projects/" + encodeURIComponent(slug), {
    ...getProjectTranslation(project, locale), image: project.image,
  });
}

export default async function ProjectDetailPage({ params: { slug, locale } }: Props) {
  const project = await getProject(slug);
  const translated = getProjectTranslation(project, locale);
  const content = loadMdxFiles().find(item => item.slug === slug)?.content;
  return (
    <Container data-aos="fade-up">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "id" ? "Beranda" : "Home", item: pageUrl(locale) },
          { "@type": "ListItem", position: 2, name: locale === "id" ? "Proyek" : "Projects", item: pageUrl(locale, "projects") },
          { "@type": "ListItem", position: 3, name: translated.title, item: pageUrl(locale, "projects/" + encodeURIComponent(slug)) },
        ],
      }} />
      <BackButton url={`/${locale}/projects`} />
      <PageHeading title={translated.title} description={translated.description} />
      <ProjectDetail {...project} content={content} />
    </Container>
  );
}
