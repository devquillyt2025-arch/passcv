import type { CSSProperties } from 'react';
import { TemplateProps, fullName, initials, range, bullets, degreeLine, has, SHEET_H } from './shared';

// Template 2 — SIDEBAR DARK: 30% navy sidebar + 70% white content.
const sans = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
const NAVY = '#1e293b';
const BLUE = '#60a5fa';

export default function SidebarDarkTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const sideLabel: CSSProperties = {
    color: BLUE, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
    margin: '18px 0 7px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4,
  };
  const mainLabel: CSSProperties = {
    color: NAVY, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
    borderBottom: `2px solid ${NAVY}`, paddingBottom: 3, margin: '18px 0 9px',
  };

  return (
    <div style={{ display: 'flex', fontFamily: sans, minHeight: SHEET_H, color: '#111' }}>
      {/* Sidebar */}
      <div style={{ width: '32%', background: NAVY, color: '#e2e8f0', padding: '34px 22px' }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%', background: BLUE, color: NAVY,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800,
          margin: '0 auto 14px',
        }}>{initials(contact)}</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', textAlign: 'center', margin: 0, lineHeight: 1.2 }}>
          {fullName(contact)}
        </h1>
        {contact.jobTitle && <div style={{ textAlign: 'center', color: BLUE, fontSize: 12, marginTop: 4 }}>{contact.jobTitle}</div>}

        <div style={sideLabel}>Contact</div>
        {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.github, contact.website].filter(Boolean).map((c, i) => (
          <div key={i} style={{ fontSize: 11, marginBottom: 5, wordBreak: 'break-word' }}>{c}</div>
        ))}

        {has(data.skills) && (
          <>
            <div style={sideLabel}>Skills</div>
            {data.skills.map((s) => <div key={s.id} style={{ fontSize: 11.5, marginBottom: 5 }}>{s.name}</div>)}
          </>
        )}

        {has(data.education) && (
          <>
            <div style={sideLabel}>Education</div>
            {data.education.map((e) => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>{degreeLine(e)}</div>
                <div style={{ fontSize: 10.5 }}>{e.institution}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Main */}
      <div style={{ width: '68%', padding: '34px 30px', fontSize: 12.5, lineHeight: 1.5 }}>
        {data.summary && (
          <>
            <div style={mainLabel}>Profile</div>
            <p style={{ margin: 0, color: '#334155' }}>{data.summary}</p>
          </>
        )}
        {has(data.experience) && (
          <>
            <div style={mainLabel}>Experience</div>
            {data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{e.position}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#334155' }}>
                  {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}
        {has(data.projects) && (
          <>
            <div style={mainLabel}>Projects</div>
            {data.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{range(p.startDate, p.endDate)}</span>
                </div>
                {p.url && <div style={{ fontSize: 11, color: '#2563eb' }}>{p.url}</div>}
                <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#334155' }}>
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
