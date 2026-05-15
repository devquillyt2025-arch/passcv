import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/types';

// Register fonts
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-normal.ttf' },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-normal.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-italic.ttf', fontStyle: 'italic' },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    fontSize: 11,
    color: '#000000',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contact: {
    fontSize: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 8,
    marginTop: 12,
  },
  summary: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  item: {
    marginBottom: 8,
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
  },
  title: {
    fontWeight: 700,
    fontSize: 11,
  },
  company: {
    fontStyle: 'italic',
  },
  dateLocation: {
    fontSize: 10,
    textAlign: 'right',
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
  },
  bulletText: {
    flex: 1,
  },
  skillsSection: {
    marginTop: 5,
  },
  skillGroup: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});

interface ClassicTemplateProps {
  data: ResumeData;
}

export default function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { contact, summary, experience, education, skills, projects } = data;
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const contactDetails = [contact.email, contact.phone, contact.city, contact.linkedin].filter(Boolean).join(' | ');

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
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{skills.map(s => s.name).join(', ')}</Text>
          </View>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp, idx) => {
              const bullets = exp.description.split('\n').map(b => b.trim()).filter(Boolean).map(b => b.replace(/^[-•]\s*/, ''));
              return (
                <View key={idx} style={styles.item} wrap={false}>
                  <View style={styles.itemHeader}>
                    <View style={styles.titleWrapper}>
                      <Text style={styles.title}>{exp.position}</Text>
                      <Text style={styles.company}>{exp.company}</Text>
                    </View>
                    <View style={styles.dateLocation}>
                      <Text>{exp.location}</Text>
                      <Text>{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</Text>
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.title}>{proj.name}</Text>
                    {proj.url && <Text style={styles.company}>{proj.url}</Text>}
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

        {/* Education */}
        {education && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.title}>{edu.degree} in {edu.field}</Text>
                    <Text style={styles.company}>{edu.institution}</Text>
                  </View>
                  <View style={styles.dateLocation}>
                    <Text>{edu.location}</Text>
                    <Text>{edu.startDate} – {edu.currentlyStudying ? 'Present' : edu.endDate}</Text>
                  </View>
                </View>
                {edu.score && <Text>GPA/Score: {edu.score}</Text>}
              </View>
            ))}
          </View>
        )}
        
      </Page>
    </Document>
  );
}
