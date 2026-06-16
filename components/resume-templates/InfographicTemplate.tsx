import type { CSSProperties } from 'react';
import { TemplateProps, fullName, initials, range, bullets, degreeLine, has, SHEET_H } from './shared';

// Template 6 — INFOGRAPHIC: avatar header, dot proficiency meters, sky-blue accents, two-column.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';
const SKY = '#0ea5e9';

function Dots({ filled }: { filled: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < filled ? SKY : '#cbd5e1' }} />
      ))}
    </span>
  );
}

export default function InfographicTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const label: CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: SKY, margin: '0 0 9px' };

  return (
    <div style={{ fontFamily: sans, color: '#1f2937', minHeight: SHEET_H }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '28px 36px 22px', borderBottom: `3px solid ${SKY}` }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: SKY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
          {initials(contact)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
          {contact.jobTitle && <div style={{ fontSize: 13, color: '#0284c7', fontWeight: 600 }}>{contact.jobTitle}</div>}
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
            {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.github].filter(Boolean).join('   ·   ')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Left */}
        <div style={{ width: '35%', background: '#f8fafc', padding: '24px 22px' }}>
          {has(data.skills) && (
            <div style={{ marginBottom: 20 }}>
              <div style={label}>Skills</div>
              {data.skills.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 11.5 }}>{s.name}</span>
                  <Dots filled={Math.max(3, 5 - (i % 3))} />
                </div>
              ))}
            </div>
          )}
          {has(data.education) && (
            <div>
              <div style={label}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{e.institution}</div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ width: '65%', padding: '24px 26px', fontSize: 12.5, lineHeight: 1.5 }}>
          {data.summary && (
            <div style={{ marginBottom: 16 }}>
              <div style={label}>Profile</div>
              <p style={{ margin: 0, color: '#475569' }}>{data.summary}</p>
            </div>
          )}
          {has(data.experience) && (
            <>
              <div style={label}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{e.position}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: SKY, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#475569' }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
          )}
          {has(data.projects) && (
            <>
              <div style={{ ...label, marginTop: 4 }}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                  {p.url && <div style={{ fontSize: 11, color: SKY }}>{p.url}</div>}
                  <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: '#475569' }}>
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
