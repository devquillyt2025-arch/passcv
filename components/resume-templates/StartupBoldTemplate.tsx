import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 14 — STARTUP BOLD: huge orange name, thick orange rule, 40/60 two-column.
const sans = '"Helvetica Neue", Arial, sans-serif';
const ORANGE = '#f97316';

export default function StartupBoldTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const label: CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: ORANGE, margin: '0 0 9px' };

  return (
    <div style={{ fontFamily: sans, color: '#111', padding: '40px 46px', fontSize: 12.5, lineHeight: 1.5 }}>
      {/* Header */}
      <div style={{ borderBottom: `4px solid ${ORANGE}`, paddingBottom: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: ORANGE, margin: 0, lineHeight: 1 }}>{fullName(contact)}</h1>
          {contact.jobTitle && <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>{contact.jobTitle}</span>}
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>{contactItems(contact).join('   ·   ')}</div>
      </div>

      {data.summary && <p style={{ margin: '0 0 18px', color: '#333' }}>{data.summary}</p>}

      <div style={{ display: 'flex', gap: 30 }}>
        {/* Left 40% */}
        <div style={{ width: '40%' }}>
          {has(data.skills) && (
            <div style={{ marginBottom: 20 }}>
              <div style={label}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.skills.map((s) => (
                  <span key={s.id} style={{ fontSize: 11, background: '#fff7ed', color: '#9a3412', borderRadius: 4, padding: '3px 9px' }}>{s.name}</span>
                ))}
              </div>
            </div>
          )}
          {has(data.education) && (
            <div style={{ marginBottom: 20 }}>
              <div style={label}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{e.institution}</div>
                  <div style={{ fontSize: 10.5, color: '#999' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                </div>
              ))}
            </div>
          )}
          {has(data.projects) && (
            <div>
              <div style={label}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                  {p.url && <div style={{ fontSize: 10.5, color: ORANGE }}>{p.url}</div>}
                  <ul style={{ margin: '3px 0 0', paddingLeft: 15, color: '#444' }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 60% */}
        <div style={{ width: '60%' }}>
          {has(data.experience) && (
            <>
              <div style={label}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800 }}>{e.position}</span>
                    <span style={{ fontSize: 11, color: '#999' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: '#333' }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
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
