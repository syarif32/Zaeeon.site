
import type { CVTemplate } from "./model";

// "normal" dipertahankan agar draft lama tetap kompatibel.
export type LayoutDensity =
  | "compact"
  | "balanced"
  | "spacious";

export type SavedDensity = LayoutDensity | "normal";

export type LayoutInput = {
  template: CVTemplate;
  density?: string;
  font?: string;
};

export type ResumeLayout = {
  marginMm: number;
  bodyPt: number;
  namePt: number;
  headingPt: number;
  contactPt: number;
  lineHeight: number;
  headerGapPt: number;
  nameGapPt: number;
  sectionGapPt: number;
  headingGapPt: number;
  entryGapPt: number;
  bulletGapPt: number;
  detailGapPt: number;
  bulletIndentPt: number;
};

export function normalizeDensity(
  value: unknown
): LayoutDensity {
  if (value === "compact") return "compact";
  if (value === "spacious") return "spacious";

  // Termasuk "normal" dari draft versi lama.
  return "balanced";
}

export function getResumeLayout(
  input: LayoutInput
): ResumeLayout {
  const density = normalizeDensity(input.density);

  const base: Record<LayoutDensity, ResumeLayout> = {
    compact: {
      marginMm: 16,
      bodyPt: 10,
      namePt: 17.5,
      headingPt: 10.7,
      contactPt: 9,
      lineHeight: 1.18,
      headerGapPt: 11,
      nameGapPt: 3.2,
      sectionGapPt: 7.5,
      headingGapPt: 3.5,
      entryGapPt: 3.5,
      bulletGapPt: 1.5,
      detailGapPt: 1.5,
      bulletIndentPt: 12,
    },

    balanced: {
      marginMm: 18,
      bodyPt: 10.5,
      namePt: 18.5,
      headingPt: 11.1,
      contactPt: 9.2,
      lineHeight: 1.23,
      headerGapPt: 13,
      nameGapPt: 4,
      sectionGapPt: 10,
      headingGapPt: 4.5,
      entryGapPt: 5.5,
      bulletGapPt: 2,
      detailGapPt: 2,
      bulletIndentPt: 13,
    },

    spacious: {
      marginMm: 21,
      bodyPt: 11,
      namePt: 19,
      headingPt: 11.5,
      contactPt: 9.5,
      lineHeight: 1.28,
      headerGapPt: 16,
      nameGapPt: 5,
      sectionGapPt: 13,
      headingGapPt: 5.5,
      entryGapPt: 7.5,
      bulletGapPt: 3,
      detailGapPt: 2.5,
      bulletIndentPt: 14,
    },
  };

  const layout = { ...base[density] };

  // Penyesuaian tipografi untuk masing-masing template.
  if (input.template === "classic") {
    layout.namePt += 1;
    layout.headingPt += 0.2;
    layout.sectionGapPt += 0.5;
  } else if (input.template === "academic") {
    layout.marginMm += 1;
    layout.sectionGapPt += 1.5;
    layout.entryGapPt += 0.5;
  }

  return layout;
}

export function mmToPt(value: number): number {
  return (value * 72) / 25.4;
}

export function getResumeFonts(input: LayoutInput) {
  const wanted = input.font || "default";

  const kind =
    wanted === "default"
      ? input.template === "professional"
        ? "helvetica"
        : "times"
      : wanted;

  if (kind === "courier") {
    return {
      pdf: {
        regular: "Courier",
        bold: "Courier-Bold",
        italic: "Courier-Oblique",
      },
      word: "Courier New",
    };
  }

  if (kind === "times") {
    return {
      pdf: {
        regular: "Times-Roman",
        bold: "Times-Bold",
        italic: "Times-Italic",
      },
      word: "Times New Roman",
    };
  }

  return {
    pdf: {
      regular: "Helvetica",
      bold: "Helvetica-Bold",
      italic: "Helvetica-Oblique",
    },
    word: "Arial",
  };
}
