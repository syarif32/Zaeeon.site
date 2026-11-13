
import {
  AlignmentType,
  BorderStyle,
  Document,
  LineRuleType,
  Packer,
  Paragraph,
  TextRun,
  PageOrientation,
  convertMillimetersToTwip,
} from "docx";

import type {
  ResumeData,
  SectionKey,
} from "./model";

import {
  hasSectionContent,
  SECTION_TITLES,
  splitLines,
} from "./model";

import {
  getResumeFonts,
  getResumeLayout,
} from "./layoutConfig";

// Membuat dokumen Word yang dapat diedit.
export async function generateResumeDocx(
  cv: ResumeData
): Promise<Blob> {
  const layout = getResumeLayout(cv);
  const fonts = getResumeFonts(cv);

  const titleColor =
    cv.template === "classic" ? "263B50" : "161616";

  const ruleColor =
    cv.template === "classic" ? "9CA9B6" : "606060";

  const docFont = fonts.word;

  const toTwips = (pt: number) =>
    Math.round(pt * 20);

  const toHalfPt = (pt: number) =>
    Math.round(pt * 2);

  const regularSize = toHalfPt(layout.bodyPt);

  const line = toTwips(
    layout.bodyPt * layout.lineHeight
  );

  // Membuat potongan teks dengan format.
  const run = (
    text: string,
    bold = false,
    options: {
      italic?: boolean;
      color?: string;
      sizePt?: number;
    } = {}
  ) =>
    new TextRun({
      text,
      bold,
      italics: options.italic ?? false,
      color: options.color ?? "171717",
      font: docFont,
      size: toHalfPt(
        options.sizePt ?? layout.bodyPt
      ),
    });

  // Format paragraf yang konsisten.
  function paragraph(
    parts: TextRun[],
    options: {
      beforePt?: number;
      afterPt?: number;
      keepNext?: boolean;
      align?: typeof AlignmentType[
        keyof typeof AlignmentType
      ];
      borderBottom?: boolean;
    } = {}
  ) {
    return new Paragraph({
      children: parts,

      alignment:
        options.align ?? AlignmentType.LEFT,

      keepNext:
        options.keepNext ?? false,

      widowControl: true,

      spacing: {
        before: toTwips(
          options.beforePt ?? 0
        ),

        after: toTwips(
          options.afterPt ?? 0
        ),

        line,

        lineRule: LineRuleType.AT_LEAST,
      },

      ...(options.borderBottom
        ? {
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                color: ruleColor,
                size: 5,
                space: 2,
              },
            },
          }
        : {}),
    });
  }

  // Membuat bullet Word asli.
  function bullet(
    text: string,
    last: boolean
  ) {
    return new Paragraph({
      children: [run(text)],

      bullet: {
        level: 0,
      },

      widowControl: true,

      spacing: {
        before: 0,

        after: last
          ? 0
          : toTwips(layout.bulletGapPt),

        line,

        lineRule: LineRuleType.AT_LEAST,
      },
    });
  }

  const children: Paragraph[] = [];

  const name =
    cv.profile.name.trim() ||
    (cv.language === "id"
      ? "NAMA LENGKAP"
      : "YOUR NAME");

  const alignHeader =
    cv.template === "classic"
      ? AlignmentType.LEFT
      : AlignmentType.CENTER;

  // Header tambahan untuk Academic.
  if (cv.template === "academic") {
    children.push(
      paragraph(
        [
          run(
            cv.language === "id"
              ? "DAFTAR RIWAYAT HIDUP AKADEMIK"
              : "ACADEMIC CURRICULUM VITAE",
            false,
            { sizePt: 9 }
          ),
        ],
        {
          afterPt: 4,
          align: alignHeader,
          keepNext: true,
        }
      )
    );
  }

  // Nama utama.
  children.push(
    paragraph(
      [
        run(name.toUpperCase(), true, {
          color: titleColor,
          sizePt: layout.namePt,
        }),
      ],
      {
        afterPt: layout.nameGapPt,
        align: alignHeader,
        keepNext: true,
      }
    )
  );

  // Headline profesional.
  if (cv.profile.headline.trim()) {
    children.push(
      paragraph(
        [
          run(
            cv.profile.headline.trim(),
            false,
            { italic: true }
          ),
        ],
        {
          afterPt: 2,
          align: alignHeader,
          keepNext: true,
        }
      )
    );
  }

  // Informasi kontak.
  const contact = [
    cv.profile.phone,
    cv.profile.email,
    cv.profile.location,
    cv.profile.linkedin,
    cv.profile.website,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("  |  ");

  if (contact) {
    children.push(
      paragraph(
        [
          run(contact, false, {
            sizePt: layout.contactPt,
          }),
        ],
        {
          afterPt: layout.headerGapPt,
          align: alignHeader,
        }
      )
    );
  } else {
    // Menambahkan jarak jika kontak belum diisi.
    children.push(
      paragraph([], {
        afterPt: layout.headerGapPt,
      })
    );
  }

  // Mengikuti section yang dipilih pengguna.
const visible = Array.from(new Set(cv.order)).filter(
  (section) =>
    !cv.hidden.includes(section) &&
    hasSectionContent(cv, section)
);


  visible.forEach((section, sectionIndex) => {
    // Heading dijaga bersama paragraf sesudahnya.
    children.push(
      paragraph(
        [
          run(
            SECTION_TITLES[
              cv.language
            ][section].toUpperCase(),
            true,
            {
              color: titleColor,
              sizePt: layout.headingPt,
            }
          ),
        ],
        {
          beforePt:
            sectionIndex === 0
              ? 0
              : layout.sectionGapPt,

          afterPt: layout.headingGapPt,

          keepNext: true,
          borderBottom: true,
        }
      )
    );

    switch (section) {
      case "summary": {
        children.push(
          paragraph([
            run(cv.summary.trim()),
          ])
        );

        break;
      }

      case "skills": {
        const items = cv.skills.filter(
          (item) =>
            item.category.trim() ||
            item.values.trim()
        );

        items.forEach((item, index) => {
          children.push(
            paragraph(
              [
                ...(item.category.trim()
                  ? [
                      run(
                        `${item.category.trim()}: `,
                        true
                      ),
                    ]
                  : []),

                run(item.values.trim()),
              ],
              {
                afterPt:
                  index < items.length - 1
                    ? layout.bulletGapPt
                    : 0,
              }
            )
          );
        });

        break;
      }

      case "experience": {
        const items = cv.experience.filter(
          (item) =>
            item.role.trim() ||
            item.organization.trim() ||
            item.details.trim()
        );

        items.forEach((item, index) => {
          const header = [
            item.organization.trim(),
            item.role.trim(),
          ]
            .filter(Boolean)
            .join(" | ");

          const details = splitLines(
            item.details
          );

          children.push(
            paragraph(
              [
                run(header, true),

                ...(item.period.trim()
                  ? [
                      run(
                        ` | ${item.period.trim()}`
                      ),
                    ]
                  : []),
              ],
              {
                beforePt:
                  index > 0
                    ? layout.entryGapPt
                    : 0,

                keepNext:
                  details.length > 0,
              }
            )
          );

          details.forEach(
            (text, position) => {
              children.push(
                bullet(
                  text,
                  position === details.length - 1
                )
              );
            }
          );
        });

        break;
      }

      case "education": {
        const items = cv.education.filter(
          (item) =>
            item.institution.trim() ||
            item.degree.trim()
        );

        items.forEach((item, index) => {
          const details =
            item.details.trim();

          children.push(
            paragraph(
              [
                run(
                  item.institution.trim(),
                  true
                ),

                ...(item.degree.trim()
                  ? [
                      run(
                        ` | ${item.degree.trim()}`
                      ),
                    ]
                  : []),

                ...(item.period.trim()
                  ? [
                      run(
                        ` | ${item.period.trim()}`
                      ),
                    ]
                  : []),
              ],
              {
                beforePt:
                  index > 0
                    ? layout.entryGapPt
                    : 0,

                keepNext:
                  Boolean(details),
              }
            )
          );

          if (details) {
            children.push(
              paragraph(
                [
                  run(
                    details,
                    false,
                    { color: "414141" }
                  ),
                ],
                {
                  beforePt:
                    layout.detailGapPt,
                }
              )
            );
          }
        });

        break;
      }

      case "projects": {
        const items = cv.projects.filter(
          (item) =>
            item.name.trim() ||
            item.details.trim()
        );

        items.forEach((item, index) => {
          const details =
            item.details.trim();

          children.push(
            paragraph(
              [
                run(
                  item.name.trim(),
                  true
                ),

                ...(item.period.trim()
                  ? [
                      run(
                        ` | ${item.period.trim()}`
                      ),
                    ]
                  : []),
              ],
              {
                beforePt:
                  index > 0
                    ? layout.entryGapPt
                    : 0,

                keepNext:
                  Boolean(details),
              }
            )
          );

          if (details) {
            children.push(
              paragraph(
                [
                  run(
                    details,
                    false,
                    { color: "414141" }
                  ),
                ],
                {
                  beforePt:
                    layout.detailGapPt,
                }
              )
            );
          }
        });

        break;
      }

      default: {
        const texts = splitLines(
          cv[
            section as Exclude<
              SectionKey,
              | "summary"
              | "skills"
              | "experience"
              | "education"
              | "projects"
            >
          ]
        );

        texts.forEach((text, index) => {
          children.push(
            bullet(
              text,
              index === texts.length - 1
            )
          );
        });
      }
    }
  });

  const marginTwips =
    convertMillimetersToTwip(
      layout.marginMm
    );

  const document = new Document({
    creator: "Zaeeon CV Studio",
    title: `${name} - CV`,
    subject: "Editable resume",

    styles: {
      default: {
        document: {
          run: {
            font: docFont,
            size: regularSize,
          },
        },
      },
    },

    sections: [
      {
        properties: {
          page: {
            size: {
              width:
                convertMillimetersToTwip(210),
                
              height:
                convertMillimetersToTwip(297),
            },

            margin: {
              top: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
              right: marginTwips,
            },
          },
        },

        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
