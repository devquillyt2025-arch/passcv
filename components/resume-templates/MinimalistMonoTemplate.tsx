import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 7 — MINIMALIST MONO: monospace, ultra-narrow, `// SECTION` titles, terminal feel.
const mono = '"Courier New", "SF Mono", Menlo, Consolas, monospace';

export default function MinimalistMonoTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const title: CSSProperties = { fontSize: 12, fontWeight: 700, color: '#111', margin: '20px 0 8px' };
  const rowBetween: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 };
  const muted: CSSProperties = { color: '#666' };

  return (
    <div style={{ fontFamily: mono, color: '#111', fontSize: 12, lineHeight: 1.55, padding: '48px 0' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 18, fontWeight: 400, margin: 0 }}>{fullName(contact)}</h1>
        {contact.jobTitle && <div style={{ ...muted, marginTop: 2 }}>{contact.jobTitle}</div>}
        <div style={{ ...muted, fontSize: 11, marginTop: 6 }}>{contactItems(contact).join('  ·  ')}</div>

        {data.summary && (
          <>
            <div style={title}>{'// summary'}</div>
            <p style={{ margin: 0 }}>{data.summary}</p>
          </>
        )}

        {has(data.skills) && (
          <>
            <div style={title}>{'// skills'}</div>
            <div>{data.skills.map((s) => s.name).join(', ')}</div>
          </>
        )}

        {has(data.experience) && (
          <>
            <div style={title}>{'// experience'}</div>
            {data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 12 }}>
                <div style={rowBetween}>
                  <span style={{ fontWeight: 700 }}>{e.position} @ {e.company}</span>
                  <span style={muted}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                </div>
                {e.location && <div style={{ ...muted, fontSize: 11 }}>{e.location}</div>}
                <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                  {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}

        {has(data.projects) && (
          <>
            <div style={title}>{'// projects'}</div>
            {data.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={rowBetween}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span style={muted}>{range(p.startDate, p.endDate)}</span>
                </div>
                {p.url && <div style={{ ...muted, fontSize: 11 }}>{p.url}</div>}
                <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                  {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}

        {has(data.education) && (
          <>
            <div style={title}>{'// education'}</div>
            {data.education.map((e) => (
              <div key={e.id} style={{ marginBottom: 6 }}>
                <div style={rowBetween}>
                  <span style={{ fontWeight: 700 }}>{degreeLine(e)}</span>
                  <span style={muted}>{range(e.startDate, e.endDate, e.currentlyStudying)}</span>
                </div>
                <div style={muted}>{[e.institution, e.score && `gpa ${e.score}`].filter(Boolean).join(' · ')}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
