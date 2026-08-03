import type { CSSProperties } from 'react';
import { TemplateProps, contactItems, range, bullets, degreeLine, has, palette, colClear } from './shared';
import { FONTS } from './fonts';

// Template 5 — SWISS GRID: stacked giant name, 3-col grid, date-column experience.
const sans = FONTS.sans.stack;

export default function SwissGridTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const { contact } = data;
  // Crimson is this template's default only; the builder accent overrides it.
  const pal = palette(builderDesign, '#e11d48');
    const head: CSSProperties = {
    fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: pal.ink,
    borderBottom: `1.5px solid ${pal.accent}`, paddingBottom: 3, marginBottom: 9,
  };
  // Square-cornered tint blocks, not rounded chips — the grid identity stays brutalist,
  // it just stops reading as a wall of ragged text.
  const pill: CSSProperties = {
    display: 'inline-block',
    background: pal.accentTint,
    borderLeft: `2px solid ${pal.accentLine}`,
    padding: '2px 7px',
    marginRight: 4,
    marginBottom: 4,
    fontSize: 11,
    lineHeight: 1.35,
  };

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <div>
                <div style={head}>{customSection.title}</div>
                {customSection.items.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.url && <div style={{ color: pal.inkFaint, fontSize: 11 }}>{p.url}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id} data-section={id}><p style={{ margin: '14px 0 18px', maxWidth: '78%' }}>{data.summary}</p></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><div>
                <div style={head}>Skills</div>
                <div>{data.skills.map((s) => <span key={s.id} style={pill}>{s.name}</span>)}</div>
              </div></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
              <div style={head}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ display: 'flex', gap: 18, marginBottom: 13 }}>
                  <div style={{ width: 120, flexShrink: 0, textAlign: 'right', fontSize: 11, color: pal.inkFaint, paddingTop: 1 }}>
                    {range(e.startDate, e.endDate, e.currentlyWorking)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{e.position}</div>
                    <div style={{ color: pal.accentInk, fontWeight: 700, fontSize: 12 }}>{[e.company, e.location].filter(Boolean).join(', ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><div>
                <div style={head}>Education</div>
                {data.education.map((e) => (
                  <div key={e.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{degreeLine(e)}</div>
                    <div style={{ color: pal.inkMuted }}>{e.institution}</div>
                    <div style={{ color: pal.inkFaint, fontSize: 11 }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                  </div>
                ))}
              </div></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><div>
                <div style={head}>Projects</div>
                {data.projects.map((p) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.url && <div style={{ color: pal.inkFaint, fontSize: 11 }}>{p.url}</div>}
                  </div>
                ))}
              </div></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><div>
                <div style={head}>Certifications</div>
                {data.certifications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.credentialUrl && <div style={{ color: pal.inkFaint, fontSize: 11 }}>{p.credentialUrl}</div>}
                  </div>
                ))}
              </div></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><div>
                <div style={head}>Languages</div>
                <div>{data.languages.map((s) => <span key={s.id} style={pill}>{`${s.name} — ${s.proficiency}`}</span>)}</div>
              </div></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><div>
                <div style={head}>Awards</div>
                {data.awards.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.url && <div style={{ color: pal.inkFaint, fontSize: 11 }}>{p.url}</div>}
                  </div>
                ))}
              </div></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
              <div style={head}>Volunteer</div>
              {data.volunteer.map((e) => (
                <div key={e.id} style={{ display: 'flex', gap: 18, marginBottom: 13 }}>
                  <div style={{ width: 120, flexShrink: 0, textAlign: 'right', fontSize: 11, color: pal.inkFaint, paddingTop: 1 }}>
                    {range(e.startDate, e.endDate, e.currentlyVolunteering)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{e.role}</div>
                    <div style={{ color: pal.accentInk, fontWeight: 700, fontSize: 12 }}>{[e.organization, e.location].filter(Boolean).join(', ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><div>
                <div style={head}>Courses</div>
                {data.courses.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.certificateUrl && <div style={{ color: pal.inkFaint, fontSize: 11 }}>{p.certificateUrl}</div>}
                  </div>
                ))}
              </div></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><div>
                <div style={head}>Publications</div>
                {data.publications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    {p.url && <div style={{ color: pal.inkFaint, fontSize: 11 }}>{p.url}</div>}
                  </div>
                ))}
              </div></div>) : null;
          default: return null;
        }
      };
      const gridKeys = ['skills', 'education', 'languages'];


  return (
    <div style={{ fontFamily: sans, color: pal.ink, padding: '40px 46px', fontSize: 12, lineHeight: 1.5 }}>
      {/* gridKeys are the short list sections that fill the three columns. */}
            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `2px solid ${pal.accent}`, paddingBottom: 14 }}>
              <h1 style={{ fontSize: 50, fontWeight: 900, lineHeight: 0.92, margin: 0, letterSpacing: -1 }}>
                {contact.firstName || 'Your'}<br />{contact.lastName || 'Name'}
              </h1>
              <div style={{ textAlign: 'right', fontSize: 11, color: pal.inkMuted, maxWidth: 230 }}>
                {contact.jobTitle && <div style={{ fontWeight: 700, color: pal.accentInk, marginBottom: 4 }}>{contact.jobTitle}</div>}
                {contactItems(contact).map((c, i) => <div key={i}>{c}</div>)}
              </div>
            </div>

            {order.filter((id) => id === 'summary').map(renderSection)}

            {/* 3 columns of short, list-shaped sections. Floated via
                data-colrow, not grid: a grid container cannot be split across
                printed pages. See sheetStyles.ts. */}
            <div data-colrow="3" style={{ marginBottom: 20, ['--colrow-gap' as string]: '22px' }}>
              {order.filter((id) => gridKeys.includes(id)).map(renderSection)}
            </div>
            <div style={colClear} />

            {/* Date-aligned experience and the rest, full measure */}
            {order.filter((id) => id !== 'summary' && !gridKeys.includes(id)).map(renderSection)}
      </div>
  );
}
