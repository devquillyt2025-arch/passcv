import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, SHEET_H } from './shared';

// Template 4 — CREATIVE PURPLE: full-bleed purple header + light-purple/white two-column body.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';
const PURPLE = '#7c3aed';
const LIGHT = '#f5f3ff';

export default function CreativePurpleTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const colLabel: CSSProperties = {
    fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: PURPLE, margin: '0 0 9px',
  };

  return (
    <div style={{ fontFamily: sans, color: '#1f2937', minHeight: SHEET_H }}>
      {/* Header */}
      <div style={{ background: PURPLE, color: '#fff', padding: '30px 40px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
        {contact.jobTitle && <div style={{ fontSize: 14, color: '#ddd6fe', marginTop: 3 }}>{contact.jobTitle}</div>}
        <div style={{ fontSize: 11.5, color: '#ede9fe', marginTop: 10 }}>{contactItems(contact).join('   •   ')}</div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Left 38% */}
        <div style={{ width: '38%', background: LIGHT, padding: '26px 24px' }}>
          {data.summary && (
            <div style={{ marginBottom: 20 }}>
              <div style={colLabel}>About</div>
              <p style={{ margin: 0, fontSize: 12, color: '#4b5563', lineHeight: 1.55 }}>{data.summary}</p>
            </div>
          )}
          {has(data.skills) && (
            <div style={{ marginBottom: 20 }}>
              <div style={colLabel}>Skills</div>
              {data.skills.map((s, i) => {
                const pct = 95 - i * 6;
                return (
                  <div key={s.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11.5, marginBottom: 3 }}>{s.name}</div>
                    <div style={{ height: 6, background: '#e9d5ff', borderRadius: 3 }}>
                      <div style={{ width: `${Math.max(45, pct)}%`, height: '100%', background: PURPLE, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {has(data.education) && (
            <div>
              <div style={colLabel}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{e.institution}</div>
                  <div style={{ fontSize: 10.5, color: '#9ca3af' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 62% */}
        <div style={{ width: '62%', padding: '26px 28px', fontSize: 12.5, lineHeight: 1.5 }}>
          {has(data.experience) && (
            <>
              <div style={colLabel}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{e.position}</div>
                  <div style={{ fontSize: 12, color: PURPLE, fontWeight: 700 }}>{e.company}
                    <span style={{ color: '#9ca3af', fontWeight: 400 }}>{e.location ? `  ·  ${e.location}` : ''}  ·  {range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#374151' }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}
          {has(data.projects) && (
            <>
              <div style={{ ...colLabel, marginTop: 6 }}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 11 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} <span style={{ fontSize: 10.5, color: PURPLE, fontWeight: 400 }}>{p.url}</span></div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#374151' }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
