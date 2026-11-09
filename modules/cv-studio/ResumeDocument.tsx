
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import type {
  CVFont,
  ResumeData,
  SectionKey,
} from "./model";

import {
  hasSectionContent,
  SECTION_TITLES,
  splitLines,
} from "./model";

// font bawaan react-pdf, tanpa instalasi tambahan
type PDFFontFamily = {
  regular: string;
  bold: string;
  italic: string;
};

const FONT_FAMILIES: Record<
  Exclude<CVFont, "default">,
  PDFFontFamily
> = {
  helvetica: {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique",
  },
  times: {
    regular: "Times-Roman",
    bold: "Times-Bold",
    italic: "Times-Italic",
  },
  courier: {
    regular: "Courier",
    bold: "Courier-Bold",
    italic: "Courier-Oblique",
  },
};

// pilih font bawaan sesuai template jika masih default
function getPdfFonts(cv: ResumeData): PDFFontFamily {
  const selected = cv.font ?? "default";

  const resolved: Exclude<CVFont, "default"> =
    selected === "default"
      ? cv.template === "professional"
        ? "helvetica"
        : "times"
      : selected;

  return FONT_FAMILIES[resolved];
}

const s = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 44,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10.4,
    lineHeight: 1.27,
    color: "#141414",
    backgroundColor: "#FFFFFF",
  },

  pageCompact: {
    paddingTop: 33,
    paddingBottom: 34,
    paddingHorizontal: 38,
    fontSize: 9.6,
  },

  pageClassic: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 40,
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.18,
  },

  pageAcademic: {
    fontFamily: "Times-Roman",
    fontSize: 10.3,
    lineHeight: 1.25,
  },

  professionalHeader: {
    alignItems: "center",
    marginBottom: 13,
  },

  professionalName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 7,
  },

  professionalContact: {
    fontSize: 9.5,
    textAlign: "center",
    lineHeight: 1.38,
  },

  classicHeader: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.2,
    borderBottomColor: "#263B50",
  },

  classicName: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    lineHeight: 1.25,
    marginBottom: 6,
    color: "#263B50",
  },

  classicSubtitle: {
    fontFamily: "Times-Italic",
    fontSize: 10.5,
    lineHeight: 1.3,
    marginBottom: 5,
    color: "#525E6A",
  },

  classicContact: {
    fontSize: 8.6,
    lineHeight: 1.3,
    color: "#4C5662",
  },

  academicHeader: {
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 11,
    borderBottomWidth: 0.9,
    borderBottomColor: "#444444",
  },

  academicTopline: {
    fontFamily: "Times-Roman",
    fontSize: 9,
    letterSpacing: 1.6,
    marginBottom: 7,
  },

  academicName: {
    fontFamily: "Times-Bold",
    fontSize: 19,
    textAlign: "center",
  },

  academicContact: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    marginTop: 6,
    textAlign: "center",
  },

  section: {
    marginTop: 10,
  },

  sectionCompact: {
    marginTop: 6,
  },

  sectionClassic: {
    marginTop: 7,
  },

  headingProfessional: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11.4,
    paddingBottom: 2,
    marginBottom: 6,
    borderBottomWidth: 0.85,
    borderBottomColor: "#171717",
  },

  headingClassic: {
    fontFamily: "Times-Bold",
    color: "#263B50",
    fontSize: 10.8,
    lineHeight: 1.2,
    paddingBottom: 2,
    marginBottom: 4,
    borderBottomWidth: 0.6,
    borderBottomColor: "#B2BAC4",
  },

  headingAcademic: {
    fontFamily: "Times-Bold",
    fontSize: 11.4,
    paddingBottom: 3,
    marginBottom: 6,
    borderBottomWidth: 0.65,
    borderBottomColor: "#575757",
  },

  body: {
    marginBottom: 3,
    textAlign: "left",
  },

  entry: {
    marginBottom: 7,
  },

  entryCompact: {
    marginBottom: 4,
  },

  entryClassic: {
    marginBottom: 4,
  },

  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.4,
  },

  entryTitleSerif: {
    fontFamily: "Times-Bold",
    fontSize: 10.3,
  },

  detail: {
    fontSize: 9.6,
    marginTop: 2,
    color: "#414141",
  },

  bullet: {
    marginLeft: 15,
    marginBottom: 2,
  },

  skillsRow: {
    marginBottom: 3,
  },
});

function Header({ cv }: { cv: ResumeData }) {
  const fonts = getPdfFonts(cv);

  const parts = [
    cv.profile.phone,
    cv.profile.email,
    cv.profile.location,
    cv.profile.linkedin,
    cv.profile.website,
  ]
    .map((x) => x.trim())
    .filter(Boolean);

  const contact = parts.join("  |  ");

  const name =
    cv.profile.name.trim() ||
    (cv.language === "id"
      ? "NAMA LENGKAP"
      : "YOUR NAME");

  if (cv.template === "classic") {
    return (
      <View style={s.classicHeader} wrap={false}>
        <Text
          style={[
            s.classicName,
            { fontFamily: fonts.bold },
          ]}
        >
          {name}
        </Text>

        {cv.profile.headline.trim() ? (
          <Text
            style={[
              s.classicSubtitle,
              { fontFamily: fonts.italic },
            ]}
          >
            {cv.profile.headline.trim()}
          </Text>
        ) : null}

        {contact ? (
          <Text style={s.classicContact}>
            {contact}
          </Text>
        ) : null}
      </View>
    );
  }

  if (cv.template === "academic") {
    return (
      <View style={s.academicHeader} wrap={false}>
        <Text
          style={[
            s.academicTopline,
            { fontFamily: fonts.regular },
          ]}
        >
          {cv.language === "id"
            ? "DAFTAR RIWAYAT HIDUP AKADEMIK"
            : "ACADEMIC CURRICULUM VITAE"}
        </Text>

        <Text
          style={[
            s.academicName,
            { fontFamily: fonts.bold },
          ]}
        >
          {name.toUpperCase()}
        </Text>

        {cv.profile.headline.trim() ? (
          <Text
            style={[
              s.academicContact,
              { fontFamily: fonts.regular },
            ]}
          >
            {cv.profile.headline.trim()}
          </Text>
        ) : null}

        {contact ? (
          <Text
            style={[
              s.academicContact,
              { fontFamily: fonts.regular },
            ]}
          >
            {contact}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={s.professionalHeader}
      wrap={false}
    >
      <Text
        style={[
          s.professionalName,
          { fontFamily: fonts.bold },
        ]}
      >
        {name.toUpperCase()}
      </Text>

      {contact ? (
        <Text style={s.professionalContact}>
          {contact}
        </Text>
      ) : null}
    </View>
  );
}

function SectionHeading({
  cv,
  section,
}: {
  cv: ResumeData;
  section: SectionKey;
}) {
  const fonts = getPdfFonts(cv);

  const style =
    cv.template === "academic"
      ? s.headingAcademic
      : cv.template === "classic"
      ? s.headingClassic
      : s.headingProfessional;

  return (
    <View style={style} minPresenceAhead={24}>
      <Text style={{ fontFamily: fonts.bold }}>
        {SECTION_TITLES[cv.language][section].toUpperCase()}
      </Text>
    </View>
  );
}

function BulletLines({ value }: { value: string }) {
  return (
    <>
      {splitLines(value).map((line, index) => (
        <Text
          style={s.bullet}
          key={`${index}-${line.slice(0, 12)}`}
        >
          {"•  "}
          {line}
        </Text>
      ))}
    </>
  );
}

function SectionContent({
  cv,
  section,
}: {
  cv: ResumeData;
  section: SectionKey;
}) {
  const fonts = getPdfFonts(cv);

  const titleStyle =
    cv.template === "professional"
      ? s.entryTitle
      : s.entryTitleSerif;

  const entryStyle =
    cv.density === "compact"
      ? s.entryCompact
      : cv.template === "classic"
      ? s.entryClassic
      : s.entry;

  const boldTitleStyle = [
    titleStyle,
    { fontFamily: fonts.bold },
  ];

  switch (section) {
    case "summary":
      return (
        <Text style={s.body}>
          {cv.summary.trim()}
        </Text>
      );

    case "skills":
      return (
        <>
          {cv.skills
            .filter(
              (x) =>
                x.category.trim() ||
                x.values.trim()
            )
            .map((group) => (
              <Text
                key={group.id}
                style={s.skillsRow}
              >
                {group.category.trim() ? (
                  <Text style={boldTitleStyle}>
                    {group.category.trim()}:
                    {" "}
                  </Text>
                ) : null}

                {group.values.trim()}
              </Text>
            ))}
        </>
      );

    case "experience":
      return (
        <>
          {cv.experience
            .filter(
              (x) =>
                x.role.trim() ||
                x.organization.trim() ||
                x.details.trim()
            )
            .map((item) => (
              <View
                key={item.id}
                style={entryStyle}
              >
                <Text>
                  <Text style={boldTitleStyle}>
                    {[
                      item.organization.trim(),
                      item.role.trim(),
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                  </Text>

                  {item.period.trim()
                    ? ` | ${item.period.trim()}`
                    : ""}
                </Text>

                <BulletLines value={item.details} />
              </View>
            ))}
        </>
      );

    case "education":
      return (
        <>
          {cv.education
            .filter(
              (x) =>
                x.institution.trim() ||
                x.degree.trim()
            )
            .map((item) => (
              <View
                key={item.id}
                style={entryStyle}
              >
                <Text>
                  <Text style={boldTitleStyle}>
                    {item.institution.trim()}
                  </Text>

                  {item.degree.trim()
                    ? ` | ${item.degree.trim()}`
                    : ""}

                  {item.period.trim()
                    ? ` | ${item.period.trim()}`
                    : ""}
                </Text>

                {item.details.trim() ? (
                  <Text style={s.detail}>
                    {item.details.trim()}
                  </Text>
                ) : null}
              </View>
            ))}
        </>
      );

    case "projects":
      return (
        <>
          {cv.projects
            .filter(
              (x) =>
                x.name.trim() ||
                x.details.trim()
            )
            .map((item) => (
              <View
                key={item.id}
                style={entryStyle}
              >
                <Text>
                  <Text style={boldTitleStyle}>
                    {item.name.trim()}
                  </Text>

                  {item.period.trim()
                    ? ` | ${item.period.trim()}`
                    : ""}
                </Text>

                {item.details.trim() ? (
                  <Text style={s.detail}>
                    {item.details.trim()}
                  </Text>
                ) : null}
              </View>
            ))}
        </>
      );

    default:
      return (
        <BulletLines value={cv[section]} />
      );
  }
}

export default function ResumeDocument({
  resume: cv,
}: {
  resume: ResumeData;
}) {
  const compact = cv.density === "compact";

  const fonts = getPdfFonts(cv);

  // cegah section duplikat tanpa mengubah urutan asli
  const visible = Array.from(new Set(cv.order)).filter(
    (section) =>
      !cv.hidden.includes(section) &&
      hasSectionContent(cv, section)
  );

  return (
    <Document
      title={`${cv.profile.name.trim() || "My"} - CV`}
      author={
        cv.profile.name.trim() ||
        "Zaeeon CV Studio"
      }
      subject="Resume generated with Zaeeon CV Studio"
    >
      <Page
        size="A4"
        style={[
          s.page,
          ...(cv.template === "classic"
            ? [s.pageClassic]
            : []),
          ...(cv.template === "academic"
            ? [s.pageAcademic]
            : []),
          ...(compact ? [s.pageCompact] : []),

          // font pilihan terakhir menimpa font bawaan template
          { fontFamily: fonts.regular },
        ]}
        wrap
      >
        <Header cv={cv} />

        {visible.map((section) => (
          <View
            key={section}
            style={
              compact
                ? s.sectionCompact
                : cv.template === "classic"
                ? s.sectionClassic
                : s.section
            }
          >
            <SectionHeading
              cv={cv}
              section={section}
            />

            <SectionContent
              cv={cv}
              section={section}
            />
          </View>
        ))}
      </Page>
    </Document>
  );
}
