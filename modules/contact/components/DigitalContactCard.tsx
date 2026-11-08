
"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import {
  HiOutlineArrowDownTray,
  HiOutlineGlobeAlt,
  HiOutlineEnvelope,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

// ubah informasi berikut sesuai identitas publik kamu
const CONTACT = {
  firstName: "Muhammad",
  lastName: "Syarif",
  displayName: "Muhammad Syarif",
  profession: "Software Developer",
  github: "https://github.com/syarif32",
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

  const [contactUrl, setContactUrl] = useState("");

  const email =
    process.env.NEXT_PUBLIC_AUTHOR_EMAIL?.trim() || "";

  useEffect(() => {
    setContactUrl(
      `${window.location.origin}/${locale}/contact`
    );
  }, [locale]);

  function downloadContact() {
    const website = window.location.origin;

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCard(CONTACT.lastName)};${escapeVCard(CONTACT.firstName)};;;`,
      `FN:${escapeVCard(CONTACT.displayName)}`,
      `TITLE:${escapeVCard(CONTACT.profession)}`,
      `URL:${website}`,
      ...(email
        ? [`EMAIL;TYPE=INTERNET:${email}`]
        : []),
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
    link.download = "Zaeeon-Contact.vcf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/50 sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {isId
            ? "Kartu Kontak Digital"
            : "Digital Contact Card"}
        </h2>

        <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {isId
            ? "Simpan kontak saya atau pindai kode QR untuk mengunjungi halaman kontak."
            : "Save my contact or scan the QR code to visit my contact page."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-4">
          <div>
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {CONTACT.displayName}
            </p>

            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {CONTACT.profession}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <a
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-600 hover:text-teal-600 dark:text-neutral-300 dark:hover:text-teal-400"
            >
              <HiOutlineArrowTopRightOnSquare size={17} />
              GitHub
            </a>

            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 break-all text-neutral-600 hover:text-teal-600 dark:text-neutral-300 dark:hover:text-teal-400"
              >
                <HiOutlineEnvelope size={17} />
                {email}
              </a>
            )}

            {contactUrl && (
              <a
                href={contactUrl}
                className="flex items-center gap-2 text-neutral-600 hover:text-teal-600 dark:text-neutral-300 dark:hover:text-teal-400"
              >
                <HiOutlineGlobeAlt size={17} />
                najwasyarif.my.id/{locale}/contact
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={downloadContact}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-teal-200"
          >
            <HiOutlineArrowDownTray size={18} />

            {isId ? "Simpan Kontak" : "Save Contact"}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 sm:justify-self-end">
          <div className="flex h-[164px] w-[164px] items-center justify-center rounded-xl border border-neutral-200 bg-white p-2">
            {contactUrl ? (
              <QRCodeSVG
                value={contactUrl}
                size={140}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#171717"
              />
            ) : (
              <div className="h-[140px] w-[140px] animate-pulse rounded-lg bg-neutral-100" />
            )}
          </div>

          <p className="text-xs text-neutral-400">
            {isId ? "Pindai QR" : "Scan QR"}
          </p>
        </div>
      </div>
    </section>
  );
}
