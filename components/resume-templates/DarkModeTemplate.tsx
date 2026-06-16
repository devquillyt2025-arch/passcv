import type { CSSProperties } from 'react';
import { TemplateProps, fullName, initials, range, bullets, degreeLine, has, SHEET_H } from './shared';

// Template 12 — DARK MODE: full dark background, 35/65 two-column, teal accents.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';
const BG = '#0f172a';
const PANEL = '#1e293b';
const TEAL = '#14b8a6';

export default function DarkModeTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const label: CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: TEAL, margin: '18px 0 8px' };

  return (
    <div style={{ display: 'flex', fontFamily: sans, background: BG, color: '#e2e8f0', minHeight: SHEET_H }}>
      {/* Sidebar */}
      <div style={{ width: '35%', background: PANEL, padding: '32px 22px' }}>
        <div style={{ width: 70, height: 70, borderRadius: 12, background: TEAL, color: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {initials(contact)}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Contact</div>
        {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.github, contact.website].filter(Boolean).map((c, i) => (
          <div key={i} style={{ fontSize: 11, marginTop: 5, wordBreak: 'break-word', color: '#cbd5e1' }}>{c}</div>
        ))}

        {has(data.skills) && (
          <>
            <div style={label}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {data.skills.map((s) => (
                <span key={s.id} style={{ fontSize: 10.5, border: `1px solid ${TEAL}`, color: TEAL, borderRadius: 4, padding: '2px 7px' }}>{s.name}</span>
              ))}
            </div>
          </>
        )}

        {has(data.education) && (
          <>
            <div style={label}>Education</div>
            {data.education.map((e) => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#f1f5f9' }}>{degreeLine(e)}</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{e.institution}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Main */}
      <div style={{ width: '65%', padding: '32px 28px', fontSize: 12.5, lineHeight: 1.55 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>{fullName(contact)}</h1>
        {contact.jobTitle && <div style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>{contact.jobTitle}</div>}

        {data.summary && <p style={{ margin: '12px 0 0', color: '#cbd5e1' }}>{data.summary}</p>}

        {has(data.experience) && (
          <>
            <div style={label}>Experience</div>
            {data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{e.position}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                </div>
                <div style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#cbd5e1' }}>
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
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#f1f5f9' }}>{p.name}</div>
                {p.url && <div style={{ fontSize: 11, color: TEAL }}>{p.url}</div>}
                <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: '#cbd5e1' }}>
                  {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
