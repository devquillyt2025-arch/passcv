import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette } from './shared';

// Template 10 — TIMELINE LEFT: vertical timeline with dots for experience, indigo accents.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';

export default function TimelineLeftTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#6366f1');
  const INDIGO = pal.accentInk;
  const { contact } = data;
  const label: CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: INDIGO, margin: '0 0 9px' };

      const defaultOrder = ["summary","skills","experience","education","projects","certifications","languages","awards","volunteer","courses","publications"];
      const customIds = (data.customSections || []).map(c => c.id);
      const order = sectionOrder || [...defaultOrder, ...customIds];
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id}>
              <>
              <div style={{ ...label, marginTop: 18 }}>{customSection.title}</div>
              {customSection.items.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} {p.url && <span style={{ fontSize: 10.5, color: INDIGO, fontWeight: 400 }}>· {p.url}</span>}</div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets((p.description || "")).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id}><p style={{ margin: '10px 0 18px', color: pal.inkMuted }}>{data.summary}</p></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id}><div>
                <div style={label}>Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {data.skills.map((s) => (
                    <span key={s.id} style={{ fontSize: 11, background: pal.accentTint, color: pal.accentInk, borderRadius: 4, padding: '2px 8px' }}>{s.name}</span>
                  ))}
                </div>
              </div></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id}><>
              <div style={label}>Career Timeline</div>
              <div style={{ position: 'relative', borderLeft: `2px solid ${INDIGO}`, marginLeft: 5, paddingLeft: 22 }}>
                {data.experience.map((e) => (
                  <div key={e.id} style={{ position: 'relative', marginBottom: 16 }}>
                    <span style={{ position: 'absolute', left: -29, top: 3, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: `3px solid ${INDIGO}` }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{e.position}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: INDIGO, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id}><div>
                <div style={label}>Education</div>
                {data.education.map((e) => (
                  <div key={e.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                    <div style={{ fontSize: 11, color: pal.inkFaint }}>{e.institution}</div>
                    <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                  </div>
                ))}
              </div></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id}><>
              <div style={{ ...label, marginTop: 18 }}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} {p.url && <span style={{ fontSize: 10.5, color: INDIGO, fontWeight: 400 }}>· {p.url}</span>}</div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id}><>
              <div style={{ ...label, marginTop: 18 }}>Certifications</div>
              {data.certifications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} {p.credentialUrl && <span style={{ fontSize: 10.5, color: INDIGO, fontWeight: 400 }}>· {p.credentialUrl}</span>}</div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id}><div>
                <div style={label}>Languages</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {data.languages.map((s: any) => (
                    <span key={s.id} style={{ fontSize: 11, background: pal.accentTint, color: pal.accentInk, borderRadius: 4, padding: '2px 8px' }}>{`${s.name} - ${s.proficiency}`}</span>
                  ))}
                </div>
              </div></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id}><>
              <div style={{ ...label, marginTop: 18 }}>Awards</div>
              {data.awards.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} {p.url && <span style={{ fontSize: 10.5, color: INDIGO, fontWeight: 400 }}>· {p.url}</span>}</div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id}><>
              <div style={label}>Career Timeline</div>
              <div style={{ position: 'relative', borderLeft: `2px solid ${INDIGO}`, marginLeft: 5, paddingLeft: 22 }}>
                {data.volunteer.map((e: any) => (
                  <div key={e.id} style={{ position: 'relative', marginBottom: 16 }}>
                    <span style={{ position: 'absolute', left: -29, top: 3, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: `3px solid ${INDIGO}` }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{e.role}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: INDIGO, fontWeight: 700 }}>{[e.organization, e.location].filter(Boolean).join(' · ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id}><>
              <div style={{ ...label, marginTop: 18 }}>Courses</div>
              {data.courses.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name} {p.certificateUrl && <span style={{ fontSize: 10.5, color: INDIGO, fontWeight: 400 }}>· {p.certificateUrl}</span>}</div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id}><>
              <div style={{ ...label, marginTop: 18 }}>Publications</div>
              {data.publications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.title} {p.url && <span style={{ fontSize: 10.5, color: INDIGO, fontWeight: 400 }}>· {p.url}</span>}</div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          default: return null;
        }
      };
      

  return (
    <div style={{ fontFamily: sans, color: pal.ink, padding: '36px 44px', fontSize: 12.5, lineHeight: 1.5 }}>
            <div style={{ marginBottom: 6 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
              {contact.jobTitle && <div style={{ fontSize: 13, color: pal.inkFaint }}>{contact.jobTitle}</div>}
              <div style={{ height: 3, width: 64, background: INDIGO, margin: '8px 0' }} />
              <div style={{ fontSize: 11, color: pal.inkFaint }}>{contactItems(contact).join('  ·  ')}</div>
            </div>

            

            {/* Skills + Education grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 20 }}>
              
              
            </div>

            {/* Timeline experience */}
            

            
          
      {order.map(renderSection)}
      </div>
  );
}
