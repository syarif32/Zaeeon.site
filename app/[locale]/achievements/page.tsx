import { getTranslations } from "next-intl/server";

import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Achievements from "@/modules/achievements";
import { pageMetadata } from "@/common/constants/metadata";
import { Suspense } from "react";

interface AchievementsPageProps {
  params: { locale: string };
}

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "achievements");
}

const AchievementsPage = async ({
  params: { locale },
}: AchievementsPageProps) => {
  const t = await getTranslations({ locale, namespace: "AchievementsPage" });

  return (
    <Container data-aos="fade-up">
      <PageHeading title={t("title")} description={t("description")} />
      <Suspense>
        <Achievements />
      </Suspense>
    </Container>
  );
};

export default AchievementsPage;
