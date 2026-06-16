import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData, ResumeLanguage } from '@/lib/types';

const SECTION_KEYS = [
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
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: '#111827',
    lineHeight: 1.45,
  },
  header: {
    paddingTop: 4,
    marginBottom: 12,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4,
  },
  contact: {
    fontSize: 9.5,
    color: '#4b5563',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#111827',
    paddingBottom: 2,
    marginBottom: 7,
    marginTop: 12,
  },
  summary: {
    fontSize: 10.5,
    marginBottom: 4,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  entry: {
    marginBottom: 7,
  },
  itemHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  titleWrapper: {
    flex: 1,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginRight: 8,
  },
  title: {
    fontWeight: 700,
    fontSize: 10.5,
  },
  company: {
    fontStyle: 'italic',
    color: '#374151',
    fontSize: 10.5,
  },
  dateLocation: {
    fontSize: 9.5,
    color: '#4b5563',
    textAlign: 'right',
    flexShrink: 0,
  },
  bulletList: {
    marginLeft: 10,
  },
  bulletPoint: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.45,
  },
  metaText: {
    fontSize: 9.5,
    color: '#6b7280',
    marginTop: 1,
  },
});

interface ClassicTemplateProps {
  data: ResumeData;
  sectionOrder?: string[];
  accentColor?: string;
}

export default function ClassicTemplate({ data, sectionOrder }: ClassicTemplateProps) {
  const { contact, summary, experience, education, skills, projects, certifications, languages } = data;
  const awards = data.awards || [];
  const volunteer = data.volunteer || [];
  const courses = data.courses || [];
  const publications = data.publications || [];
  const order = (sectionOrder || SECTION_KEYS).filter(id => SECTION_KEYS.includes(id) || id.startsWith('custom-'));

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

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header} wrap={false}>
          {fullName && <Text style={styles.name}>{fullName}</Text>}
          {contact.jobTitle && <Text style={styles.jobTitle}>{sanitize(contact.jobTitle)}</Text>}
          {contactParts.length > 0 && <Text style={styles.contact}>{contactParts.join('  |  ')}</Text>}
        </View>

        {/* ── Sections in user-specified order ────────────────────────────── */}
        {order.map((sectionId) => {

          // ── Summary ────────────────────────────────────────────────────
          if (sectionId === 'summary') {
            if (!summary) return null;
            return (
              <View key="summary" wrap={false}>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
                <Text style={styles.summary}>{sanitize(summary)}</Text>
              </View>
            );
          }

          // ── Skills ─────────────────────────────────────────────────────
          if (sectionId === 'skills') {
            if (!skills || skills.length === 0) return null;
            return (
              <View key="skills" wrap={false}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <Text style={{ fontSize: 10.5, lineHeight: 1.5 }}>{skills.map(s => sanitize(s.name)).join(', ')}</Text>
              </View>
            );
          }

          // ── Experience ─────────────────────────────────────────────────
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

                  return (
                    <View key={`exp-${idx}`} wrap={false}>
                      {idx === 0 && <Text style={styles.sectionTitle}>Professional Experience</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{sanitize(exp.position)}</Text>
                            {exp.company ? <Text style={styles.company}>{sanitize(exp.company)}</Text> : null}
                          </View>
                          <View style={styles.dateLocation}>
                            {exp.location ? <Text>{exp.location}</Text> : null}
                            {dateStr ? <Text>{dateStr}</Text> : null}
                          </View>
                        </View>
                        {bullets.length > 0 && (
                          <View style={styles.bulletList}>
                            {bullets.map((bullet, bIdx) => (
                              <View key={bIdx} style={styles.bulletPoint}>
                                <Text style={styles.bullet}>-</Text>
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

          // ── Education ──────────────────────────────────────────────────
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

                  return (
                    <View key={`edu-${idx}`} wrap={false}>
                      {idx === 0 && <Text style={styles.sectionTitle}>Education</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            {deg ? <Text style={styles.title}>{deg}</Text> : null}
                            {edu.institution ? <Text style={styles.company}>{sanitize(edu.institution)}</Text> : null}
                          </View>
                          <View style={styles.dateLocation}>
                            {edu.location ? <Text>{edu.location}</Text> : null}
                            {dateStr ? <Text>{dateStr}</Text> : null}
                          </View>
                        </View>
                        {edu.score ? <Text style={styles.metaText}>GPA / Score: {edu.score}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </>
            );
          }

          // ── Certifications ─────────────────────────────────────────────
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
                  const meta = [
                    cert.credentialId ? `ID: ${cert.credentialId}` : '',
                    cert.credentialUrl || '',
                  ].filter(Boolean).join('  |  ');

                  return (
                    <View key={`cert-${idx}`} wrap={false}>
                      {idx === 0 && <Text style={styles.sectionTitle}>Certifications</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{sanitize(cert.name)}</Text>
                            {cert.issuer ? <Text style={styles.company}>{sanitize(cert.issuer)}</Text> : null}
                          </View>
                          {dateStr ? <Text style={styles.dateLocation}>{dateStr}</Text> : null}
                        </View>
                        {meta ? <Text style={styles.metaText}>{meta}</Text> : null}
                      </View>
                    </View>
                  );
                })}
              </>
            );
          }

          // ── Languages ──────────────────────────────────────────────────
          if (sectionId === 'languages') {
            if (!languages || languages.length === 0) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {languages.map((lang: ResumeLanguage, idx: number) => (
                  <View key={`lang-${idx}`} wrap={false}>
                    {idx === 0 && <Text style={styles.sectionTitle}>Languages</Text>}
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

          // ── Projects ───────────────────────────────────────────────────
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
                      {idx === 0 && <Text style={styles.sectionTitle}>Projects</Text>}
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
                                <Text style={styles.bullet}>-</Text>
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

          // ── Awards ─────────────────────────────────────────────────────
          if (sectionId === 'awards') {
            if (!awards.length) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {awards.map((award, idx) => (
                  <View key={`award-${idx}`} wrap={false}>
                    {idx === 0 && <Text style={styles.sectionTitle}>Awards</Text>}
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

          // ── Volunteer ──────────────────────────────────────────────────
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
                      {idx === 0 && <Text style={styles.sectionTitle}>Volunteer Work</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{sanitize(vol.role)}</Text>
                            {vol.organization ? <Text style={styles.company}>{sanitize(vol.organization)}</Text> : null}
                          </View>
                          <View style={styles.dateLocation}>
                            {vol.location ? <Text>{vol.location}</Text> : null}
                            {dateStr ? <Text>{dateStr}</Text> : null}
                          </View>
                        </View>
                        {bullets.length > 0 && (
                          <View style={styles.bulletList}>
                            {bullets.map((bullet, bIdx) => (
                              <View key={bIdx} style={styles.bulletPoint}>
                                <Text style={styles.bullet}>-</Text>
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

          // ── Courses ────────────────────────────────────────────────────
          if (sectionId === 'courses') {
            if (!courses.length) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {courses.map((course, idx) => (
                  <View key={`course-${idx}`} wrap={false}>
                    {idx === 0 && <Text style={styles.sectionTitle}>Courses</Text>}
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

          // ── Publications ───────────────────────────────────────────────
          if (sectionId === 'publications') {
            if (!publications.length) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {publications.map((pub, idx) => (
                  <View key={`pub-${idx}`} wrap={false}>
                    {idx === 0 && <Text style={styles.sectionTitle}>Publications</Text>}
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

          // ── Custom Sections ────────────────────────────────────────────
          if (sectionId.startsWith('custom-')) {
            const customSection = data.customSections?.find((s) => s.id === sectionId);
            if (!customSection || !customSection.items || customSection.items.length === 0) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {customSection.items.map((item, idx) => (
                  <View key={`${sectionId}-${idx}`} wrap={false}>
                    {idx === 0 && <Text style={styles.sectionTitle}>{sanitize(customSection.title || 'Custom Section')}</Text>}
                    <View style={styles.entry}>
                      <View style={styles.itemHeader}>
                        <View style={styles.titleWrapper}>
                          <Text style={styles.title}>{sanitize(item.name)}</Text>
                        </View>
                      </View>
                      {item.description ? (
                        <Text style={styles.summary}>{sanitize(item.description)}</Text>
                      ) : null}
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
