import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 9 — CARD STACK: single column, each entry a bordered card, warm amber accent.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';
const AMBER = '#f59e0b';

export default function CardStackTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const label: CSSProperties = {
    fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#92400e',
    borderBottom: `2px solid ${AMBER}`, display: 'inline-block', paddingBottom: 2, margin: '20px 0 10px',
  };
  const card: CSSProperties = {
    border: '1px solid #ececec', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '12px 14px', marginBottom: 10, background: '#fff',
  };

  return (
    <div style={{ fontFamily: sans, color: '#1f2937', padding: '36px 40px', fontSize: 12.5, lineHeight: 1.5 }}>
      <div style={{ borderLeft: `4px solid ${AMBER}`, paddingLeft: 14, marginBottom: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
        {contact.jobTitle && <div style={{ fontSize: 13, color: '#6b7280' }}>{contact.jobTitle}</div>}
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>{contactItems(contact).join('  ·  ')}</div>
      </div>

      {data.summary && <p style={{ margin: '12px 0 0', color: '#4b5563' }}>{data.summary}</p>}

      {has(data.skills) && (
        <>
          <div style={label}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.skills.map((s) => (
              <span key={s.id} style={{ fontSize: 11, border: `1px solid ${AMBER}`, color: '#92400e', borderRadius: 999, padding: '3px 10px' }}>{s.name}</span>
            ))}
          </div>
        </>
      )}

      {has(data.experience) && (
        <>
          <div style={label}>Experience</div>
          {data.experience.map((e) => (
            <div key={e.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{e.position}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
              </div>
              <div style={{ fontSize: 12, color: AMBER, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
              <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: '#4b5563' }}>
                {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {has(data.projects) && (
        <>
          <div style={label}>Projects</div>
          {data.projects.map((p) => (
            <div key={p.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{range(p.startDate, p.endDate)}</span>
              </div>
              {p.url && <div style={{ fontSize: 11, color: AMBER }}>{p.url}</div>}
              <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: '#4b5563' }}>
                {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {has(data.education) && (
        <>
          <div style={label}>Education</div>
          {data.education.map((e) => (
            <div key={e.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{degreeLine(e)}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#6b7280' }}>{[e.institution, e.location, e.score && `GPA ${e.score}`].filter(Boolean).join(' · ')}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
