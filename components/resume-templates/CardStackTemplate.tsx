import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette } from './shared';

// Template 9 — CARD STACK: single column, each entry a bordered card, warm amber accent.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';

export default function CardStackTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#f59e0b');
  const AMBER = pal.accentInk;
  const { contact } = data;
  const label: CSSProperties = {
    fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: pal.accentInk,
    borderBottom: `2px solid ${AMBER}`, display: 'inline-block', paddingBottom: 2, margin: '20px 0 10px',
  };
  const card: CSSProperties = {
    border: '1px solid #ececec', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '12px 14px', marginBottom: 10, background: '#fff',
  };

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
              <div style={label}>{customSection.title}</div>
              {customSection.items.map((p: any) => (
                <div key={p.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.startDate, p.endDate)}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: AMBER }}>{p.url}</div>}
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets((p.description || "")).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id}><p style={{ margin: '12px 0 0', color: pal.inkMuted }}>{data.summary}</p></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id}><>
              <div style={label}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.skills.map((s) => (
                  <span key={s.id} style={{ fontSize: 11, border: `1px solid ${AMBER}`, color: pal.accentInk, borderRadius: 999, padding: '3px 10px' }}>{s.name}</span>
                ))}
              </div>
            </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id}><>
              <div style={label}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pal.ink }}>{e.position}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: AMBER, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id}><>
              <div style={label}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>{degreeLine(e)}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: pal.inkFaint }}>{[e.institution, e.location, e.score && `GPA ${e.score}`].filter(Boolean).join(' · ')}</div>
                </div>
              ))}
            </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id}><>
              <div style={label}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.startDate, p.endDate)}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: AMBER }}>{p.url}</div>}
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id}><>
              <div style={label}>Certifications</div>
              {data.certifications.map((p: any) => (
                <div key={p.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.issueDate, p.expiryDate)}</span>
                  </div>
                  {p.credentialUrl && <div style={{ fontSize: 11, color: AMBER }}>{p.credentialUrl}</div>}
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id}><>
              <div style={label}>Languages</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.languages.map((s: any) => (
                  <span key={s.id} style={{ fontSize: 11, border: `1px solid ${AMBER}`, color: pal.accentInk, borderRadius: 999, padding: '3px 10px' }}>{`${s.name} - ${s.proficiency}`}</span>
                ))}
              </div>
            </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id}><>
              <div style={label}>Awards</div>
              {data.awards.map((p: any) => (
                <div key={p.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.date, "")}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: AMBER }}>{p.url}</div>}
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id}><>
              <div style={label}>Volunteer</div>
              {data.volunteer.map((e: any) => (
                <div key={e.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pal.ink }}>{e.role}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: AMBER, fontWeight: 700 }}>{[e.organization, e.location].filter(Boolean).join(' · ')}</div>
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id}><>
              <div style={label}>Courses</div>
              {data.courses.map((p: any) => (
                <div key={p.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.completionDate, "")}</span>
                  </div>
                  {p.certificateUrl && <div style={{ fontSize: 11, color: AMBER }}>{p.certificateUrl}</div>}
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id}><>
              <div style={label}>Publications</div>
              {data.publications.map((p: any) => (
                <div key={p.id} style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>{p.title}</span>
                    <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.date, "")}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: AMBER }}>{p.url}</div>}
                  <ul style={{ margin: '5px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          default: return null;
        }
      };
      

  return (
    <div style={{ fontFamily: sans, color: pal.ink, padding: '36px 40px', fontSize: 12.5, lineHeight: 1.5 }}>
            <div style={{ borderLeft: `4px solid ${AMBER}`, paddingLeft: 14, marginBottom: 4 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
              {contact.jobTitle && <div style={{ fontSize: 13, color: pal.inkFaint }}>{contact.jobTitle}</div>}
              <div style={{ fontSize: 11, color: pal.inkFaint, marginTop: 5 }}>{contactItems(contact).join('  ·  ')}</div>
            </div>

            

            

            

            

            
          
      {order.map(renderSection)}
      </div>
  );
}
