import { getTranslations } from "next-intl/server";
import Container from "@/common/components/elements/Container";
import PageHeading from "@/common/components/elements/PageHeading";
import Dashboard from "@/modules/dashboard/components/Dashboardold";
import { pageMetadata } from "@/common/constants/metadata";

type Props = { params: { locale: string } };

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "dashboard");
}

const DashboardPage = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "DashboardPage" });
  return (
    <Container data-aos="fade-up">
      <PageHeading title={t("title")} description={t("description")} />
      <Dashboard />
    </Container>
  );
};

export default DashboardPage;
