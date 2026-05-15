import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/types';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf' },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-500-normal.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-normal.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-italic.ttf', fontStyle: 'italic' },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb', // blue-600
    paddingBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1e3a8a', // blue-900
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contact: {
    fontSize: 9,
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    color: '#6b7280', // gray-500
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2563eb',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  summary: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  item: {
    marginBottom: 10,
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  title: {
    fontWeight: 700,
    fontSize: 11,
    color: '#111827',
  },
  company: {
    fontStyle: 'italic',
    color: '#4b5563',
  },
  dateLocation: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletPoint: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 12,
    fontSize: 10,
    color: '#2563eb',
  },
  bulletText: {
    flex: 1,
  },
  skillsSection: {
    marginTop: 8,
  },
  skillGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});

interface ModernTemplateProps {
  data: ResumeData;
}

export default function ModernTemplate({ data }: ModernTemplateProps) {
  const { contact, summary, experience, education, skills, projects } = data;
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const contactDetails = [contact.email, contact.phone, contact.city, contact.linkedin].filter(Boolean).join('  •  ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          {fullName && <Text style={styles.name}>{fullName}</Text>}
          {contactDetails && <Text style={styles.contact}>{contactDetails}</Text>}
        </View>

        {/* Summary */}
        {summary && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, idx) => {
              const bullets = exp.description.split('\n').map(b => b.trim()).filter(Boolean).map(b => b.replace(/^[-•]\s*/, ''));
              return (
                <View key={idx} style={styles.item} wrap={false}>
                  <View style={styles.itemHeader}>
                    <View style={styles.titleWrapper}>
                      <Text style={styles.title}>{exp.position}</Text>
                      <Text style={styles.company}>| {exp.company}</Text>
                    </View>
                    <View style={styles.dateLocation}>
                      <Text>{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate} | {exp.location}</Text>
                    </View>
                  </View>
                  <View style={styles.bulletList}>
                    {bullets.map((bullet, bIdx) => (
                      <View key={bIdx} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.title}>{edu.degree} in {edu.field}</Text>
                    <Text style={styles.company}>| {edu.institution}</Text>
                  </View>
                  <View style={styles.dateLocation}>
                    <Text>{edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate} | {edu.location}</Text>
                  </View>
                </View>
                {edu.score && <Text>GPA/Score: {edu.score}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.title}>{proj.name}</Text>
                    {proj.url && <Text style={styles.company}>| {proj.url}</Text>}
                  </View>
                  <View style={styles.dateLocation}>
                    <Text>{proj.startDate} – {proj.endDate}</Text>
                  </View>
                </View>
                <Text style={styles.bulletText}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{skills.map(s => s.name).join('  •  ')}</Text>
          </View>
        )}
        
      </Page>
    </Document>
  );
}
