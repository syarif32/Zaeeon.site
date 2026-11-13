import {
  Document as PDFDocument,
  Page,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import {
  AlignmentType,
  Document as WordDocument,
  PageOrientation,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  LETTER_PRESETS,
  formatLetterDate,
  paragraphLines,
} from "./coverLetterModel";
import type { LetterOutput, LetterPreset } from "./coverLetterModel";

// Sumber data dan token desain yang sama dipakai preview PDF, unduhan PDF, dan DOCX.
// Word memiliki mesin layout berbeda, jadi pemenggalan baris dapat sedikit berbeda.
function labels(letter: LetterOutput) {
  const id = letter.form.language === "id";
  const recipient = letter.form.recipient.trim() || (id ? "Tim Rekrutmen" : "Hiring Manager");
  return {
    recipient,
    address: id ? `Kepada Yth. ${recipient}` : recipient,
    greeting: id ? "Dengan hormat," : `Dear ${recipient},`,
    subject: id
      ? `Perihal: Lamaran${letter.form.position.trim() ? ` ${letter.form.position.trim()}` : " kerja"}`
      : `Subject: Application${letter.form.position.trim() ? ` for ${letter.form.position.trim()}` : ""}`,
    closing: id ? "Hormat saya," : "Sincerely,",
  };
}

function contactLine(letter: LetterOutput): string {
  return [letter.form.email, letter.form.phone, letter.form.location]
    .map((text) => text.trim())
    .filter(Boolean)
    .join("  |  ");
}

function boldPdfFont(preset: LetterPreset): string {
  return preset.pdfFont === "Helvetica" ? "Helvetica-Bold" : "Times-Bold";
}

export function CoverLetterDocument({ letter }: { letter: LetterOutput }) {
  const p = LETTER_PRESETS[letter.template];
  const l = labels(letter);
  const body = paragraphLines(letter.body);
  const name = letter.form.name.trim();
  const contacts = contactLine(letter);
  const centerHeader = p.centeredName ? "center" : "left";

  return (
    <PDFDocument
      title={letter.form.position.trim() ? `Cover Letter - ${letter.form.position.trim()}` : "Cover Letter"}
      author={name || "Applicant"}
    >
      <Page
        size="A4"
        style={{
          paddingTop: p.marginPt,
          paddingBottom: p.marginPt,
          paddingHorizontal: p.marginPt,
          backgroundColor: "#ffffff",
          color: "#171717",
          fontFamily: p.pdfFont,
          fontSize: p.bodySize,
          lineHeight: p.lineHeight,
        }}
      >
        <View style={{ marginBottom: p.headerSpace }}>
          {name ? (
            <Text style={{
              fontSize: p.nameSize,
              fontFamily: boldPdfFont(p),
              color: p.accent,
              textAlign: centerHeader,
              marginBottom: 4,
            }}>{name}</Text>
          ) : null}
          {contacts ? (
            <Text style={{ fontSize: 9, color: "#525252", textAlign: centerHeader }}>{contacts}</Text>
          ) : null}
          {p.rule ? (
            <View style={{ borderBottomColor: p.accent, borderBottomWidth: 1, marginTop: 12 }} />
          ) : null}
        </View>

        <Text style={{ marginBottom: 15 }}>
          {formatLetterDate(letter.form.date, letter.form.language)}
        </Text>

        <View style={{ marginBottom: p.subject ? 15 : 20 }}>
          <Text>{l.address}</Text>
          {letter.form.company.trim() ? <Text>{letter.form.company.trim()}</Text> : null}
        </View>

        {p.subject ? (
          <Text style={{ fontFamily: boldPdfFont(p), marginBottom: 19 }}>
            {l.subject}
          </Text>
        ) : null}

        <Text style={{ marginBottom: p.paragraphSpace }}>{l.greeting}</Text>

        {body.map((paragraph, index) => (
          <Text key={index} style={{ marginBottom: p.paragraphSpace, textAlign: "left" }}>
            {paragraph}
          </Text>
        ))}

        <View wrap={false} style={{ marginTop: 8 }}>
          <Text style={{ marginBottom: 22 }}>{l.closing}</Text>
          {name ? <Text style={{ fontFamily: boldPdfFont(p) }}>{name}</Text> : null}
        </View>
      </Page>
    </PDFDocument>
  );
}

export async function exportCoverLetterPDF(letter: LetterOutput): Promise<Blob> {
  return pdf(<CoverLetterDocument letter={letter} />).toBlob();
}

function wordText(text: string, p: LetterPreset, bold = false, size = p.bodySize): TextRun {
  return new TextRun({
    text,
    bold,
    font: p.wordFont,
    size: Math.round(size * 2), // satuan DOCX: half-point
    color: bold ? p.accent.replace("#", "") : "171717",
  });
}

function para(
  text: string,
  p: LetterPreset,
  options: {
    bold?: boolean;
    size?: number;
    after?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    keepNext?: boolean;
    before?: number;
  } = {},
): Paragraph {
  return new Paragraph({
    children: [wordText(text, p, options.bold, options.size)],
    alignment: options.align ?? AlignmentType.LEFT,
    keepNext: options.keepNext ?? false,
    spacing: {
      before: Math.round((options.before ?? 0) * 20),
      after: Math.round((options.after ?? 0) * 20),
      line: Math.round(p.bodySize * p.lineHeight * 20),
    },
  });
}

export async function exportCoverLetterDOCX(letter: LetterOutput): Promise<Blob> {
  const p = LETTER_PRESETS[letter.template];
  const l = labels(letter);
  const centered = p.centeredName ? AlignmentType.CENTER : AlignmentType.LEFT;
  const paragraphs: Paragraph[] = [];

  if (letter.form.name.trim()) {
    paragraphs.push(para(letter.form.name.trim(), p, {
      size: p.nameSize, bold: true, align: centered, after: 3, keepNext: true,
    }));
  }
  const contacts = contactLine(letter);
  if (contacts) {
    paragraphs.push(para(contacts, p, { size: 9, align: centered, after: p.headerSpace, keepNext: true }));
  } else if (letter.form.name.trim()) {
    paragraphs.push(para("", p, { after: p.headerSpace }));
  }
  if (p.rule) {
    paragraphs.push(new Paragraph({
      border: { bottom: { color: p.accent.replace("#", ""), size: 8, space: 1 } },
      spacing: { after: Math.round(p.headerSpace * 10) },
    }));
  }

  paragraphs.push(para(formatLetterDate(letter.form.date, letter.form.language), p, {
    after: 13, keepNext: true,
  }));
  paragraphs.push(para(l.address, p, { after: 0, keepNext: true }));
  if (letter.form.company.trim()) {
    paragraphs.push(para(letter.form.company.trim(), p, {
      after: p.subject ? 13 : 18, keepNext: true,
    }));
  } else {
    paragraphs.push(para("", p, { after: p.subject ? 13 : 18 }));
  }
  if (p.subject) {
    paragraphs.push(para(l.subject, p, { bold: true, after: 16, keepNext: true }));
  }
  paragraphs.push(para(l.greeting, p, { after: p.paragraphSpace, keepNext: true }));

  for (const bodyParagraph of paragraphLines(letter.body)) {
    paragraphs.push(para(bodyParagraph, p, { after: p.paragraphSpace }));
  }
  paragraphs.push(para(l.closing, p, { after: 20, before: 7, keepNext: true }));
  if (letter.form.name.trim()) {
    paragraphs.push(para(letter.form.name.trim(), p, { bold: true }));
  }

  const marginTwip = Math.round(p.marginPt * 20);
  const document = new WordDocument({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: marginTwip, bottom: marginTwip, left: marginTwip, right: marginTwip },
        },
      },
      children: paragraphs,
    }],
  });
  return Packer.toBlob(document);
}
