import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData, ResumeLanguage } from '@/lib/types';

// Sections shown in the right main column; sidebar always gets contact/skills/languages.
const MAIN_KEYS = ['summary', 'experience', 'education', 'certifications', 'projects'];

const SIDEBAR_W = 175; // pts — ~30% of A4 595pt width
const ACCENT = '#4f46e5';
const SIDEBAR_BG = ACCENT;
const SIDEBAR_TEXT = '#ffffff';
const SIDEBAR_MUTED = 'rgba(255,255,255,0.65)';

function fmtDate(d: string): string {
  if (!d) return '';
  const m = d.match(/^(\d{4})-(\d{2})/);
  if (m) {
    const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m[2] - 1];
    if (month) return `${month} ${m[1]}`;
  }
  return d;
}

function sanitize(text: string): string {
  return text
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .replace(/ /g, ' ');
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 0,
  },
  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: SIDEBAR_BG,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 16,
    minHeight: 841,
  },
  main: {
    flex: 1,
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 22,
    paddingRight: 28,
  },

  // ── Sidebar styles ─────────────────────────────────────────────────────────
  sName: {
    fontSize: 17,
    fontWeight: 700,
    color: SIDEBAR_TEXT,
    lineHeight: 1.2,
    marginBottom: 4,
  },
  sJobTitle: {
    fontSize: 10,
    fontWeight: 400,
    color: SIDEBAR_MUTED,
    marginBottom: 14,
  },
  sSectionLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: SIDEBAR_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginTop: 16,
    marginBottom: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingTop: 10,
  },
  sContactLine: {
    fontSize: 8.5,
    color: SIDEBAR_TEXT,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  sSkill: {
    fontSize: 9,
    color: SIDEBAR_TEXT,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  sLangRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sLangName: {
    fontSize: 9,
    color: SIDEBAR_TEXT,
  },
  sLangLevel: {
    fontSize: 8.5,
    color: SIDEBAR_MUTED,
  },

  // ── Main column styles ─────────────────────────────────────────────────────
  mSectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginTop: 16,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#c7d2fe',
  },
  mSummary: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  mEntry: {
    marginBottom: 8,
  },
  mItemHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  mTitleWrapper: {
    flex: 1,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
    marginRight: 6,
  },
  mTitle: {
    fontWeight: 700,
    fontSize: 10,
    color: '#111827',
  },
  mCompany: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: '#6b7280',
  },
  mDateLocation: {
    fontSize: 8.5,
    color: '#9ca3af',
    textAlign: 'right',
    flexShrink: 0,
  },
  mBulletList: {
    marginLeft: 10,
    marginTop: 2,
  },
  mBulletPoint: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 2,
  },
  mBullet: {
    width: 10,
    fontSize: 9,
    color: ACCENT,
    flexShrink: 0,
  },
  mBulletText: {
    flex: 1,
    fontSize: 9.5,
    color: '#374151',
    lineHeight: 1.5,
  },
  mMetaText: {
    fontSize: 8.5,
    color: '#9ca3af',
    marginTop: 1,
  },
});

interface SidebarTemplateProps {
  data: ResumeData;
  sectionOrder?: string[];
  accentColor?: string;
}

export default function SidebarTemplate({ data, sectionOrder, accentColor }: SidebarTemplateProps) {
  const accent = accentColor || ACCENT;
  const { contact, summary, experience, education, skills, projects, certifications, languages } = data;
  const mainOrder = (sectionOrder || MAIN_KEYS).filter(id => MAIN_KEYS.includes(id));

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const contactLines = [
    contact.email,
    contact.phone,
    [contact.city, contact.country].filter(Boolean).join(', '),
    contact.linkedin,
    contact.github || contact.website,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Left sidebar ────────────────────────────────────────────────── */}
        <View style={[styles.sidebar, { backgroundColor: accent }]}>
          {fullName ? <Text style={styles.sName}>{fullName}</Text> : null}
          {contact.jobTitle ? <Text style={styles.sJobTitle}>{sanitize(contact.jobTitle)}</Text> : null}

          {/* Contact */}
          {contactLines.length > 0 && (
            <View>
              <Text style={styles.sSectionLabel}>Contact</Text>
              {contactLines.map((line, i) => (
                <Text key={i} style={styles.sContactLine}>{line}</Text>
              ))}
            </View>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <View>
              <Text style={styles.sSectionLabel}>Skills</Text>
              {skills.map((s, i) => (
                <Text key={i} style={styles.sSkill}>{sanitize(s.name)}</Text>
              ))}
            </View>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <View>
              <Text style={styles.sSectionLabel}>Languages</Text>
              {languages.map((lang: ResumeLanguage, i: number) => (
                <View key={i} style={styles.sLangRow}>
                  <Text style={styles.sLangName}>{sanitize(lang.name)}</Text>
                  <Text style={styles.sLangLevel}>{lang.proficiency}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <View style={styles.main}>
          {mainOrder.map((sectionId) => {

            if (sectionId === 'summary') {
              if (!summary) return null;
              return (
                <View key="summary" wrap={false}>
                  <Text style={[styles.mSectionTitle, { color: accent }]}>Summary</Text>
                  <Text style={styles.mSummary}>{sanitize(summary)}</Text>
                </View>
              );
            }

            if (sectionId === 'experience') {
              if (!experience || experience.length === 0) return null;
              return (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {experience.map((exp, idx) => {
                    const bullets = exp.description
                      .split('\n').map(b => b.trim()).filter(Boolean)
                      .map(b => sanitize(b.replace(/^[-•]\s*/, '')));
                    const dateStr = [
                      fmtDate(exp.startDate),
                      exp.currentlyWorking ? 'Present' : fmtDate(exp.endDate),
                    ].filter(Boolean).join(' – ');
                    const rightStr = [dateStr, exp.location].filter(Boolean).join('  |  ');

                    return (
                      <View key={`exp-${idx}`} wrap={false}>
                        {idx === 0 && <Text style={[styles.mSectionTitle, { color: accent }]}>Experience</Text>}
                        <View style={styles.mEntry}>
                          <View style={styles.mItemHeader}>
                            <View style={styles.mTitleWrapper}>
                              <Text style={styles.mTitle}>{sanitize(exp.position)}</Text>
                              {exp.company ? <Text style={styles.mCompany}>— {sanitize(exp.company)}</Text> : null}
                            </View>
                            {rightStr ? <Text style={styles.mDateLocation}>{rightStr}</Text> : null}
                          </View>
                          {bullets.length > 0 && (
                            <View style={styles.mBulletList}>
                              {bullets.map((bullet, bIdx) => (
                                <View key={bIdx} style={styles.mBulletPoint}>
                                  <Text style={[styles.mBullet, { color: accent }]}>▸</Text>
                                  <Text style={styles.mBulletText}>{bullet}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </>
              );
            }

            if (sectionId === 'education') {
              if (!education || education.length === 0) return null;
              return (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {education.map((edu, idx) => {
                    const deg = sanitize([edu.degree, edu.field ? `in ${edu.field}` : ''].filter(Boolean).join(' '));
                    const dateStr = [
                      fmtDate(edu.startDate),
                      edu.currentlyStudying ? 'Present' : fmtDate(edu.endDate),
                    ].filter(Boolean).join(' – ');

                    return (
                      <View key={`edu-${idx}`} wrap={false}>
                        {idx === 0 && <Text style={[styles.mSectionTitle, { color: accent }]}>Education</Text>}
                        <View style={styles.mEntry}>
                          <View style={styles.mItemHeader}>
                            <View style={styles.mTitleWrapper}>
                              {deg ? <Text style={styles.mTitle}>{deg}</Text> : null}
                              {edu.institution ? <Text style={styles.mCompany}>— {sanitize(edu.institution)}</Text> : null}
                            </View>
                            {dateStr ? <Text style={styles.mDateLocation}>{dateStr}</Text> : null}
                          </View>
                          {edu.score ? <Text style={styles.mMetaText}>GPA / Score: {edu.score}</Text> : null}
                        </View>
                      </View>
                    );
                  })}
                </>
              );
            }

            if (sectionId === 'certifications') {
              if (!certifications || certifications.length === 0) return null;
              return (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {certifications.map((cert, idx) => {
                    const dateStr = [
                      fmtDate(cert.issueDate),
                      cert.doesNotExpire ? 'No Expiry' : fmtDate(cert.expiryDate),
                    ].filter(Boolean).join(' – ');

                    return (
                      <View key={`cert-${idx}`} wrap={false}>
                        {idx === 0 && <Text style={[styles.mSectionTitle, { color: accent }]}>Certifications</Text>}
                        <View style={styles.mEntry}>
                          <View style={styles.mItemHeader}>
                            <View style={styles.mTitleWrapper}>
                              <Text style={styles.mTitle}>{sanitize(cert.name)}</Text>
                              {cert.issuer ? <Text style={styles.mCompany}>— {sanitize(cert.issuer)}</Text> : null}
                            </View>
                            {dateStr ? <Text style={styles.mDateLocation}>{dateStr}</Text> : null}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </>
              );
            }

            if (sectionId === 'projects') {
              if (!projects || projects.length === 0) return null;
              return (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {projects.map((proj, idx) => {
                    const bullets = proj.description
                      .split('\n').map(b => b.trim()).filter(Boolean)
                      .map(b => sanitize(b.replace(/^[-•]\s*/, '')));
                    const dateStr = [fmtDate(proj.startDate), fmtDate(proj.endDate)].filter(Boolean).join(' – ');

                    return (
                      <View key={`proj-${idx}`} wrap={false}>
                        {idx === 0 && <Text style={[styles.mSectionTitle, { color: accent }]}>Projects</Text>}
                        <View style={styles.mEntry}>
                          <View style={styles.mItemHeader}>
                            <View style={styles.mTitleWrapper}>
                              <Text style={styles.mTitle}>{sanitize(proj.name)}</Text>
                              {proj.url ? <Text style={styles.mCompany}>{proj.url}</Text> : null}
                            </View>
                            {dateStr ? <Text style={styles.mDateLocation}>{dateStr}</Text> : null}
                          </View>
                          {bullets.length > 0 ? (
                            <View style={styles.mBulletList}>
                              {bullets.map((bullet, bIdx) => (
                                <View key={bIdx} style={styles.mBulletPoint}>
                                  <Text style={[styles.mBullet, { color: accent }]}>▸</Text>
                                  <Text style={styles.mBulletText}>{bullet}</Text>
                                </View>
                              ))}
                            </View>
                          ) : proj.description ? (
                            <Text style={styles.mBulletText}>{sanitize(proj.description)}</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </>
              );
            }

            return null;
          })}
        </View>

      </Page>
    </Document>
  );
}
