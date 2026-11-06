// Satu aturan terjemahan untuk kartu dan detail proyek.
// Konten lama tetap digunakan jika terjemahan Inggris belum diisi.
export type ProjectWithTranslations = {
  title: string;
  description: string;
  title_en?: string | null;
  description_en?: string | null;
};

export function getProjectTranslation(
  project: ProjectWithTranslations,
  locale: string,
) {
  const english = locale === "en";
  return {
    title: english ? project.title_en?.trim() || project.title : project.title,
    description: english
      ? project.description_en?.trim() || project.description
      : project.description,
  };
}
