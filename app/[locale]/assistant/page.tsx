import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import AIAssistant from "@/modules/assistant/components/AIAssistant";
import { METADATA } from "@/common/constants/metadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "AssistantPage" });
  return { title: `${t("title")} | ${METADATA.creator}`, description: t("metaDescription") };
}

const AssistantPage = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "AssistantPage" });
  return (
    <Container data-aos="fade-up">
      <PageHeading 
        title={t("title")} 
        description={t("description")} 
      />
      <AIAssistant />
    </Container>
  );
};

export default AssistantPage;