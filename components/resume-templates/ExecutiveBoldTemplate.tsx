import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette } from './shared';

// Template 3 — EXECUTIVE BOLD: heavy all-caps name, 28/72 two-column, timeline dots.
const sans = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
const body = '"Helvetica Neue", Arial, sans-serif';

export default function ExecutiveBoldTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const { contact } = data;
  const pal = palette(builderDesign, '#1f2937');
  const leftLabel: CSSProperties = {
    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.6, color: pal.accentInk, margin: '0 0 8px',
  };
  const rightLabel: CSSProperties = { ...leftLabel, margin: '0 0 12px' };

      const defaultOrder = ["summary","skills","experience","education","projects","certifications","languages","awards","volunteer","courses","publications"];
      const customIds = (data.customSections || []).map(c => c.id);
      const order = sectionOrder || [...defaultOrder, ...customIds];
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id}>
              <div>
                  <div style={leftLabel}>{customSection.title}</div>
                  {customSection.items.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
                        {bullets((p.description || "")).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id}><p style={{ margin: '0 0 16px', color: pal.ink }}>{data.summary}</p></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={leftLabel}>Expertise</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {data.skills.map((s) => (
                      <span key={s.id} style={{ fontSize: 11, border: `1px solid ${pal.accentLine}`, background: pal.accentTint, borderRadius: 3, padding: '2px 7px' }}>{s.name}</span>
                    ))}
                  </div>
                </div></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id}><>
                  <div style={rightLabel}>Experience</div>
                  <div style={{ position: 'relative', paddingLeft: 18, borderLeft: `2px solid ${pal.rule}` }}>
                    {data.experience.map((e) => (
                      <div key={e.id} style={{ position: 'relative', marginBottom: 16 }}>
                        <span style={{ position: 'absolute', left: -25, top: 4, width: 10, height: 10, borderRadius: '50%', background: pal.accent }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 800 }}>{e.position}</span>
                          <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: pal.inkMuted }}>{[e.company, e.location].filter(Boolean).join(' — ')}</div>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 16, color: pal.ink }}>
                          {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={leftLabel}>Education</div>
                  {data.education.map((e) => (
                    <div key={e.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{degreeLine(e)}</div>
                      <div style={{ fontSize: 11, color: pal.inkMuted }}>{e.institution}</div>
                      <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyStudying)}{e.score ? ` · GPA ${e.score}` : ''}</div>
                    </div>
                  ))}
                </div></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id}><div>
                  <div style={leftLabel}>Projects</div>
                  {data.projects.map((p) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id}><div>
                  <div style={leftLabel}>Certifications</div>
                  {data.certifications.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                      {p.credentialUrl && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.credentialUrl}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={leftLabel}>Languages</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {data.languages.map((s: any) => (
                      <span key={s.id} style={{ fontSize: 11, border: `1px solid ${pal.accentLine}`, background: pal.accentTint, borderRadius: 3, padding: '2px 7px' }}>{`${s.name} - ${s.proficiency}`}</span>
                    ))}
                  </div>
                </div></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id}><div>
                  <div style={leftLabel}>Awards</div>
                  {data.awards.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id}><>
                  <div style={rightLabel}>Volunteer</div>
                  <div style={{ position: 'relative', paddingLeft: 18, borderLeft: `2px solid ${pal.rule}` }}>
                    {data.volunteer.map((e: any) => (
                      <div key={e.id} style={{ position: 'relative', marginBottom: 16 }}>
                        <span style={{ position: 'absolute', left: -25, top: 4, width: 10, height: 10, borderRadius: '50%', background: pal.accent }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 800 }}>{e.role}</span>
                          <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: pal.inkMuted }}>{[e.organization, e.location].filter(Boolean).join(' — ')}</div>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 16, color: pal.ink }}>
                          {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id}><div>
                  <div style={leftLabel}>Courses</div>
                  {data.courses.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                      {p.certificateUrl && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.certificateUrl}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id}><div>
                  <div style={leftLabel}>Publications</div>
                  {data.publications.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{p.title}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          default: return null;
        }
      };
    const leftKeys = ['summary', 'skills', 'education', 'languages', 'certifications', 'awards'];
      

  return (
    <div style={{ fontFamily: body, color: pal.ink, padding: '40px 48px', fontSize: 12.5, lineHeight: 1.5 }}>
      {/* Name block */}
      <div style={{ borderBottom: `3px solid ${pal.accentLine}`, paddingBottom: 10, marginBottom: 14 }}>
        <h1 style={{ fontFamily: sans, fontSize: 38, fontWeight: 900, letterSpacing: -1.2, textTransform: 'uppercase', margin: 0, lineHeight: 1.0, color: pal.ink }}>
          {fullName(contact)}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, flexWrap: 'wrap', gap: 6 }}>
          {contact.jobTitle && <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.6, color: pal.accentInk }}>{contact.jobTitle}</span>}
          <span style={{ fontSize: 10.5, color: pal.inkFaint }}>{contactItems(contact).join('  ·  ')}</span>
        </div>
      </div>

      

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left rail — pinned at 30%, never shrinks */}
        <div style={{ width: '30%', flexShrink: 0 }}>
              {order.filter(id => leftKeys.includes(id)).map(renderSection)}
              </div>

        {/* Right — takes the remaining ~70%, experience with timeline dots */}
        <div style={{ flex: 1, minWidth: 0 }}>
              {order.filter(id => !leftKeys.includes(id)).map(renderSection)}
              </div>
      </div>
    </div>
  );
}
