import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 10 — TIMELINE LEFT: vertical timeline with dots for experience, indigo accents.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';
const INDIGO = '#6366f1';

export default function TimelineLeftTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const label: CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: INDIGO, margin: '0 0 9px' };

  return (
    <div style={{ fontFamily: sans, color: '#1f2937', padding: '36px 44px', fontSize: 12.5, lineHeight: 1.5 }}>
      <div style={{ marginBottom: 6 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
        {contact.jobTitle && <div style={{ fontSize: 13, color: '#6b7280' }}>{contact.jobTitle}</div>}
        <div style={{ height: 3, width: 64, background: INDIGO, margin: '8px 0' }} />
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{contactItems(contact).join('  ·  ')}</div>
      </div>

      {data.summary && <p style={{ margin: '10px 0 18px', color: '#4b5563' }}>{data.summary}</p>}

      {/* Skills + Education grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 20 }}>
        {has(data.skills) && (
          <div>
            <div style={label}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {data.skills.map((s) => (
                <span key={s.id} style={{ fontSize: 11, background: '#eef2ff', color: '#4338ca', borderRadius: 4, padding: '2px 8px' }}>{s.name}</span>
              ))}
            </div>
          </div>
        )}
        {has(data.education) && (
          <div>
            <div style={label}>Education</div>
            {data.education.map((e) => (
              <div key={e.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{e.institution}</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline experience */}
      {has(data.experience) && (
        <>
          <div style={label}>Career Timeline</div>
          <div style={{ position: 'relative', borderLeft: `2px solid ${INDIGO}`, marginLeft: 5, paddingLeft: 22 }}>
            {data.experience.map((e) => (
              <div key={e.id} style={{ position: 'relative', marginBottom: 16 }}>
                <span style={{ position: 'absolute', left: -29, top: 3, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: `3px solid ${INDIGO}` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{e.position}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                </div>
                <div style={{ fontSize: 12, color: INDIGO, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#475569' }}>
                  {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      {has(data.projects) && (
        <>
          <div style={{ ...label, marginTop: 18 }}>Projects</div>
          {data.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} {p.url && <span style={{ fontSize: 10.5, color: INDIGO, fontWeight: 400 }}>· {p.url}</span>}</div>
              <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: '#475569' }}>
                {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
