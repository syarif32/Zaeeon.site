import { getTranslations } from "next-intl/server";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import AIAssistant from "@/modules/assistant/components/AIAssistant";
import { pageMetadata } from "@/common/constants/metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "assistant");
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