import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 1 — CLASSIC: single column, centered serif, all-caps ruled sections, no color.
const serif = 'Georgia, "Times New Roman", Times, serif';

export default function ClassicTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const sectionTitle: CSSProperties = {
    fontFamily: serif,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 700,
    color: '#111',
    borderTop: '1px solid #111',
    borderBottom: '1px solid #111',
    padding: '4px 0',
    margin: '18px 0 10px',
  };
  const role: CSSProperties = { fontSize: 13, fontWeight: 700, color: '#111' };
  const meta: CSSProperties = { fontSize: 12, color: '#333', fontStyle: 'italic' };

  return (
    <div style={{ fontFamily: serif, color: '#111', padding: '44px 56px', fontSize: 12.5, lineHeight: 1.5 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 400, letterSpacing: 1, margin: 0 }}>
          {fullName(contact)}
        </h1>
        {contact.jobTitle && <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>{contact.jobTitle}</div>}
        <div style={{ fontSize: 11.5, color: '#333', marginTop: 6 }}>{contactItems(contact).join('  |  ')}</div>
      </div>

      {data.summary && (
        <>
          <div style={sectionTitle}>Summary</div>
          <p style={{ margin: 0, textAlign: 'justify' }}>{data.summary}</p>
        </>
      )}

      {has(data.skills) && (
        <>
          <div style={sectionTitle}>Skills</div>
          <p style={{ margin: 0, textAlign: 'center' }}>{data.skills.map((s) => s.name).join(', ')}</p>
        </>
      )}

      {has(data.experience) && (
        <>
          <div style={sectionTitle}>Experience</div>
          {data.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={role}>{e.position}</span>
                <span style={meta}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
              </div>
              <div style={meta}>{[e.company, e.location].filter(Boolean).join(', ')}</div>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {has(data.projects) && (
        <>
          <div style={sectionTitle}>Projects</div>
          {data.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={role}>{p.name}</span>
                <span style={meta}>{range(p.startDate, p.endDate)}</span>
              </div>
              {p.url && <div style={{ fontSize: 11.5, color: '#444' }}>{p.url}</div>}
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {has(data.education) && (
        <>
          <div style={sectionTitle}>Education</div>
          {data.education.map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={role}>{degreeLine(e)}</span>
                <span style={meta}>{range(e.startDate, e.endDate, e.currentlyStudying)}</span>
              </div>
              <div style={meta}>{[e.institution, e.location, e.score && `GPA ${e.score}`].filter(Boolean).join(', ')}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
