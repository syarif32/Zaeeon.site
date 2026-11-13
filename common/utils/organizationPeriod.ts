
export function localizeOrganizationPeriod(
  period: string,
  locale: string
): string {
  const isEnglish = locale === "en";

  // ubah penanda waktu yang masih berlangsung
  // sesuai bahasa halaman
  return period.replace(
    /\b(sekarang|now|present)\b/gi,
    isEnglish ? "Now" : "Sekarang"
  );
}
