
"use client";

import { useLocale } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineEnvelope,
  HiOutlineGlobeAlt,
  HiOutlineQrCode,
} from "react-icons/hi2";

const CONTACT = {
  firstName: "Muhammad",
  lastName: "Najwa Syarif",
  displayName: "Muhammad Najwa Syarif",
  profession: "Software Developer",
  email: "muh.najwa.syarif@gmail.com",
  github: "https://github.com/syarif32",
  website: "https://najwasyarif.my.id",
};

function escapeVCard(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export default function DigitalContactCard() {
  const locale = useLocale();
  const isId = locale === "id";

  const contactUrl = `${CONTACT.website.replace(/\/$/, "")}/${locale}/contact`;
  const contactLabel = contactUrl.replace(/^https?:\/\//, "");

  function downloadContact() {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCard(CONTACT.lastName)};${escapeVCard(CONTACT.firstName)};;;`,
      `FN:${escapeVCard(CONTACT.displayName)}`,
      `TITLE:${escapeVCard(CONTACT.profession)}`,
      `EMAIL;TYPE=INTERNET:${CONTACT.email}`,
      `URL:${CONTACT.website}`,
      `X-SOCIALPROFILE;TYPE=github:${CONTACT.github}`,
      "END:VCARD",
    ];

    const blob = new Blob(
      [lines.join("\r\n") + "\r\n"],
      { type: "text/vcard;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Muhammad-Najwa-Syarif.vcf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-6">
      {/* heading */}
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          <HiOutlineQrCode size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-lg">
            {isId
              ? "Kartu Kontak Digital"
              : "Digital Contact Card"}
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
            {isId
              ? "Simpan kontak atau pindai QR untuk terhubung."
              : "Save my contact or scan to connect."}
          </p>
        </div>
      </div>

      {/* informasi dan qr */}
      <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-[minmax(0,1fr)_168px] sm:items-center">
        <div className="min-w-0 space-y-5">
          {/* identitas */}
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {CONTACT.displayName}
            </h3>

            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {CONTACT.profession}
            </p>
          </div>

          {/* tautan */}
          <div className="min-w-0 space-y-3">
            <a
              href={`mailto:${CONTACT.email}`}
              className="group flex min-w-0 items-start gap-2.5 text-sm text-neutral-600 transition-colors hover:text-teal-600 dark:text-neutral-300 dark:hover:text-teal-400"
            >
              <HiOutlineEnvelope
                size={17}
                className="mt-0.5 shrink-0"
              />
              <span className="min-w-0 break-all">
                {CONTACT.email}
              </span>
            </a>

            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-w-0 items-start gap-2.5 text-sm text-neutral-600 transition-colors hover:text-teal-600 dark:text-neutral-300 dark:hover:text-teal-400"
            >
              <HiOutlineGlobeAlt
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span className="min-w-0 break-all">
                {contactLabel}
              </span>
            </a>

            <a
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-fit items-center gap-2.5 text-sm text-neutral-600 transition-colors hover:text-teal-600 dark:text-neutral-300 dark:hover:text-teal-400"
            >
              <HiOutlineArrowTopRightOnSquare size={17} />
              <span>github.com/syarif32</span>
            </a>
          </div>

          {/* tombol */}
          <button
            type="button"
            onClick={downloadContact}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-teal-200 sm:w-auto sm:py-2.5"
          >
            <HiOutlineArrowDownTray size={18} />

            {isId ? "Simpan Kontak" : "Save Contact"}
          </button>
        </div>

        {/* qr code */}
        <div className="flex min-w-0 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-5 dark:border-neutral-800 dark:bg-neutral-950/40 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:dark:bg-transparent">
          <div className="flex h-[152px] w-[152px] items-center justify-center rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/5">
            <QRCodeSVG
              value={contactUrl}
              size={132}
              level="M"
              marginSize={1}
              bgColor="#ffffff"
              fgColor="#171717"
              title="QR Contact"
            />
          </div>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
            {isId
              ? "Pindai untuk terhubung"
              : "Scan to connect"}
          </p>
        </div>
      </div>
    </section>
  );
}
