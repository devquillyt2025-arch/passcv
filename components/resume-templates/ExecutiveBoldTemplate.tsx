import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 3 — EXECUTIVE BOLD: massive all-caps name, 35/65 two-column, timeline dots.
const sans = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
const body = '"Helvetica Neue", Arial, sans-serif';

export default function ExecutiveBoldTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const leftLabel: CSSProperties = {
    fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: '#111', margin: '0 0 8px',
  };
  const rightLabel: CSSProperties = { ...leftLabel, margin: '0 0 12px' };

  return (
    <div style={{ fontFamily: body, color: '#1a1a1a', padding: '40px 48px', fontSize: 12.5, lineHeight: 1.5 }}>
      {/* Name block */}
      <div style={{ borderBottom: '3px solid #111', paddingBottom: 12, marginBottom: 16 }}>
        <h1 style={{ fontFamily: sans, fontSize: 50, fontWeight: 900, letterSpacing: -2, textTransform: 'uppercase', margin: 0, lineHeight: 0.95 }}>
          {fullName(contact)}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, flexWrap: 'wrap', gap: 6 }}>
          {contact.jobTitle && <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#444' }}>{contact.jobTitle}</span>}
          <span style={{ fontSize: 11, color: '#555' }}>{contactItems(contact).join('  ·  ')}</span>
        </div>
      </div>

      {data.summary && <p style={{ margin: '0 0 16px', color: '#333' }}>{data.summary}</p>}

      <div style={{ display: 'flex', gap: 28 }}>
        {/* Left 35% */}
        <div style={{ width: '35%' }}>
          {has(data.skills) && (
            <div style={{ marginBottom: 20 }}>
              <div style={leftLabel}>Expertise</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {data.skills.map((s) => (
                  <span key={s.id} style={{ fontSize: 11, border: '1.5px solid #111', borderRadius: 3, padding: '2px 7px' }}>{s.name}</span>
                ))}
              </div>
            </div>
          )}
          {has(data.education) && (
            <div style={{ marginBottom: 20 }}>
              <div style={leftLabel}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{degreeLine(e)}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{e.institution}</div>
                  <div style={{ fontSize: 10.5, color: '#777' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}{e.score ? ` · GPA ${e.score}` : ''}</div>
                </div>
              ))}
            </div>
          )}
          {has(data.projects) && (
            <div>
              <div style={leftLabel}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                  {p.url && <div style={{ fontSize: 10.5, color: '#777' }}>{p.url}</div>}
                  <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 65% — experience with timeline dots */}
        <div style={{ width: '65%' }}>
          {has(data.experience) && (
            <>
              <div style={rightLabel}>Experience</div>
              <div style={{ position: 'relative', paddingLeft: 18, borderLeft: '2px solid #ddd' }}>
                {data.experience.map((e) => (
                  <div key={e.id} style={{ position: 'relative', marginBottom: 16 }}>
                    <span style={{ position: 'absolute', left: -25, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#111' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800 }}>{e.position}</span>
                      <span style={{ fontSize: 11, color: '#777' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#444' }}>{[e.company, e.location].filter(Boolean).join(' — ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, color: '#333' }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
