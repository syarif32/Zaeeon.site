import NextTopLoader from "nextjs-toploader";
import Script from "next/script";
import { getServerSession } from "next-auth";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "../globals.css";

import Layouts from "@/common/components/layouts";
import ThemeProviderContext from "@/common/stores/theme";
import NextAuthProvider from "@/SessionProvider";
import { METADATA, SITE_URL, PAGE_SEO } from "@/common/constants/metadata";
import { inter } from "@/common/styles/fonts";
import SkeletonThemeProvider from "@/SkeletonThemeProvider";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
 const [title, description] = PAGE_SEO[""][locale === "id" ? 0 : 1];
 return {
  metadataBase: new URL(SITE_URL),
  icons: {
    shortcut: "/icon.svg",
    apple: [{ url: METADATA.logo, sizes: "1254x1254", type: "image/png" }],
  },
  title: { default: title, template: "%s | Najwa Syarif — Zaeeon" },
  description, creator: METADATA.creator, authors: METADATA.authors,
  robots: { index: true, follow: true },
 };
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

const RootLayout = async ({
  children,
  params: { locale },
}: RootLayoutProps) => {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const session = await getServerSession();

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="1d7f97ea-29bb-4535-bf94-6e59edc872b9"
        />
      </head>
      <body className={inter.className}>
        <NextTopLoader
          color="#fbe400"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #fbe400,0 0 5px #ffffb8"
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <NextAuthProvider session={session}>
            <ThemeProviderContext>
              <SkeletonThemeProvider>
                <Layouts>{children}</Layouts>
              </SkeletonThemeProvider>
            </ThemeProviderContext>
          </NextAuthProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
