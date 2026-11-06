import { getTranslations } from "next-intl/server";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import ChatRoom from "@/modules/chat";
import { pageMetadata } from "@/common/constants/metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "chat");
}

const ChatRoomPage = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "ChatRoomPage" });
  return (
    <Container data-aos="fade-up">
      <PageHeading title={t("title")} description={t("description")} />
      <ChatRoom />
    </Container>
  );
};

export default ChatRoomPage;
