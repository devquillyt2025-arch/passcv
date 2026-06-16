import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has } from './shared';

// Template 8 — MAGAZINE SPREAD: black top strip, huge display name, 3-col grid + "by the numbers".
const sans = '"Helvetica Neue", Arial, sans-serif';

function groupSkills(skills: { name: string }[]) {
  // Light heuristic grouping just for visual structure in the preview.
  const groups: Record<string, string[]> = { Frontend: [], Backend: [], 'Cloud & Tools': [] };
  const be = /node|python|sql|postgres|redis|graphql|java|go|rust|api|django/i;
  const cloud = /aws|gcp|azure|docker|kubernetes|terraform|ci|cd|grafana/i;
  skills.forEach((s) => {
    if (cloud.test(s.name)) groups['Cloud & Tools'].push(s.name);
    else if (be.test(s.name)) groups.Backend.push(s.name);
    else groups.Frontend.push(s.name);
  });
  return Object.entries(groups).filter(([, v]) => v.length > 0);
}

export default function MagazineSpreadTemplate({ data }: TemplateProps) {
  const { contact } = data;
  const col: CSSProperties = { padding: '0 16px' };
  const label: CSSProperties = { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#111', margin: '0 0 8px', borderBottom: '2px solid #111', paddingBottom: 3 };
  const divider = '1px solid #ddd';

  return (
    <div style={{ fontFamily: sans, color: '#111' }}>
      <div style={{ height: 40, background: '#111' }} />
      <div style={{ padding: '20px 36px 36px' }}>
        <h1 style={{ fontSize: 60, fontWeight: 800, lineHeight: 0.95, margin: 0, letterSpacing: -1.5 }}>{fullName(contact)}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, flexWrap: 'wrap', gap: 6 }}>
          {contact.jobTitle && <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{contact.jobTitle}</span>}
          <span style={{ fontSize: 11, color: '#666' }}>{contactItems(contact).join('  ·  ')}</span>
        </div>

        {data.summary && <p style={{ fontSize: 13, color: '#333', margin: '16px 0 22px', columnCount: 2, columnGap: 28 }}>{data.summary}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '25% 45% 30%', fontSize: 12, lineHeight: 1.5 }}>
          {/* Col 1 — skills by group */}
          <div style={{ ...col, paddingLeft: 0, borderRight: divider }}>
            {has(data.skills) && (
              <>
                <div style={label}>Skills</div>
                {groupSkills(data.skills).map(([g, items]) => (
                  <div key={g} style={{ marginBottom: 11 }}>
                    <div style={{ fontWeight: 800, fontSize: 11, marginBottom: 2 }}>{g}</div>
                    <div style={{ color: '#444' }}>{items.join(', ')}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Col 2 — experience */}
          <div style={{ ...col, borderRight: divider }}>
            {has(data.experience) && (
              <>
                <div style={label}>Experience</div>
                {data.experience.map((e) => (
                  <div key={e.id} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 12.5 }}>{e.position}</div>
                    <div style={{ fontSize: 11.5, color: '#666' }}>{[e.company, e.location].filter(Boolean).join(' · ')} · {range(e.startDate, e.endDate, e.currentlyWorking)}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 15, color: '#333' }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Col 3 — education, projects, numbers */}
          <div style={col}>
            {has(data.education) && (
              <>
                <div style={label}>Education</div>
                {data.education.map((e) => (
                  <div key={e.id} style={{ marginBottom: 9 }}>
                    <div style={{ fontWeight: 800, fontSize: 11.5 }}>{degreeLine(e)}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{e.institution}</div>
                    <div style={{ fontSize: 10.5, color: '#888' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                  </div>
                ))}
              </>
            )}
            {has(data.projects) && (
              <>
                <div style={{ ...label, marginTop: 12 }}>Projects</div>
                {data.projects.map((p) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 11.5 }}>{p.name}</div>
                    {p.url && <div style={{ fontSize: 10.5, color: '#888' }}>{p.url}</div>}
                  </div>
                ))}
              </>
            )}
            <div style={{ ...label, marginTop: 12 }}>By the numbers</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                [`${data.experience?.length || 0}`, 'Roles'],
                [`${data.projects?.length || 0}`, 'Projects'],
                [`${data.skills?.length || 0}`, 'Skills'],
                [`${data.education?.length || 0}`, 'Degrees'],
              ].map(([n, l]) => (
                <div key={l} style={{ border: '1px solid #ddd', padding: '6px 8px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{n}</div>
                  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
