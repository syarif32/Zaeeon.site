import { ProfileJsonLd } from "@/common/components/elements/SeoJsonLd";
import { getTranslations } from "next-intl/server";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import About from "@/modules/about";
import { pageMetadata } from "@/common/constants/metadata";
import CVPreview from "@/common/components/elements/CVPreview";
type Props = { params: { locale: string } };

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "about");
}

const AboutPage = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  return (
    <Container data-aos="fade-up">
      <ProfileJsonLd locale={locale} path="about" />
      <PageHeading title={t("title")} description={t("description")} />
      <About />
    </Container>
  );
};

export default AboutPage;
