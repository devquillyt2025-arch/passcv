import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette } from './shared';

// Template 14 — STARTUP BOLD: huge orange name, thick orange rule, 40/60 two-column.
const sans = '"Helvetica Neue", Arial, sans-serif';

export default function StartupBoldTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#f97316');
  const ORANGE = pal.accentInk;
  const { contact } = data;
  const label: CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: ORANGE, margin: '0 0 9px' };

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
                  <div style={label}>{customSection.title}</div>
                  {customSection.items.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: ORANGE }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                        {bullets((p.description || "")).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id}><p style={{ margin: '0 0 18px', color: pal.inkMuted }}>{data.summary}</p></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={label}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {data.skills.map((s) => (
                      <span key={s.id} style={{ fontSize: 11, background: pal.accentTint, color: pal.accentInk, borderRadius: 4, padding: '3px 9px' }}>{s.name}</span>
                    ))}
                  </div>
                </div></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id}><>
                  <div style={label}>Experience</div>
                  {data.experience.map((e) => (
                    <div key={e.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800 }}>{e.position}</span>
                        <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={label}>Education</div>
                  {data.education.map((e) => (
                    <div key={e.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                      <div style={{ fontSize: 11, color: pal.inkFaint }}>{e.institution}</div>
                      <div style={{ fontSize: 10.5, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                    </div>
                  ))}
                </div></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id}><div>
                  <div style={label}>Projects</div>
                  {data.projects.map((p) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: ORANGE }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id}><div>
                  <div style={label}>Certifications</div>
                  {data.certifications.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                      {p.credentialUrl && <div style={{ fontSize: 10.5, color: ORANGE }}>{p.credentialUrl}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={label}>Languages</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {data.languages.map((s: any) => (
                      <span key={s.id} style={{ fontSize: 11, background: pal.accentTint, color: pal.accentInk, borderRadius: 4, padding: '3px 9px' }}>{`${s.name} - ${s.proficiency}`}</span>
                    ))}
                  </div>
                </div></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id}><div>
                  <div style={label}>Awards</div>
                  {data.awards.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: ORANGE }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id}><>
                  <div style={label}>Volunteer</div>
                  {data.volunteer.map((e: any) => (
                    <div key={e.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800 }}>{e.role}</span>
                        <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>{[e.organization, e.location].filter(Boolean).join(' · ')}</div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id}><div>
                  <div style={label}>Courses</div>
                  {data.courses.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                      {p.certificateUrl && <div style={{ fontSize: 10.5, color: ORANGE }}>{p.certificateUrl}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id}><div>
                  <div style={label}>Publications</div>
                  {data.publications.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 9 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{p.title}</div>
                      {p.url && <div style={{ fontSize: 10.5, color: ORANGE }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 15, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ fontSize: 11, marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></div>) : null;
          default: return null;
        }
      };
      

  return (
    <div style={{ fontFamily: sans, color: pal.ink, padding: '40px 46px', fontSize: 12.5, lineHeight: 1.5 }}>
            {/* Header */}
            <div style={{ borderBottom: `4px solid ${ORANGE}`, paddingBottom: 12, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <h1 style={{ fontSize: 40, fontWeight: 900, color: ORANGE, margin: 0, lineHeight: 1 }}>{fullName(contact)}</h1>
                {contact.jobTitle && <span style={{ fontSize: 13, color: pal.inkFaint, fontWeight: 600 }}>{contact.jobTitle}</span>}
              </div>
              <div style={{ fontSize: 11, color: pal.inkFaint, marginTop: 8 }}>{contactItems(contact).join('   ·   ')}</div>
            </div>

            

            <div style={{ display: 'flex', gap: 30 }}>
              {/* Left 40% */}
              <div style={{ width: '40%' }}>
                
                
                
              </div>

              {/* Right 60% */}
              <div style={{ width: '60%' }}>
                
              </div>
            </div>
          
      {order.map(renderSection)}
      </div>
  );
}
