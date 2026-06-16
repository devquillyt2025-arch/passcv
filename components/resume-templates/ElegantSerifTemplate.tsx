import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 13 — ELEGANT SERIF: centered italic name, small-caps ornamental sections, burgundy.
const serif = 'Georgia, "Playfair Display", "Times New Roman", serif';
const BURGUNDY = '#7f1d1d';

function Ornament({ title }: { title: string }) {
  const line: CSSProperties = { flex: 1, height: 1, background: '#d6c3c3' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 11px' }}>
      <span style={line} />
      <span style={{ fontVariant: 'small-caps', fontSize: 15, letterSpacing: 2, color: BURGUNDY, fontWeight: 700 }}>{title}</span>
      <span style={line} />
    </div>
  );
}

export default function ElegantSerifTemplate({ data }: TemplateProps) {
  const { contact } = data;

  return (
    <div style={{ fontFamily: serif, color: '#2b2b2b', padding: '50px 64px', fontSize: 12.5, lineHeight: 1.6 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontStyle: 'italic', letterSpacing: 2, color: BURGUNDY, margin: 0, fontWeight: 500 }}>
          {fullName(contact)}
        </h1>
        {contact.jobTitle && <div style={{ fontSize: 13, fontStyle: 'italic', color: '#555', marginTop: 4 }}>{contact.jobTitle}</div>}
        <div style={{ fontSize: 11.5, color: '#777', marginTop: 8 }}>{contactItems(contact).join('  —  ')}</div>
      </div>

      {data.summary && (
        <>
          <Ornament title="Profile" />
          <p style={{ margin: 0, textAlign: 'center', fontStyle: 'italic', color: '#444' }}>{data.summary}</p>
        </>
      )}

      {has(data.experience) && (
        <>
          <Ornament title="Experience" />
          {data.experience.map((e) => (
            <div key={e.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700 }}>{e.company}</span>
                <span style={{ fontSize: 11.5, fontStyle: 'italic', color: '#777' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#555' }}>{[e.position, e.location].filter(Boolean).join(', ')}</div>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {has(data.education) && (
        <>
          <Ornament title="Education" />
          {data.education.map((e) => (
            <div key={e.id} style={{ marginBottom: 7, textAlign: 'center' }}>
              <div style={{ fontWeight: 700 }}>{degreeLine(e)}</div>
              <div style={{ fontStyle: 'italic', color: '#555' }}>{[e.institution, e.location].filter(Boolean).join(', ')} · {range(e.startDate, e.endDate, e.currentlyStudying)}</div>
            </div>
          ))}
        </>
      )}

      {has(data.projects) && (
        <>
          <Ornament title="Projects" />
          {data.projects.map((p) => (
            <div key={p.id} style={{ marginBottom: 9 }}>
              <div style={{ fontWeight: 700 }}>{p.name}{p.url ? <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#777' }}> — {p.url}</span> : null}</div>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {has(data.skills) && (
        <>
          <Ornament title="Skills" />
          <p style={{ margin: 0, textAlign: 'center', fontStyle: 'italic' }}>{data.skills.map((s) => s.name).join(',  ')}</p>
        </>
      )}
    </div>
  );
}
