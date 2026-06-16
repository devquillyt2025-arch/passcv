import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData, ResumeLanguage } from '@/lib/types';

/**
 * Shared, config-driven renderer for the additional resume templates.
 *
 * Each template file calls `makeTemplate(spec)` with a small style spec and gets
 * back a component compatible with the PDF TEMPLATE_MAP (props: data,
 * sectionOrder, accentColor). All templates built on this engine are
 * single-column, which keeps them parseable by ATS scanners; visual variety
 * comes from the header style, heading treatment, typography and accent color.
 */

const ALL_SECTION_KEYS = [
  'summary', 'skills', 'experience', 'education', 'certifications',
  'languages', 'projects', 'awards', 'volunteer', 'courses', 'publications',
];

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

function bulletsOf(text: string): string[] {
  return text
    .split('\n').map(b => b.trim()).filter(Boolean)
    .map(b => sanitize(b.replace(/^[-•]\s*/, '')));
}

export interface TemplateSpec {
  /** Fallback accent when the builder does not pass an accentColor. */
  accent: string;
  /** react-pdf built-in family: 'Helvetica' | 'Times-Roman' | 'Courier'. */
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  /** Header layout. */
  header: 'plain' | 'centered' | 'band';
  /** Section heading treatment. */
  heading: 'leftborder' | 'underline' | 'rule' | 'filled';
  nameSize: number;
  nameUppercase?: boolean;
  /** Render skills as bordered chips, or as a single inline dot-separated line. */
  skills: 'chips' | 'inline';
  /** Italicize company/issuer/institution lines (serif templates look better with this off). */
  italicCompany?: boolean;
}

export default function makeTemplate(spec: TemplateSpec) {
  const isBand = spec.header === 'band';
  const isCentered = spec.header === 'centered';

  const styles = StyleSheet.create({
    page: {
      paddingTop: isBand ? 0 : 34,
      paddingBottom: 48,
      paddingHorizontal: isBand ? 0 : 40,
      fontFamily: spec.fontFamily,
      fontSize: 10,
      color: '#1e293b',
      lineHeight: 1.5,
    },
    body: {
      paddingHorizontal: isBand ? 40 : 0,
    },
    // ── plain / centered header ──
    header: {
      flexDirection: isCentered ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isCentered ? 'center' : 'flex-start',
      marginBottom: 14,
      paddingBottom: 12,
      borderBottomWidth: isCentered ? 0.75 : 1.5,
      borderBottomColor: '#cbd5e1',
    },
    headerLeft: { flex: 1 },
    headerRight: { flexShrink: 0, alignItems: 'flex-end', maxWidth: 210 },
    // ── band header ──
    band: {
      paddingTop: 28,
      paddingBottom: 20,
      paddingHorizontal: 40,
      marginBottom: 4,
    },
    name: {
      fontSize: spec.nameSize,
      fontWeight: 700,
      color: '#0f172a',
      lineHeight: 1.15,
      marginBottom: 3,
      textAlign: isCentered ? 'center' : 'left',
      textTransform: spec.nameUppercase ? 'uppercase' : 'none',
      letterSpacing: spec.nameUppercase ? 1 : 0,
    },
    jobTitle: {
      fontSize: 11,
      color: '#475569',
      textAlign: isCentered ? 'center' : 'left',
    },
    contactLine: {
      fontSize: 9,
      color: '#64748b',
      lineHeight: 1.5,
      textAlign: isCentered ? 'center' : 'right',
    },
    contactCentered: {
      fontSize: 9,
      color: '#64748b',
      lineHeight: 1.5,
      textAlign: 'center',
      marginTop: 5,
    },
    sectionTitle: {
      fontSize: 9.5,
      fontWeight: 700,
      textTransform: spec.heading === 'filled' ? 'uppercase' : 'uppercase',
      letterSpacing: 1.1,
      marginTop: 15,
      marginBottom: 7,
    },
    summary: {
      fontSize: 10,
      color: '#334155',
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: 2,
    },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 2 },
    skillChip: {
      fontSize: 9,
      color: '#1e293b',
      backgroundColor: '#f1f5f9',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: '#cbd5e1',
    },
    skillInline: { fontSize: 10, color: '#334155', lineHeight: 1.6 },
    entry: { marginBottom: 8 },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 2,
    },
    titleWrapper: {
      flex: 1,
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 5,
      flexWrap: 'wrap',
      marginRight: 8,
    },
    title: { fontWeight: 700, fontSize: 10.5, color: '#0f172a' },
    company: {
      fontSize: 10,
      fontStyle: spec.italicCompany ? 'italic' : 'normal',
      color: '#475569',
    },
    dateLocation: { fontSize: 9, color: '#94a3b8', textAlign: 'right', flexShrink: 0 },
    bulletList: { marginLeft: 10, marginTop: 2 },
    bulletPoint: { flexDirection: 'row', marginBottom: 2 },
    bullet: { width: 10, fontSize: 9, flexShrink: 0 },
    bulletText: { flex: 1, fontSize: 10, color: '#334155', lineHeight: 1.5 },
    metaText: { fontSize: 9, color: '#94a3b8', marginTop: 1 },
    urlText: { fontSize: 9, color: '#3b82f6', marginTop: 1 },
  });

  // Heading style varies by spec + accent (accent only known at render time).
  function headingStyle(accent: string) {
    switch (spec.heading) {
      case 'leftborder':
        return { color: accent, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: accent };
      case 'underline':
        return { color: accent, paddingBottom: 3, borderBottomWidth: 1.5, borderBottomColor: accent };
      case 'rule':
        return { color: '#334155', paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: '#cbd5e1' };
      case 'filled':
        return {
          color: '#ffffff',
          backgroundColor: accent,
          paddingVertical: 3,
          paddingHorizontal: 7,
          borderRadius: 2,
        };
      default:
        return { color: accent };
    }
  }

  interface TemplateProps {
    data: ResumeData;
    sectionOrder?: string[];
    accentColor?: string;
  }

  function Heading({ children, accent }: { children: string; accent: string }) {
    return <Text style={[styles.sectionTitle, headingStyle(accent)]}>{children}</Text>;
  }

  return function GeneratedTemplate({ data, sectionOrder, accentColor }: TemplateProps) {
    const accent = accentColor || spec.accent;
    const { contact, summary, experience, education, skills, projects, certifications, languages } = data;
    const awards = data.awards || [];
    const volunteer = data.volunteer || [];
    const courses = data.courses || [];
    const publications = data.publications || [];

    const order = (sectionOrder || ALL_SECTION_KEYS).filter(
      id => ALL_SECTION_KEYS.includes(id) || id.startsWith('custom-')
    );

    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    const contactLines = [
      contact.email,
      contact.phone,
      [contact.city, contact.country].filter(Boolean).join(', '),
      contact.linkedin,
      contact.github || contact.website,
    ].filter(Boolean);

    const bulletColor = spec.heading === 'rule' ? '#64748b' : accent;

    return (
      <Document>
        <Page size="A4" style={styles.page}>

          {/* ── Header ─────────────────────────────────────────────── */}
          {isBand ? (
            <View style={[styles.band, { backgroundColor: accent }]} wrap={false}>
              {fullName ? <Text style={[styles.name, { color: '#ffffff' }]}>{fullName}</Text> : null}
              {contact.jobTitle ? (
                <Text style={[styles.jobTitle, { color: 'rgba(255,255,255,0.85)' }]}>{sanitize(contact.jobTitle)}</Text>
              ) : null}
              {contactLines.length > 0 ? (
                <Text style={[styles.contactCentered, { color: 'rgba(255,255,255,0.85)', textAlign: 'left' }]}>
                  {contactLines.join('   |   ')}
                </Text>
              ) : null}
            </View>
          ) : isCentered ? (
            <View style={styles.header} wrap={false}>
              {fullName ? <Text style={styles.name}>{fullName}</Text> : null}
              {contact.jobTitle ? <Text style={styles.jobTitle}>{sanitize(contact.jobTitle)}</Text> : null}
              {contactLines.length > 0 ? (
                <Text style={styles.contactCentered}>{contactLines.join('   |   ')}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.header} wrap={false}>
              <View style={styles.headerLeft}>
                {fullName ? <Text style={styles.name}>{fullName}</Text> : null}
                {contact.jobTitle ? <Text style={styles.jobTitle}>{sanitize(contact.jobTitle)}</Text> : null}
              </View>
              <View style={styles.headerRight}>
                {contactLines.map((line, i) => (
                  <Text key={i} style={styles.contactLine}>{line}</Text>
                ))}
              </View>
            </View>
          )}

          {/* ── Body ───────────────────────────────────────────────── */}
          <View style={styles.body}>
            {order.map((sectionId) => {

              if (sectionId === 'summary') {
                if (!summary) return null;
                return (
                  <View key="summary" wrap={false}>
                    <Heading accent={accent}>Summary</Heading>
                    <Text style={styles.summary}>{sanitize(summary)}</Text>
                  </View>
                );
              }

              if (sectionId === 'skills') {
                if (!skills || skills.length === 0) return null;
                return (
                  <View key="skills" wrap={false}>
                    <Heading accent={accent}>Skills</Heading>
                    {spec.skills === 'chips' ? (
                      <View style={styles.skillsRow}>
                        {skills.map((s, i) => (
                          <Text key={i} style={styles.skillChip}>{sanitize(s.name)}</Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.skillInline}>{skills.map(s => sanitize(s.name)).join('  •  ')}</Text>
                    )}
                  </View>
                );
              }

              if (sectionId === 'experience') {
                if (!experience || experience.length === 0) return null;
                return (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {experience.map((exp, idx) => {
                      const bullets = bulletsOf(exp.description);
                      const dateStr = [
                        fmtDate(exp.startDate),
                        exp.currentlyWorking ? 'Present' : fmtDate(exp.endDate),
                      ].filter(Boolean).join(' - ');
                      const rightStr = [dateStr, exp.location].filter(Boolean).join('  |  ');
                      return (
                        <View key={`exp-${idx}`} wrap={false}>
                          {idx === 0 && <Heading accent={accent}>Experience</Heading>}
                          <View style={styles.entry}>
                            <View style={styles.itemHeader}>
                              <View style={styles.titleWrapper}>
                                <Text style={styles.title}>{sanitize(exp.position)}</Text>
                                {exp.company ? <Text style={styles.company}>{sanitize(exp.company)}</Text> : null}
                              </View>
                              {rightStr ? <Text style={styles.dateLocation}>{rightStr}</Text> : null}
                            </View>
                            {bullets.length > 0 && (
                              <View style={styles.bulletList}>
                                {bullets.map((bullet, bIdx) => (
                                  <View key={bIdx} style={styles.bulletPoint}>
                                    <Text style={[styles.bullet, { color: bulletColor }]}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
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
                      ].filter(Boolean).join(' - ');
                      const rightStr = [dateStr, edu.location].filter(Boolean).join('  |  ');
                      return (
                        <View key={`edu-${idx}`} wrap={false}>
                          {idx === 0 && <Heading accent={accent}>Education</Heading>}
                          <View style={styles.entry}>
                            <View style={styles.itemHeader}>
                              <View style={styles.titleWrapper}>
                                {deg ? <Text style={styles.title}>{deg}</Text> : null}
                                {edu.institution ? <Text style={styles.company}>{sanitize(edu.institution)}</Text> : null}
                              </View>
                              {rightStr ? <Text style={styles.dateLocation}>{rightStr}</Text> : null}
                            </View>
                            {edu.score ? <Text style={styles.metaText}>GPA / Score: {edu.score}</Text> : null}
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
                      const bullets = bulletsOf(proj.description);
                      const dateStr = [fmtDate(proj.startDate), fmtDate(proj.endDate)].filter(Boolean).join(' - ');
                      return (
                        <View key={`proj-${idx}`} wrap={false}>
                          {idx === 0 && <Heading accent={accent}>Projects</Heading>}
                          <View style={styles.entry}>
                            <View style={styles.itemHeader}>
                              <View style={styles.titleWrapper}>
                                <Text style={styles.title}>{sanitize(proj.name)}</Text>
                              </View>
                              {dateStr ? <Text style={styles.dateLocation}>{dateStr}</Text> : null}
                            </View>
                            {proj.url ? <Text style={styles.urlText}>{proj.url}</Text> : null}
                            {bullets.length > 0 ? (
                              <View style={styles.bulletList}>
                                {bullets.map((bullet, bIdx) => (
                                  <View key={bIdx} style={styles.bulletPoint}>
                                    <Text style={[styles.bullet, { color: bulletColor }]}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
                                  </View>
                                ))}
                              </View>
                            ) : proj.description ? (
                              <Text style={styles.bulletText}>{sanitize(proj.description)}</Text>
                            ) : null}
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
                      ].filter(Boolean).join(' - ');
                      return (
                        <View key={`cert-${idx}`} wrap={false}>
                          {idx === 0 && <Heading accent={accent}>Certifications</Heading>}
                          <View style={styles.entry}>
                            <View style={styles.itemHeader}>
                              <View style={styles.titleWrapper}>
                                <Text style={styles.title}>{sanitize(cert.name)}</Text>
                                {cert.issuer ? <Text style={styles.company}>{sanitize(cert.issuer)}</Text> : null}
                              </View>
                              {dateStr ? <Text style={styles.dateLocation}>{dateStr}</Text> : null}
                            </View>
                            {cert.credentialId ? <Text style={styles.metaText}>ID: {cert.credentialId}</Text> : null}
                            {cert.credentialUrl ? <Text style={styles.urlText}>{cert.credentialUrl}</Text> : null}
                          </View>
                        </View>
                      );
                    })}
                  </>
                );
              }

              if (sectionId === 'languages') {
                if (!languages || languages.length === 0) return null;
                return (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {languages.map((lang: ResumeLanguage, idx: number) => (
                      <View key={`lang-${idx}`} wrap={false}>
                        {idx === 0 && <Heading accent={accent}>Languages</Heading>}
                        <View style={[styles.entry, { marginBottom: 4 }]}>
                          <View style={styles.itemHeader}>
                            <Text style={styles.title}>{sanitize(lang.name)}</Text>
                            <Text style={styles.dateLocation}>{lang.proficiency}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </>
                );
              }

              if (sectionId === 'awards') {
                if (!awards.length) return null;
                return (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {awards.map((award, idx) => (
                      <View key={`award-${idx}`} wrap={false}>
                        {idx === 0 && <Heading accent={accent}>Awards</Heading>}
                        <View style={styles.entry}>
                          <View style={styles.itemHeader}>
                            <View style={styles.titleWrapper}>
                              <Text style={styles.title}>{sanitize(award.name)}</Text>
                              {award.issuer ? <Text style={styles.company}>{sanitize(award.issuer)}</Text> : null}
                            </View>
                            {award.date ? <Text style={styles.dateLocation}>{fmtDate(award.date)}</Text> : null}
                          </View>
                          {award.description ? <Text style={styles.summary}>{sanitize(award.description)}</Text> : null}
                        </View>
                      </View>
                    ))}
                  </>
                );
              }

              if (sectionId === 'volunteer') {
                if (!volunteer.length) return null;
                return (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {volunteer.map((vol, idx) => {
                      const bullets = bulletsOf(vol.description);
                      const dateStr = [
                        fmtDate(vol.startDate),
                        vol.currentlyVolunteering ? 'Present' : fmtDate(vol.endDate),
                      ].filter(Boolean).join(' - ');
                      return (
                        <View key={`vol-${idx}`} wrap={false}>
                          {idx === 0 && <Heading accent={accent}>Volunteer</Heading>}
                          <View style={styles.entry}>
                            <View style={styles.itemHeader}>
                              <View style={styles.titleWrapper}>
                                <Text style={styles.title}>{sanitize(vol.role)}</Text>
                                {vol.organization ? <Text style={styles.company}>{sanitize(vol.organization)}</Text> : null}
                              </View>
                              {dateStr ? <Text style={styles.dateLocation}>{dateStr}</Text> : null}
                            </View>
                            {bullets.length > 0 && (
                              <View style={styles.bulletList}>
                                {bullets.map((bullet, bIdx) => (
                                  <View key={bIdx} style={styles.bulletPoint}>
                                    <Text style={[styles.bullet, { color: bulletColor }]}>•</Text>
                                    <Text style={styles.bulletText}>{bullet}</Text>
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

              if (sectionId === 'courses') {
                if (!courses.length) return null;
                return (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {courses.map((course, idx) => (
                      <View key={`course-${idx}`} wrap={false}>
                        {idx === 0 && <Heading accent={accent}>Courses</Heading>}
                        <View style={styles.entry}>
                          <View style={styles.itemHeader}>
                            <View style={styles.titleWrapper}>
                              <Text style={styles.title}>{sanitize(course.name)}</Text>
                              {course.platform ? <Text style={styles.company}>{sanitize(course.platform)}</Text> : null}
                            </View>
                            {course.completionDate ? <Text style={styles.dateLocation}>{fmtDate(course.completionDate)}</Text> : null}
                          </View>
                          {course.certificateUrl ? <Text style={styles.urlText}>{course.certificateUrl}</Text> : null}
                        </View>
                      </View>
                    ))}
                  </>
                );
              }

              if (sectionId === 'publications') {
                if (!publications.length) return null;
                return (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {publications.map((pub, idx) => (
                      <View key={`pub-${idx}`} wrap={false}>
                        {idx === 0 && <Heading accent={accent}>Publications</Heading>}
                        <View style={styles.entry}>
                          <View style={styles.itemHeader}>
                            <View style={styles.titleWrapper}>
                              <Text style={styles.title}>{sanitize(pub.title)}</Text>
                              {pub.publisher ? <Text style={styles.company}>{sanitize(pub.publisher)}</Text> : null}
                            </View>
                            {pub.date ? <Text style={styles.dateLocation}>{fmtDate(pub.date)}</Text> : null}
                          </View>
                          {pub.coAuthors ? <Text style={styles.metaText}>Co-authors: {sanitize(pub.coAuthors)}</Text> : null}
                          {pub.url ? <Text style={styles.urlText}>{pub.url}</Text> : null}
                        </View>
                      </View>
                    ))}
                  </>
                );
              }

              if (sectionId.startsWith('custom-')) {
                const customSection = data.customSections?.find((s) => s.id === sectionId);
                if (!customSection || !customSection.items || customSection.items.length === 0) return null;
                return (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {customSection.items.map((item, idx) => (
                      <View key={`${sectionId}-${idx}`} wrap={false}>
                        {idx === 0 && <Heading accent={accent}>{sanitize(customSection.title || 'Other')}</Heading>}
                        <View style={styles.entry}>
                          <Text style={styles.title}>{sanitize(item.name)}</Text>
                          {item.description ? <Text style={styles.summary}>{sanitize(item.description)}</Text> : null}
                        </View>
                      </View>
                    ))}
                  </>
                );
              }

              return null;
            })}
          </View>
        </Page>
      </Document>
    );
  };
}
