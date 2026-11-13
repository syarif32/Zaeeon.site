
import {
  Document as PDFDocument,
  Page,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

import {
  AlignmentType,
  Document as WordDocument,
  LineRuleType,
  PageOrientation,
  Packer,
  Paragraph,
  TextRun,
  convertMillimetersToTwip,
} from "docx";

export type CoverLetterOutput = {
  name: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  position: string;
  language: "id" | "en";
  body: string;
};

function contactText(data: CoverLetterOutput) {
  return [
    data.email,
    data.phone,
    data.location,
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" | ");
}

function bodyBlocks(body: string) {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function subjectText(data: CoverLetterOutput) {
  return data.language === "id"
    ? `Perihal: Lamaran ${data.position}`
    : `Re: Application for ${data.position}`;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 55,
    paddingBottom: 55,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.38,
    color: "#171717",
    backgroundColor: "#FFFFFF",
  },

  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14.5,
    marginBottom: 4,
  },

  contact: {
    fontSize: 9,
    color: "#444444",
    marginBottom: 23,
  },

  date: {
    marginBottom: 15,
  },

  subject: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 17,
  },

  paragraph: {
    marginBottom: 11,
  },
});

function LetterPDF({
  data,
}: {
  data: CoverLetterOutput;
}) {
  const blocks = bodyBlocks(data.body);

  return (
    <PDFDocument
      title={`Cover Letter - ${data.name}`}
      author={data.name}
      subject="Job application cover letter"
    >
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.name}>
          {data.name}
        </Text>

        {contactText(data) ? (
          <Text style={styles.contact}>
            {contactText(data)}
          </Text>
        ) : null}

        <Text style={styles.date}>
          {data.date}
        </Text>

        <Text style={styles.subject}>
          {subjectText(data)}
        </Text>

        {blocks.map((block, index) => (
          <Text
            key={index}
            style={styles.paragraph}
            orphans={2}
            widows={2}
          >
            {block}
          </Text>
        ))}
      </Page>
    </PDFDocument>
  );
}

export async function exportCoverLetterPDF(
  data: CoverLetterOutput
): Promise<Blob> {
  return pdf(
    <LetterPDF data={data} />
  ).toBlob();
}

export async function exportCoverLetterDOCX(
  data: CoverLetterOutput
): Promise<Blob> {
  const paragraph = (
    value: string,
    options: {
      bold?: boolean;
      size?: number;
      after?: number;
      keepNext?: boolean;
    } = {}
  ) => {
    const lines = value.split("\n");

    return new Paragraph({
      children: lines.map(
        (line, index) =>
          new TextRun({
            text: line,
            bold: options.bold ?? false,
            font: "Arial",
            size: Math.round(
              (options.size ?? 10.5) * 2
            ),
            ...(index > 0
              ? { break: 1 }
              : {}),
          })
      ),

      alignment: AlignmentType.LEFT,

      keepNext: options.keepNext ?? false,

      widowControl: true,

      spacing: {
        before: 0,
        after: Math.round(
          (options.after ?? 10) * 20
        ),
        line: 290,
        lineRule: LineRuleType.AT_LEAST,
      },
    });
  };

  const children: Paragraph[] = [
    paragraph(data.name, {
      bold: true,
      size: 14.5,
      after: 4,
      keepNext: true,
    }),

    paragraph(contactText(data), {
      size: 9,
      after: 22,
    }),

    paragraph(data.date, {
      after: 15,
    }),

    paragraph(subjectText(data), {
      bold: true,
      after: 17,
      keepNext: true,
    }),

    ...bodyBlocks(data.body).map(
      (block) =>
        paragraph(block, {
          after: 11,
        })
    ),
  ];

  const margin =
    convertMillimetersToTwip(19.5);

  const document = new WordDocument({
    title: `Cover Letter - ${data.name}`,
    creator: "Zaeeon Cover Letter Generator",
    subject: "Job application cover letter",

    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 21,
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
              orientation:
                PageOrientation.PORTRAIT,
            },

            margin: {
              top: margin,
              bottom: margin,
              left: margin,
              right: margin,
            },
          },
        },

        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
