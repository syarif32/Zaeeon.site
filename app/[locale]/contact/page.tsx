import { getTranslations } from "next-intl/server";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Contact from "@/modules/contact";
import { pageMetadata } from "@/common/constants/metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "contact");
}

const ContactPage = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return (
    <Container data-aos="fade-up">
      <PageHeading title={t("title")} description={t("description")} />
      <Contact />
    </Container>
  );
};

export default ContactPage;
