import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData, ResumeLanguage } from '@/lib/types';

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

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#111827',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
    maxWidth: 210,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.15,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: 400,
    color: '#374151',
  },
  contactLine: {
    fontSize: 8.5,
    color: '#4b5563',
    lineHeight: 1.5,
    textAlign: 'right',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flexShrink: 0,
    marginRight: 6,
  },
  sectionLine: {
    flex: 1,
    borderBottomWidth: 0.75,
  },
  summary: {
    fontSize: 9.5,
    color: '#374151',
    lineHeight: 1.55,
    textAlign: 'justify',
    marginBottom: 2,
  },
  entry: {
    marginBottom: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  titleWrapper: {
    flex: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
    marginRight: 6,
  },
  title: {
    fontWeight: 700,
    fontSize: 9.5,
    color: '#111827',
  },
  company: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: '#6b7280',
  },
  dateLocation: {
    fontSize: 8.5,
    color: '#6b7280',
    textAlign: 'right',
    flexShrink: 0,
  },
  bulletList: {
    marginLeft: 8,
    marginTop: 1,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 1.5,
  },
  bullet: {
    width: 9,
    fontSize: 9,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: '#374151',
    lineHeight: 1.4,
  },
  metaText: {
    fontSize: 8.5,
    color: '#6b7280',
    marginTop: 1,
  },
});

interface CompactTemplateProps {
  data: ResumeData;
  sectionOrder?: string[];
  accentColor?: string;
}

function SectionHeader({ label, accent }: { label: string; accent: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{label}</Text>
      <View style={[styles.sectionLine, { borderBottomColor: accent + '55' }]} />
    </View>
  );
}

export default function CompactTemplate({ data, sectionOrder, accentColor }: CompactTemplateProps) {
  const accent = accentColor || '#111827';
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Two-column header ─────────────────────────────────────── */}
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

        {/* ── Sections ──────────────────────────────────────────────── */}
        {order.map((sectionId) => {

          // ── Summary ────────────────────────────────────────────────
          if (sectionId === 'summary') {
            if (!summary) return null;
            return (
              <View key="summary" wrap={false}>
                <SectionHeader label="Summary" accent={accent} />
                <Text style={styles.summary}>{sanitize(summary)}</Text>
              </View>
            );
          }

          // ── Skills ─────────────────────────────────────────────────
          if (sectionId === 'skills') {
            if (!skills || skills.length === 0) return null;
            return (
              <View key="skills" wrap={false}>
                <SectionHeader label="Skills" accent={accent} />
                <Text style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.4 }}>
                  {skills.map(s => sanitize(s.name)).join('  ·  ')}
                </Text>
              </View>
            );
          }

          // ── Experience ─────────────────────────────────────────────
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
                  ].filter(Boolean).join(' - ');
                  const rightStr = [dateStr, exp.location].filter(Boolean).join('  |  ');

                  return (
                    <View key={`exp-${idx}`} wrap={false}>
                      {idx === 0 && <SectionHeader label="Experience" accent={accent} />}
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
                                <Text style={[styles.bullet, { color: accent }]}>-</Text>
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

          // ── Education ──────────────────────────────────────────────
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
                      {idx === 0 && <SectionHeader label="Education" accent={accent} />}
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

          // ── Certifications ─────────────────────────────────────────
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
                      {idx === 0 && <SectionHeader label="Certifications" accent={accent} />}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{sanitize(cert.name)}</Text>
                            {cert.issuer ? <Text style={styles.company}>{sanitize(cert.issuer)}</Text> : null}
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

          // ── Languages ──────────────────────────────────────────────
          if (sectionId === 'languages') {
            if (!languages || languages.length === 0) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {languages.map((lang: ResumeLanguage, idx: number) => (
                  <View key={`lang-${idx}`} wrap={false}>
                    {idx === 0 && <SectionHeader label="Languages" accent={accent} />}
                    <View style={[styles.entry, { marginBottom: 3 }]}>
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

          // ── Projects ───────────────────────────────────────────────
          if (sectionId === 'projects') {
            if (!projects || projects.length === 0) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {projects.map((proj, idx) => {
                  const bullets = proj.description
                    .split('\n').map(b => b.trim()).filter(Boolean)
                    .map(b => sanitize(b.replace(/^[-•]\s*/, '')));
                  const dateStr = [fmtDate(proj.startDate), fmtDate(proj.endDate)].filter(Boolean).join(' - ');

                  return (
                    <View key={`proj-${idx}`} wrap={false}>
                      {idx === 0 && <SectionHeader label="Projects" accent={accent} />}
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
                                <Text style={[styles.bullet, { color: accent }]}>-</Text>
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

          // ── Awards ─────────────────────────────────────────────────
          if (sectionId === 'awards') {
            if (!awards.length) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {awards.map((award, idx) => (
                  <View key={`award-${idx}`} wrap={false}>
                    {idx === 0 && <SectionHeader label="Awards" accent={accent} />}
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

          // ── Volunteer ──────────────────────────────────────────────
          if (sectionId === 'volunteer') {
            if (!volunteer.length) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {volunteer.map((vol, idx) => {
                  const bullets = vol.description
                    .split('\n').map(b => b.trim()).filter(Boolean)
                    .map(b => sanitize(b.replace(/^[-•]\s*/, '')));
                  const dateStr = [
                    fmtDate(vol.startDate),
                    vol.currentlyVolunteering ? 'Present' : fmtDate(vol.endDate),
                  ].filter(Boolean).join(' - ');

                  return (
                    <View key={`vol-${idx}`} wrap={false}>
                      {idx === 0 && <SectionHeader label="Volunteer" accent={accent} />}
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
                                <Text style={[styles.bullet, { color: accent }]}>-</Text>
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

          // ── Courses ────────────────────────────────────────────────
          if (sectionId === 'courses') {
            if (!courses.length) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {courses.map((course, idx) => (
                  <View key={`course-${idx}`} wrap={false}>
                    {idx === 0 && <SectionHeader label="Courses" accent={accent} />}
                    <View style={styles.entry}>
                      <View style={styles.itemHeader}>
                        <View style={styles.titleWrapper}>
                          <Text style={styles.title}>{sanitize(course.name)}</Text>
                          {course.platform ? <Text style={styles.company}>{sanitize(course.platform)}</Text> : null}
                        </View>
                        {course.completionDate ? <Text style={styles.dateLocation}>{fmtDate(course.completionDate)}</Text> : null}
                      </View>
                    </View>
                  </View>
                ))}
              </>
            );
          }

          // ── Publications ───────────────────────────────────────────
          if (sectionId === 'publications') {
            if (!publications.length) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {publications.map((pub, idx) => (
                  <View key={`pub-${idx}`} wrap={false}>
                    {idx === 0 && <SectionHeader label="Publications" accent={accent} />}
                    <View style={styles.entry}>
                      <View style={styles.itemHeader}>
                        <View style={styles.titleWrapper}>
                          <Text style={styles.title}>{sanitize(pub.title)}</Text>
                          {pub.publisher ? <Text style={styles.company}>{sanitize(pub.publisher)}</Text> : null}
                        </View>
                        {pub.date ? <Text style={styles.dateLocation}>{fmtDate(pub.date)}</Text> : null}
                      </View>
                      {pub.coAuthors ? <Text style={styles.metaText}>Co-authors: {sanitize(pub.coAuthors)}</Text> : null}
                    </View>
                  </View>
                ))}
              </>
            );
          }

          // ── Custom Sections ────────────────────────────────────────
          if (sectionId.startsWith('custom-')) {
            const customSection = data.customSections?.find((s) => s.id === sectionId);
            if (!customSection || !customSection.items || customSection.items.length === 0) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {customSection.items.map((item, idx) => (
                  <View key={`${sectionId}-${idx}`} wrap={false}>
                    {idx === 0 && <SectionHeader label={sanitize(customSection.title || 'Other')} accent={accent} />}
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

      </Page>
    </Document>
  );
}
