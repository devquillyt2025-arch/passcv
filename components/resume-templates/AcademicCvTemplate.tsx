import type { CSSProperties } from 'react';
import { TemplateProps, fullName, range, bullets, degreeLine, has } from './shared';

// Template 15 — ACADEMIC / CV: long-form, full-width ruled sections, hanging-indent entries.
const serif = 'Georgia, "Times New Roman", Times, serif';

const hang: CSSProperties = { paddingLeft: '1.5rem', textIndent: '-1.5rem', marginBottom: 7 };

export default function AcademicCvTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const sectionTitle: CSSProperties = {
    fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
    borderBottom: '1px solid #000', paddingBottom: 3, margin: '18px 0 9px',
  };

  return (
    <div style={{ fontFamily: serif, color: '#111', padding: '44px 56px', fontSize: 12, lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{fullName(contact)}</h1>
      {contact.jobTitle && <div style={{ fontSize: 13, color: '#333' }}>{contact.jobTitle}</div>}
      <div style={{ fontSize: 11.5, color: '#444', marginTop: 8 }}>
        {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.website].filter(Boolean).map((c, i) => (
          <div key={i}>{c}</div>
        ))}
      </div>

      {data.summary && (
        <>
          <div style={sectionTitle}>Research Interests</div>
          <p style={{ margin: 0, textAlign: 'justify' }}>{data.summary}</p>
        </>
      )}

      {has(data.education) && (
        <>
          <div style={sectionTitle}>Education</div>
          {data.education.map((e) => (
            <div key={e.id} style={hang}>
              <strong>{degreeLine(e)}</strong>, {e.institution}{e.location ? `, ${e.location}` : ''}. {range(e.startDate, e.endDate, e.currentlyStudying)}{e.score ? ` (GPA ${e.score})` : ''}
            </div>
          ))}
        </>
      )}

      {has(data.publications) && (
        <>
          <div style={sectionTitle}>Publications</div>
          {data.publications!.map((p) => (
            <div key={p.id} style={hang}>
              {p.coAuthors ? `${p.coAuthors}. ` : ''}&ldquo;{p.title}.&rdquo; <em>{p.publisher}</em>{p.date ? `, ${p.date}` : ''}.{p.url ? ` ${p.url}` : ''}
            </div>
          ))}
        </>
      )}

      {has(data.experience) && (
        <>
          <div style={sectionTitle}>Work Experience</div>
          {data.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span><strong>{e.position}</strong>, {e.company}</span>
                <span style={{ fontStyle: 'italic', color: '#555', fontSize: 11.5 }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
              </div>
              <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {has(data.courses) && (
        <>
          <div style={sectionTitle}>Teaching &amp; Courses</div>
          {data.courses!.map((c) => (
            <div key={c.id} style={hang}>
              <strong>{c.name}</strong>{c.platform ? `, ${c.platform}` : ''}{c.completionDate ? `. ${c.completionDate}` : ''}
            </div>
          ))}
        </>
      )}

      {has(data.awards) && (
        <>
          <div style={sectionTitle}>Awards &amp; Honors</div>
          {data.awards!.map((a) => (
            <div key={a.id} style={hang}>
              <strong>{a.name}</strong>{a.issuer ? `, ${a.issuer}` : ''}{a.date ? ` (${a.date})` : ''}{a.description ? `. ${a.description}` : ''}
            </div>
          ))}
        </>
      )}

      {has(data.skills) && (
        <>
          <div style={sectionTitle}>Technical Skills</div>
          <p style={{ margin: 0 }}>{data.skills.map((s) => s.name).join(', ')}</p>
        </>
      )}
    </div>
  );
}
