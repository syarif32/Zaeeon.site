import { getTranslations } from "next-intl/server";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Tiktok from "@/modules/contents/Tiktok";
import { pageMetadata } from "@/common/constants/metadata";

type Props = {
  params: { locale: string };
};

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "contents");
}

const ContentsPage = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "ContentsPage" });

  return (
    <Container data-aos="fade-up">
      <PageHeading title={t("title")} description={t("description")} />
      <Tiktok />
    </Container>
  );
};

export default ContentsPage;
