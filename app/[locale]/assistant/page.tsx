import { Metadata } from "next";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import AIAssistant from "@/modules/assistant/components/AIAssistant";
import { METADATA } from "@/common/constants/metadata";

// Meta tags untuk SEO
export const metadata: Metadata = {
  title: `AI Assistant | ${METADATA.creator}`,
  description: "Ngobrol langsung dengan Asisten AI pribadi saya untuk mengetahui lebih lanjut tentang portofolio dan keahlian saya.",
};

const AssistantPage = () => {
  return (
    <Container data-aos="fade-up">
      <PageHeading 
        title="AI Assistant" 
        description="Tanya apa saja seputar pengalaman, proyek, dan keahlian IT saya kepada asisten virtual cerdas ini." 
      />
      <AIAssistant />
    </Container>
  );
};

export default AssistantPage;