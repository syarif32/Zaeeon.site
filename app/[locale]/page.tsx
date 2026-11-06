import { ProfileJsonLd } from "@/common/components/elements/SeoJsonLd";

import Container from "@/common/components/elements/Container";
import Home from "@/modules/home";
import { pageMetadata } from "@/common/constants/metadata";

interface HomePageProps {
  params: { locale: string };
}

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return pageMetadata(locale, "");
}

const HomePage = async ({ params: { locale } }: HomePageProps) => {
  return (
    <Container data-aos="fade-up">
      <ProfileJsonLd locale={locale} path="" />
      <Home />
    </Container>
  );
};

export default HomePage;
