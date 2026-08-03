import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette, colRow, colCell, colClear } from './shared';
import { FONTS } from './fonts';

// Template 8 — MAGAZINE SPREAD: black top strip, huge display name, 3-col grid + "by the numbers".
const sans = FONTS.sans.stack;

/**
 * Split skills into columns purely for visual rhythm. Anything we cannot
 * confidently classify goes to a neutral bucket — the old version had no
 * frontend pattern at all and swept every unmatched skill into "Frontend",
 * which mislabels most non-web resumes on a document the user sends out.
 */
function groupSkills(skills: { name: string }[]) {
  const groups: Record<string, string[]> = { Frontend: [], Backend: [], 'Cloud & Tools': [], Other: [] };
  const fe = /react|vue|angular|svelte|css|sass|tailwind|html|next\.?js|frontend|ui|ux|figma/i;
  const be = /node|python|sql|postgres|redis|graphql|java|go\b|rust|api|django|kafka|grpc|rails|\.net/i;
  const cloud = /aws|gcp|azure|docker|kubernetes|terraform|ci|cd|grafana|observability|linux|ansible/i;
  skills.forEach((s) => {
    if (cloud.test(s.name)) groups['Cloud & Tools'].push(s.name);
    else if (fe.test(s.name)) groups.Frontend.push(s.name);
    else if (be.test(s.name)) groups.Backend.push(s.name);
    else groups.Other.push(s.name);
  });
  return Object.entries(groups).filter(([, v]) => v.length > 0);
}

export default function MagazineSpreadTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#1f2937');
  const { contact } = data;
  const col: CSSProperties = { padding: '0 16px' };
  const label: CSSProperties = { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: pal.accentInk, margin: '0 0 8px', borderBottom: `2px solid ${pal.accentLine}`, paddingBottom: 3 };
  const divider = `1px solid ${pal.rule}`;

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <>
                    <div style={{ ...label, marginTop: 12 }}>{customSection.title}</div>
                    {customSection.items.map((p: any) => (
                      <div key={p.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{p.name}</div>
                        {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      </div>
                    ))}
                  </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id} data-section={id}><p style={{ fontSize: 13, color: pal.inkMuted, margin: '16px 0 22px', columnCount: 2, columnGap: 28 }}>{data.summary}</p></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><>
                    <div style={label}>Skills</div>
                    {groupSkills(data.skills).map(([g, items]) => (
                      <div key={g} style={{ marginBottom: 11 }}>
                        <div style={{ fontWeight: 800, fontSize: 11, marginBottom: 2 }}>{g}</div>
                        <div style={{ color: pal.inkMuted }}>{items.join(', ')}</div>
                      </div>
                    ))}
                  </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
                    <div style={label}>Experience</div>
                    {data.experience.map((e) => (
                      <div key={e.id} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: 12.5 }}>{e.position}</div>
                        <div style={{ fontSize: 11.5, color: pal.inkFaint }}>{[e.company, e.location].filter(Boolean).join(' · ')} · {range(e.startDate, e.endDate, e.currentlyWorking)}</div>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                          {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><>
                    <div style={label}>Education</div>
                    {data.education.map((e) => (
                      <div key={e.id} style={{ marginBottom: 9 }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{degreeLine(e)}</div>
                        <div style={{ fontSize: 11, color: pal.inkFaint }}>{e.institution}</div>
                        <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                      </div>
                    ))}
                  </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
                    <div style={{ ...label, marginTop: 12 }}>Projects</div>
                    {data.projects.map((p) => (
                      <div key={p.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{p.name}</div>
                        {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      </div>
                    ))}
                  </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><>
                    <div style={{ ...label, marginTop: 12 }}>Certifications</div>
                    {data.certifications.map((p: any) => (
                      <div key={p.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{p.name}</div>
                        {p.credentialUrl && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.credentialUrl}</div>}
                      </div>
                    ))}
                  </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><>
                    <div style={{ ...label, marginTop: 12 }}>Languages</div>
                    {data.languages.map((l) => (
                      <div key={l.id} style={{ marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 11 }}>{l.name}</div>
                        <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{l.proficiency}</div>
                      </div>
                    ))}
                  </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
                    <div style={{ ...label, marginTop: 12 }}>Awards</div>
                    {data.awards.map((p: any) => (
                      <div key={p.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{p.name}</div>
                        {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      </div>
                    ))}
                  </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
                    <div style={label}>Volunteer</div>
                    {data.volunteer.map((e) => (
                      <div key={e.id} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: 12.5 }}>{e.role}</div>
                        <div style={{ fontSize: 11.5, color: pal.inkFaint }}>{[e.organization, e.location].filter(Boolean).join(' · ')} · {range(e.startDate, e.endDate, e.currentlyVolunteering)}</div>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                          {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
                    <div style={{ ...label, marginTop: 12 }}>Courses</div>
                    {data.courses.map((p: any) => (
                      <div key={p.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{p.name}</div>
                        {p.certificateUrl && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.certificateUrl}</div>}
                      </div>
                    ))}
                  </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
                    <div style={{ ...label, marginTop: 12 }}>Publications</div>
                    {data.publications.map((p: any) => (
                      <div key={p.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5 }}>{p.title}</div>
                        {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      </div>
                    ))}
                  </></div>) : null;
          default: return null;
        }
      };
      // Column assignment for the 25/45/30 spread. Summary is deliberately not
      // here: it is set two-up across the full measure, above the grid.
      const narrowKeys = ['skills', 'languages'];
      const wideKeys = ['experience', 'volunteer'];


  return (
    <div style={{ fontFamily: sans, color: pal.ink }}>
            <div style={{ height: 40, background: pal.accent }} />
            <div style={{ padding: '20px 36px 36px' }}>
              <h1 style={{ fontSize: 60, fontWeight: 800, lineHeight: 0.95, margin: 0, letterSpacing: -1.5 }}>{fullName(contact)}</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, flexWrap: 'wrap', gap: 6 }}>
                {contact.jobTitle && <span style={{ fontSize: 15, fontWeight: 600, color: pal.inkMuted }}>{contact.jobTitle}</span>}
                <span style={{ fontSize: 11, color: pal.inkFaint }}>{contactItems(contact).join('  ·  ')}</span>
              </div>

              {/* Standfirst — full measure, set two-up, like a magazine deck */}
              {order.filter((id) => id === 'summary').map(renderSection)}

              {/* Floated, not grid: a grid container cannot be split across
                  printed pages, so this whole three-column body was pushed to
                  page 2 leaving the header alone on page 1. See colRow in
                  shared.ts. */}
              <div style={{ ...colRow, fontSize: 12, lineHeight: 1.5 }}>
                {/* Col 1 — the short reference lists */}
                <div style={{ ...col, ...colCell('25%'), paddingLeft: 0, borderRight: divider }}>
                  {order.filter((id) => narrowKeys.includes(id)).map(renderSection)}
                </div>

                {/* Col 2 — the narrative */}
                <div style={{ ...col, ...colCell('45%'), borderRight: divider }}>
                  {order.filter((id) => wideKeys.includes(id)).map(renderSection)}
                </div>

                {/* Col 3 — credentials and output */}
                <div style={{ ...col, ...colCell('30%') }}>
                  {order.filter((id) => id !== 'summary' && !narrowKeys.includes(id) && !wideKeys.includes(id)).map(renderSection)}

                  <div style={{ ...label, marginTop: 12 }}>By the numbers</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {([
                      [`${data.experience?.length || 0}`, 'Roles'],
                      [`${data.projects?.length || 0}`, 'Projects'],
                      [`${data.skills?.length || 0}`, 'Skills'],
                      [`${data.education?.length || 0}`, 'Degrees'],
                    ] as [string, string][]).map(([n, l]) => (
                      <div key={l} style={{ border: `1px solid ${pal.rule}`, padding: '6px 8px' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: pal.accentInk }}>{n}</div>
                        <div style={{ fontSize: 10, color: pal.inkFaint, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={colClear} />
              </div>
            </div>
      </div>
  );
}
