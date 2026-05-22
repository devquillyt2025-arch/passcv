import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData, ResumeLanguage } from '@/lib/types';

const SECTION_KEYS = ['summary', 'skills', 'experience', 'education', 'certifications', 'languages', 'projects'];

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

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-normal.ttf' },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-normal.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-italic.ttf', fontStyle: 'italic' },
  ],
});

const DARK = '#0f172a';
const ACCENT = '#1e3a8a';

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 0,
    fontFamily: 'Open Sans',
    fontSize: 10,
    color: DARK,
    lineHeight: 1.5,
  },
  header: {
    backgroundColor: DARK,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 40,
    marginBottom: 0,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 5,
    lineHeight: 1.2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 400,
    color: '#94a3b8',
    marginBottom: 6,
  },
  contact: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  body: {
    paddingHorizontal: 40,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 7,
    paddingLeft: 8,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
  },
  summary: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 4,
  },
  entry: {
    marginBottom: 9,
  },
  itemHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  titleWrapper: {
    flex: 1,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  title: {
    fontWeight: 700,
    fontSize: 10.5,
    color: DARK,
  },
  company: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#475569',
  },
  dateLocation: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right',
    flexShrink: 0,
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 2,
  },
  bulletPoint: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: ACCENT,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.5,
  },
  metaText: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
});

interface ExecutiveTemplateProps {
  data: ResumeData;
  sectionOrder?: string[];
  accentColor?: string;
}

export default function ExecutiveTemplate({ data, sectionOrder, accentColor }: ExecutiveTemplateProps) {
  const accent = accentColor || ACCENT;
  const { contact, summary, experience, education, skills, projects, certifications, languages } = data;
  const order = (sectionOrder || SECTION_KEYS).filter(id => SECTION_KEYS.includes(id));

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const contactParts = [
    contact.email,
    contact.phone,
    [contact.city, contact.country].filter(Boolean).join(', '),
    contact.linkedin,
    contact.github || contact.website,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Dark header banner ───────────────────────────────────────────── */}
        <View style={styles.header} wrap={false}>
          {fullName && <Text style={styles.name}>{fullName}</Text>}
          {contact.jobTitle && <Text style={styles.jobTitle}>{sanitize(contact.jobTitle)}</Text>}
          {contactParts.length > 0 && <Text style={styles.contact}>{contactParts.join('  |  ')}</Text>}
        </View>

        {/* ── Body content ────────────────────────────────────────────────── */}
        <View style={styles.body}>
          {order.map((sectionId) => {

            if (sectionId === 'summary') {
              if (!summary) return null;
              return (
                <View key="summary" wrap={false}>
                  <Text style={[styles.sectionTitle, { color: accent, borderLeftColor: accent }]}>Professional Summary</Text>
                  <Text style={styles.summary}>{sanitize(summary)}</Text>
                </View>
              );
            }

            if (sectionId === 'skills') {
              if (!skills || skills.length === 0) return null;
              return (
                <View key="skills" wrap={false}>
                  <Text style={[styles.sectionTitle, { color: accent, borderLeftColor: accent }]}>Core Skills</Text>
                  <Text style={{ fontSize: 10, color: '#334155', lineHeight: 1.5 }}>
                    {skills.map(s => sanitize(s.name)).join('  ·  ')}
                  </Text>
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
                        {idx === 0 && <Text style={[styles.sectionTitle, { color: accent, borderLeftColor: accent }]}>Professional Experience</Text>}
                        <View style={styles.entry}>
                          <View style={styles.itemHeader}>
                            <View style={styles.titleWrapper}>
                              <Text style={styles.title}>{sanitize(exp.position)}</Text>
                              {exp.company ? <Text style={styles.company}>— {sanitize(exp.company)}</Text> : null}
                            </View>
                            {rightStr ? <Text style={styles.dateLocation}>{rightStr}</Text> : null}
                          </View>
                          {bullets.length > 0 && (
                            <View style={styles.bulletList}>
                              {bullets.map((bullet, bIdx) => (
                                <View key={bIdx} style={styles.bulletPoint}>
                                  <Text style={[styles.bullet, { color: accent }]}>▸</Text>
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
                    ].filter(Boolean).join(' – ');
                    const rightStr = [dateStr, edu.location].filter(Boolean).join('  |  ');

                    return (
                      <View key={`edu-${idx}`} wrap={false}>
                        {idx === 0 && <Text style={[styles.sectionTitle, { color: accent, borderLeftColor: accent }]}>Education</Text>}
                        <View style={styles.entry}>
                          <View style={styles.itemHeader}>
                            <View style={styles.titleWrapper}>
                              {deg ? <Text style={styles.title}>{deg}</Text> : null}
                              {edu.institution ? <Text style={styles.company}>— {sanitize(edu.institution)}</Text> : null}
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
                        {idx === 0 && <Text style={[styles.sectionTitle, { color: accent, borderLeftColor: accent }]}>Certifications</Text>}
                        <View style={styles.entry}>
                          <View style={styles.itemHeader}>
                            <View style={styles.titleWrapper}>
                              <Text style={styles.title}>{sanitize(cert.name)}</Text>
                              {cert.issuer ? <Text style={styles.company}>— {sanitize(cert.issuer)}</Text> : null}
                            </View>
                            {dateStr ? <Text style={styles.dateLocation}>{dateStr}</Text> : null}
                          </View>
                          {cert.credentialId ? <Text style={styles.metaText}>ID: {cert.credentialId}</Text> : null}
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
                      {idx === 0 && <Text style={[styles.sectionTitle, { color: accent, borderLeftColor: accent }]}>Languages</Text>}
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
                        {idx === 0 && <Text style={[styles.sectionTitle, { color: accent, borderLeftColor: accent }]}>Projects</Text>}
                        <View style={styles.entry}>
                          <View style={styles.itemHeader}>
                            <View style={styles.titleWrapper}>
                              <Text style={styles.title}>{sanitize(proj.name)}</Text>
                              {proj.url ? <Text style={styles.company}>{proj.url}</Text> : null}
                            </View>
                            {dateStr ? <Text style={styles.dateLocation}>{dateStr}</Text> : null}
                          </View>
                          {bullets.length > 0 ? (
                            <View style={styles.bulletList}>
                              {bullets.map((bullet, bIdx) => (
                                <View key={bIdx} style={styles.bulletPoint}>
                                  <Text style={[styles.bullet, { color: accent }]}>▸</Text>
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

            return null;
          })}
        </View>

      </Page>
    </Document>
  );
}
