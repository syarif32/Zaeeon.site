
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import Container from "@/common/components/elements/Container";


const NotFound = () => {
  const t = useTranslations("NotFoundPage");
  const locale = useLocale();
  const isId = locale === "id";

  const quickLinks = [
    {
      label: isId ? "Beranda" : "Home",
      href: `/${locale}`,
      number: "01",
    },
    {
      label: isId ? "Proyek" : "Projects",
      href: `/${locale}/projects`,
      number: "02",
    },
    {
      label: isId ? "Tentang Saya" : "About Me",
      href: `/${locale}/about`,
      number: "03",
    },
    {
      label: isId ? "Kontak" : "Contact",
      href: `/${locale}/contact`,
      number: "04",
    },
  ];

  return (
  
      <Container
        data-aos="fade-up"
        className="flex min-h-[75vh] w-full flex-col justify-center py-12 transition-all duration-300 sm:py-20"
      >
        <div className="w-full">
          {/* status */}
          <div className="mb-6 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>

            <span className="font-mono text-xs font-medium tracking-wider text-neutral-500 dark:text-neutral-400">
              ERROR / 404
            </span>
          </div>

          {/* main heading */}
          <div className="relative mb-6">
            <h1 className="select-none text-[100px] font-bold leading-none tracking-[-0.09em] text-neutral-200 dark:text-neutral-800 sm:text-[150px]">
              404<span className="text-blue-500">.</span>
            </h1>
          </div>

          {/* explanation */}
          <div className="max-w-lg">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              {isId
                ? "Sepertinya kamu tersesat."
                : "Looks like you're lost."}
            </h2>

            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-400">
              {t("title")}{" "}
              {isId
                ? "Mungkin halaman ini sudah dipindahkan, dihapus, atau alamat yang kamu masukkan kurang tepat."
                : "This page may have been moved, removed, or the URL might be incorrect."}
            </p>
          </div>

          {/* actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}`}
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>

              {t("button")}
            </Link>

            <Link
              href={`/${locale}/projects`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {isId ? "Jelajahi Proyek" : "Explore Projects"}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </Link>
          </div>

          {/* quick navigation */}
          <div className="mt-12 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {isId
                  ? "Mungkin kamu mencari"
                  : "You might be looking for"}
              </h3>

              <span className="hidden font-mono text-[10px] text-neutral-400 dark:text-neutral-600 sm:block">
                QUICK NAVIGATION
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-[74px] flex-col justify-between rounded-lg border border-neutral-200 bg-white p-3 transition-all duration-200 hover:border-blue-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-blue-800 dark:hover:bg-neutral-800/50"
                >
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                    {item.number}
                  </span>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-neutral-700 transition-colors group-hover:text-blue-600 dark:text-neutral-300 dark:group-hover:text-blue-400">
                      {item.label}
                    </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-neutral-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* footer */}
          <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-600">
            <span>Zaeeon.site</span>
            <span>·</span>
            <span>
              {isId ? "Halaman tidak ditemukan" : "Page not found"}
            </span>
          </div>
        </div>
      </Container>
  );
};

export default NotFound;
