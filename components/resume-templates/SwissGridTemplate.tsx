import type { CSSProperties } from 'react';
import { TemplateProps, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 5 — SWISS GRID: stacked giant name, 3-col grid, date-column experience, crimson accents.
const sans = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const RED = '#e11d48';

export default function SwissGridTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const head: CSSProperties = {
    fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#111',
    borderBottom: `1.5px solid ${RED}`, paddingBottom: 3, marginBottom: 9,
  };

  return (
    <div style={{ fontFamily: sans, color: '#111', padding: '40px 46px', fontSize: 12, lineHeight: 1.5 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid #111', paddingBottom: 14 }}>
        <h1 style={{ fontSize: 50, fontWeight: 900, lineHeight: 0.92, margin: 0, letterSpacing: -1 }}>
          {contact.firstName || 'Your'}<br />{contact.lastName || 'Name'}
        </h1>
        <div style={{ textAlign: 'right', fontSize: 11, color: '#444', maxWidth: 230 }}>
          {contact.jobTitle && <div style={{ fontWeight: 700, color: RED, marginBottom: 4 }}>{contact.jobTitle}</div>}
          {contactItems(contact).map((c, i) => <div key={i}>{c}</div>)}
        </div>
      </div>

      {data.summary && <p style={{ margin: '14px 0 18px', maxWidth: '78%' }}>{data.summary}</p>}

      {/* 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginBottom: 20 }}>
        {has(data.skills) && (
          <div>
            <div style={head}>Skills</div>
            {data.skills.map((s) => <div key={s.id} style={{ marginBottom: 3 }}>{s.name}</div>)}
          </div>
        )}
        {has(data.education) && (
          <div>
            <div style={head}>Education</div>
            {data.education.map((e) => (
              <div key={e.id} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{degreeLine(e)}</div>
                <div style={{ color: '#555' }}>{e.institution}</div>
                <div style={{ color: '#888', fontSize: 11 }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
              </div>
            ))}
          </div>
        )}
        {has(data.projects) && (
          <div>
            <div style={head}>Projects</div>
            {data.projects.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                {p.url && <div style={{ color: '#888', fontSize: 11 }}>{p.url}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date-aligned experience */}
      {has(data.experience) && (
        <>
          <div style={head}>Experience</div>
          {data.experience.map((e) => (
            <div key={e.id} style={{ display: 'flex', gap: 18, marginBottom: 13 }}>
              <div style={{ width: 120, flexShrink: 0, textAlign: 'right', fontSize: 11, color: '#888', paddingTop: 1 }}>
                {range(e.startDate, e.endDate, e.currentlyWorking)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{e.position}</div>
                <div style={{ color: RED, fontWeight: 700, fontSize: 12 }}>{[e.company, e.location].filter(Boolean).join(', ')}</div>
                <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                  {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
