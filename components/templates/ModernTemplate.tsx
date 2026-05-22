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

// Replace common Unicode characters that confuse ATS parsers with ASCII equivalents.
function sanitize(text: string): string {
  return text
    .replace(/[‘’]/g, "'")   // smart single quotes
    .replace(/[“”]/g, '"')   // smart double quotes
    .replace(/—/g, '-')           // em dash
    .replace(/–/g, '-')           // en dash
    .replace(/…/g, '...')         // ellipsis
    .replace(/ /g, ' ');          // non-breaking space
}

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf' },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-500-normal.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-normal.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-italic.ttf', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.5,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 10,
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: '#4b5563',
    marginBottom: 5,
  },
  contact: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
  },
  summary: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 4,
  },
  entry: {
    marginBottom: 8,
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
    color: '#111827',
  },
  company: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#4b5563',
  },
  dateLocation: {
    fontSize: 9,
    color: '#6b7280',
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
    color: '#374151',
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
  skillText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
  metaText: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 1,
  },
});

interface ModernTemplateProps {
  data: ResumeData;
  sectionOrder?: string[];
  accentColor?: string;
}

export default function ModernTemplate({ data, sectionOrder, accentColor }: ModernTemplateProps) {
  const accent = accentColor || '#2563eb';
  const { contact, summary, experience, education, skills, projects, certifications, languages } = data;
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
        <View style={[styles.header, { borderBottomColor: accent }]} wrap={false}>
          {fullName && <Text style={[styles.name, { color: accent }]}>{fullName}</Text>}
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
                <Text style={[styles.sectionTitle, { color: accent }]}>Summary</Text>
                <Text style={styles.summary}>{sanitize(summary)}</Text>
              </View>
            );
          }

          // ── Skills ─────────────────────────────────────────────────────
          if (sectionId === 'skills') {
            if (!skills || skills.length === 0) return null;
            return (
              <View key="skills" wrap={false}>
                <Text style={[styles.sectionTitle, { color: accent }]}>Skills</Text>
                <Text style={styles.skillText}>{skills.map(s => sanitize(s.name)).join(', ')}</Text>
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
                  const rightStr = [dateStr, exp.location].filter(Boolean).join('  |  ');

                  return (
                    <View key={`exp-${idx}`} wrap={false}>
                      {idx === 0 && <Text style={[styles.sectionTitle, { color: accent }]}>Experience</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{sanitize(exp.position)}</Text>
                            {exp.company ? <Text style={styles.company}>- {sanitize(exp.company)}</Text> : null}
                          </View>
                          {rightStr ? <Text style={styles.dateLocation}>{rightStr}</Text> : null}
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
                  const rightStr = [dateStr, edu.location].filter(Boolean).join('  |  ');

                  return (
                    <View key={`edu-${idx}`} wrap={false}>
                      {idx === 0 && <Text style={[styles.sectionTitle, { color: accent }]}>Education</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            {deg ? <Text style={styles.title}>{deg}</Text> : null}
                            {edu.institution ? <Text style={styles.company}>- {sanitize(edu.institution)}</Text> : null}
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
                      {idx === 0 && <Text style={[styles.sectionTitle, { color: accent }]}>Certifications</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{sanitize(cert.name)}</Text>
                            {cert.issuer ? <Text style={styles.company}>- {sanitize(cert.issuer)}</Text> : null}
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
                    {idx === 0 && <Text style={[styles.sectionTitle, { color: accent }]}>Languages</Text>}
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
                      {idx === 0 && <Text style={[styles.sectionTitle, { color: accent }]}>Projects</Text>}
                      <View style={styles.entry}>
                        <View style={styles.itemHeader}>
                          <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{sanitize(proj.name)}</Text>
                            {proj.url ? <Text style={styles.company}>- {proj.url}</Text> : null}
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

          // ── Custom Sections ────────────────────────────────────────────
          if (sectionId.startsWith('custom-')) {
            const customSection = data.customSections?.find((s) => s.id === sectionId);
            if (!customSection || !customSection.items || customSection.items.length === 0) return null;
            return (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {customSection.items.map((item, idx) => (
                  <View key={`${sectionId}-${idx}`} wrap={false}>
                    {idx === 0 && <Text style={[styles.sectionTitle, { color: accent }]}>{sanitize(customSection.title || 'Custom Section')}</Text>}
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
