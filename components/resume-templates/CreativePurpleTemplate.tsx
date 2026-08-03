import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, SHEET_H, palette } from './shared';
import { FONTS } from './fonts';

// Template 4 — CREATIVE PURPLE: full-bleed purple header + light-purple/white two-column body.
const sans = FONTS.sans.stack;

export default function CreativePurpleTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#7c3aed');
  const PURPLE = pal.accentInk;
  const LIGHT = pal.accentTint;
  const { contact } = data;
  const colLabel: CSSProperties = {
    fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: PURPLE, margin: '0 0 9px',
  };

  const order = sectionOrder;
  
  const renderSection = (id: string) => {
        switch(id) {
          case 'summary': return data.summary ? (<div key={id} style={{ marginBottom: 20 }}>
              <div style={colLabel}>About</div>
              <p style={{ margin: 0, fontSize: 12, color: pal.inkMuted, lineHeight: 1.55 }}>{data.summary}</p>
            </div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} style={{ marginBottom: 20 }}>
              <div style={colLabel}>Skills</div>
              {data.skills.map((s, i: number) => {
                const pct = 95 - i * 6;
                return (
                  <div key={s.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11.5, marginBottom: 3 }}>{s.name}</div>
                    <div style={{ height: 6, background: pal.accentTint, borderRadius: 3 }}>
                      <div style={{ width: `${Math.max(45, pct)}%`, height: '100%', background: PURPLE, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><div>
              <div style={colLabel}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                  <div style={{ fontSize: 11, color: pal.inkFaint }}>{e.institution}</div>
                  <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                </div>
              ))}
            </div></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
              <div style={colLabel}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{e.position}</div>
                  <div style={{ fontSize: 12, color: PURPLE, fontWeight: 700 }}>{e.company}
                    <span style={{ color: pal.inkFaint, fontWeight: 400 }}>{e.location ? `  ·  ${e.location}` : ''}  ·  {range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
              <div style={{ ...colLabel, marginTop: 6 }}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 11 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} <span style={{ fontSize: 10.5, color: PURPLE, fontWeight: 400 }}>{p.url}</span></div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><div>
                  <div style={{ ...colLabel, marginTop: 6 }}>Certifications</div>
                  {data.certifications.map((c: any) => (
                    <div key={c.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
                      {c.issuer && <div style={{ fontSize: 11, color: pal.inkFaint }}>{c.issuer}</div>}
                    </div>
                  ))}
                </div></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} style={{ marginBottom: 20 }}>
                  <div style={colLabel}>Languages</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {data.languages.map((s) => (
                      <span key={s.id} style={{ fontSize: 11.5 }}>{`${s.name} - ${s.proficiency}`}</span>
                    ))}
                  </div>
                </div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
                  <div style={{ ...colLabel, marginTop: 6 }}>Awards</div>
                  {data.awards.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 11 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: PURPLE, fontWeight: 400 }}>{p.url}</div>}
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
                  <div style={colLabel}>Volunteer</div>
                  {data.volunteer.map((e) => (
                    <div key={e.id} style={{ marginBottom: 13 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{e.role}</div>
                      <div style={{ fontSize: 12, color: PURPLE, fontWeight: 700 }}>{e.organization}
                        <span style={{ color: pal.inkFaint, fontWeight: 400 }}>{e.location ? `  ·  ${e.location}` : ''}  ·  {range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                      </div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
                  <div style={{ ...colLabel, marginTop: 6 }}>Courses</div>
                  {data.courses.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 11 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                      {p.certificateUrl && <div style={{ fontSize: 10.5, color: PURPLE, fontWeight: 400 }}>{p.certificateUrl}</div>}
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
                  <div style={{ ...colLabel, marginTop: 6 }}>Publications</div>
                  {data.publications.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 11 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.title}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: PURPLE, fontWeight: 400 }}>{p.url}</div>}
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          default: 
            const cs = data.customSections?.find((c: any) => c.id === id);
            if (cs && cs.items.length > 0) {
              return (
                <div key={id} data-section={id}><>
                  <div style={{ ...colLabel, marginTop: 6 }}>{cs.title}</div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- reads p.url, which ResumeCustomItem does not define; see note in lib/types.ts */}
                  {cs.items.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 11 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} {p.url && <span style={{ fontSize: 10.5, color: PURPLE, fontWeight: 400 }}>{p.url}</span>}</div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>
              );
            }
            return null;
        }
      };
      
      const leftKeys = ['summary', 'skills', 'education', 'languages', 'certifications', 'awards'];

  return (
    <div style={{ fontFamily: sans, color: pal.ink, minHeight: SHEET_H, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: PURPLE, color: '#fff', padding: '30px 40px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
        {contact.jobTitle && <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', marginTop: 3 }}>{contact.jobTitle}</div>}
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.90)', marginTop: 10 }}>{contactItems(contact).join('   •   ')}</div>
      </div>

      {/* flex:1 + stretch so the tinted rail runs the full sheet, not just to
          the end of its own content. */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
        {/* Left 38% */}
        <div style={{ width: '38%', flexShrink: 0, background: LIGHT, padding: '26px 24px' }}>
          {order.filter(id => leftKeys.includes(id)).map(renderSection)}
        </div>

        {/* Right 62% */}
        <div style={{ width: '62%', padding: '26px 28px', fontSize: 12.5, lineHeight: 1.5 }}>
          {order.filter(id => !leftKeys.includes(id)).map(renderSection)}
        </div>
      </div>
    </div>
  );
}
