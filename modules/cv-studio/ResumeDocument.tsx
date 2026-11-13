
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { ReactNode } from "react";

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
  mmToPt,
} from "./layoutConfig";

export default function ResumeDocument({
  resume: cv,
}: {
  resume: ResumeData;
}) {
  const layout = getResumeLayout(cv);
  const fonts = getResumeFonts(cv);

  const titleColor =
    cv.template === "classic"
      ? "#263B50"
      : "#161616";

  const lineColor =
    cv.template === "classic"
      ? "#9CA9B6"
      : "#606060";

  const styles = StyleSheet.create({
    page: {
      paddingTop: mmToPt(layout.marginMm),
      paddingBottom: mmToPt(layout.marginMm),
      paddingLeft: mmToPt(layout.marginMm),
      paddingRight: mmToPt(layout.marginMm),

      fontFamily: fonts.pdf.regular,
      fontSize: layout.bodyPt,
      lineHeight: layout.lineHeight,

      color: "#171717",
      backgroundColor: "#FFFFFF",
    },

    header: {
      alignItems:
        cv.template === "classic"
          ? "flex-start"
          : "center",

      marginBottom: layout.headerGapPt,

      paddingBottom:
        cv.template === "classic" ? 6 : 0,

      borderBottomWidth:
        cv.template === "classic" ? 0.9 : 0,

      borderBottomColor: lineColor,
    },

    topline: {
      fontFamily: fonts.pdf.regular,
      fontSize: 9,
      marginBottom: 4,
      letterSpacing: 1.1,
    },

    name: {
      fontFamily: fonts.pdf.bold,
      fontSize: layout.namePt,

      textAlign:
        cv.template === "classic"
          ? "left"
          : "center",

      color: titleColor,
      marginBottom: layout.nameGapPt,
      lineHeight: 1.08,
    },

    subtitle: {
      fontFamily: fonts.pdf.italic,
      fontSize: layout.bodyPt,

      textAlign:
        cv.template === "classic"
          ? "left"
          : "center",

      color: "#444444",
      marginBottom: 2,
    },

    contact: {
      fontSize: layout.contactPt,

      textAlign:
        cv.template === "classic"
          ? "left"
          : "center",

      lineHeight: 1.22,
      color: "#303030",
    },

    sectionHeading: {
      marginBottom: layout.headingGapPt,
      borderBottomWidth: 0.65,
      borderBottomColor: lineColor,
      paddingBottom: 2,
    },

    sectionTitle: {
      fontFamily: fonts.pdf.bold,
      fontSize: layout.headingPt,
      color: titleColor,
      lineHeight: 1.1,
    },

    entryTitle: {
      fontFamily: fonts.pdf.bold,
      fontSize: layout.bodyPt,
      lineHeight: layout.lineHeight,
    },

    detail: {
      fontFamily: fonts.pdf.regular,
      marginTop: layout.detailGapPt,
      color: "#414141",
    },

    bulletRow: {
      flexDirection: "row",
      marginTop: layout.bulletGapPt,
      paddingLeft: 1,
    },

    bulletGlyph: {
      width: layout.bulletIndentPt,
      fontFamily: fonts.pdf.regular,
      fontSize: layout.bodyPt,
    },

    bulletText: {
      flex: 1,
      fontSize: layout.bodyPt,
      lineHeight: layout.lineHeight,
    },
  });

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

  
const visible = Array.from(new Set(cv.order)).filter(
  (section) =>
    !cv.hidden.includes(section) &&
    hasSectionContent(cv, section)
);


  // Menampilkan satu bullet untuk setiap baris.
  function Bullets({ value }: { value: string }) {
    return (
      <>
        {splitLines(value).map((line, index) => (
          <View
            key={`${index}-${line.slice(0, 20)}`}
            style={styles.bulletRow}
          >
            <Text style={styles.bulletGlyph}>
              {"•"}
            </Text>

            <Text
              style={styles.bulletText}
              orphans={2}
              widows={2}
            >
              {line}
            </Text>
          </View>
        ))}
      </>
    );
  }

  // Menjaga judul entri dekat dengan isi berikutnya.
  function EntryHeader({
    children,
  }: {
    children: ReactNode;
  }) {
    return (
      <View minPresenceAhead={layout.bodyPt * 2.4}>
        <Text>{children}</Text>
      </View>
    );
  }

  function Content({
    section,
  }: {
    section: SectionKey;
  }) {
    switch (section) {
      case "summary":
        return (
          <Text orphans={2} widows={2}>
            {cv.summary.trim()}
          </Text>
        );

      case "skills": {
        const items = cv.skills.filter(
          (item) =>
            item.category.trim() ||
            item.values.trim()
        );

        return (
          <>
            {items.map((item, index) => (
              <Text
                key={item.id}
                style={{
                  marginBottom:
                    index < items.length - 1
                      ? layout.bulletGapPt
                      : 0,
                }}
              >
                {item.category.trim() ? (
                  <Text style={styles.entryTitle}>
                    {item.category.trim()}:{" "}
                  </Text>
                ) : null}

                {item.values.trim()}
              </Text>
            ))}
          </>
        );
      }

      case "experience": {
        const items = cv.experience.filter(
          (item) =>
            item.role.trim() ||
            item.organization.trim() ||
            item.details.trim()
        );

        return (
          <>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={{
                  marginBottom:
                    index < items.length - 1
                      ? layout.entryGapPt
                      : 0,
                }}
              >
                <EntryHeader>
                  <Text style={styles.entryTitle}>
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
                </EntryHeader>

                <Bullets value={item.details} />
              </View>
            ))}
          </>
        );
      }

      case "education": {
        const items = cv.education.filter(
          (item) =>
            item.institution.trim() ||
            item.degree.trim()
        );

        return (
          <>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={{
                  marginBottom:
                    index < items.length - 1
                      ? layout.entryGapPt
                      : 0,
                }}
              >
                <EntryHeader>
                  <Text style={styles.entryTitle}>
                    {item.institution.trim()}
                  </Text>

                  {item.degree.trim()
                    ? ` | ${item.degree.trim()}`
                    : ""}

                  {item.period.trim()
                    ? ` | ${item.period.trim()}`
                    : ""}
                </EntryHeader>

                {item.details.trim() ? (
                  <Text
                    style={styles.detail}
                    orphans={2}
                    widows={2}
                  >
                    {item.details.trim()}
                  </Text>
                ) : null}
              </View>
            ))}
          </>
        );
      }

      case "projects": {
        const items = cv.projects.filter(
          (item) =>
            item.name.trim() ||
            item.details.trim()
        );

        return (
          <>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={{
                  marginBottom:
                    index < items.length - 1
                      ? layout.entryGapPt
                      : 0,
                }}
              >
                <EntryHeader>
                  <Text style={styles.entryTitle}>
                    {item.name.trim()}
                  </Text>

                  {item.period.trim()
                    ? ` | ${item.period.trim()}`
                    : ""}
                </EntryHeader>

                {item.details.trim() ? (
                  <Text
                    style={styles.detail}
                    orphans={2}
                    widows={2}
                  >
                    {item.details.trim()}
                  </Text>
                ) : null}
              </View>
            ))}
          </>
        );
      }

      default:
        return <Bullets value={cv[section]} />;
    }
  }

  return (
    <Document
      title={`${cv.profile.name.trim() || "My"} - CV`}
      author={
        cv.profile.name.trim() || "Zaeeon CV Studio"
      }
      subject="Resume generated with Zaeeon CV Studio"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} wrap={false}>
          {cv.template === "academic" ? (
            <Text style={styles.topline}>
              {cv.language === "id"
                ? "DAFTAR RIWAYAT HIDUP AKADEMIK"
                : "ACADEMIC CURRICULUM VITAE"}
            </Text>
          ) : null}

          <Text style={styles.name}>
            {(
              cv.profile.name.trim() ||
              (cv.language === "id"
                ? "NAMA LENGKAP"
                : "YOUR NAME")
            ).toUpperCase()}
          </Text>

          {cv.profile.headline.trim() ? (
            <Text style={styles.subtitle}>
              {cv.profile.headline.trim()}
            </Text>
          ) : null}

          {contact ? (
            <Text style={styles.contact}>
              {contact}
            </Text>
          ) : null}
        </View>

        {visible.map((section, index) => (
          <View
            key={section}
            style={{
              marginTop:
                index === 0
                  ? 0
                  : layout.sectionGapPt,
            }}
          >
            <View
              style={styles.sectionHeading}
              minPresenceAhead={layout.bodyPt * 2.7}
            >
              <Text style={styles.sectionTitle}>
                {SECTION_TITLES[cv.language][
                  section
                ].toUpperCase()}
              </Text>
            </View>

            <Content section={section} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
