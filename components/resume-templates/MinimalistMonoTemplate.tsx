import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette } from './shared';

// Template 7 — MINIMALIST MONO: monospace, ultra-narrow, `// SECTION` titles, terminal feel.
const mono = '"Courier New", "SF Mono", Menlo, Consolas, monospace';

export default function MinimalistMonoTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#1f2937');
  const { contact } = data;
  const title: CSSProperties = { fontSize: 12, fontWeight: 700, color: pal.accentInk, margin: '20px 0 8px' };
  const rowBetween: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 };
  const muted: CSSProperties = { color: pal.inkFaint };

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
                <div style={title}>{'// projects'}</div>
                {customSection.items.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                      <span style={muted}>{range(p.startDate, p.endDate)}</span>
                    </div>
                    {p.url && <div style={{ ...muted, fontSize: 11 }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets((p.description || "")).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id}><>
                <div style={title}>{'// summary'}</div>
                <p style={{ margin: 0 }}>{data.summary}</p>
              </></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id}><>
                <div style={title}>{'// skills'}</div>
                <div>{data.skills.map((s) => s.name).join(', ')}</div>
              </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id}><>
                <div style={title}>{'// experience'}</div>
                {data.experience.map((e) => (
                  <div key={e.id} style={{ marginBottom: 12 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{e.position} @ {e.company}</span>
                      <span style={muted}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                    </div>
                    {e.location && <div style={{ ...muted, fontSize: 11 }}>{e.location}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id}><>
                <div style={title}>{'// education'}</div>
                {data.education.map((e) => (
                  <div key={e.id} style={{ marginBottom: 6 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{degreeLine(e)}</span>
                      <span style={muted}>{range(e.startDate, e.endDate, e.currentlyStudying)}</span>
                    </div>
                    <div style={muted}>{[e.institution, e.score && `gpa ${e.score}`].filter(Boolean).join(' · ')}</div>
                  </div>
                ))}
              </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id}><>
                <div style={title}>{'// projects'}</div>
                {data.projects.map((p) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                      <span style={muted}>{range(p.startDate, p.endDate)}</span>
                    </div>
                    {p.url && <div style={{ ...muted, fontSize: 11 }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id}><>
                <div style={title}>{'// projects'}</div>
                {data.certifications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                      <span style={muted}>{range(p.issueDate, p.expiryDate)}</span>
                    </div>
                    {p.credentialUrl && <div style={{ ...muted, fontSize: 11 }}>{p.credentialUrl}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id}><>
                <div style={title}>{'// skills'}</div>
                <div>{data.languages.map((s: any) => `${s.name} - ${s.proficiency}`).join(', ')}</div>
              </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id}><>
                <div style={title}>{'// projects'}</div>
                {data.awards.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                      <span style={muted}>{range(p.date, "")}</span>
                    </div>
                    {p.url && <div style={{ ...muted, fontSize: 11 }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id}><>
                <div style={title}>{'// experience'}</div>
                {data.volunteer.map((e: any) => (
                  <div key={e.id} style={{ marginBottom: 12 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{e.role} @ {e.organization}</span>
                      <span style={muted}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                    </div>
                    {e.location && <div style={{ ...muted, fontSize: 11 }}>{e.location}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id}><>
                <div style={title}>{'// projects'}</div>
                {data.courses.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                      <span style={muted}>{range(p.completionDate, "")}</span>
                    </div>
                    {p.certificateUrl && <div style={{ ...muted, fontSize: 11 }}>{p.certificateUrl}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id}><>
                <div style={title}>{'// projects'}</div>
                {data.publications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={rowBetween}>
                      <span style={{ fontWeight: 700 }}>{p.title}</span>
                      <span style={muted}>{range(p.date, "")}</span>
                    </div>
                    {p.url && <div style={{ ...muted, fontSize: 11 }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, listStyleType: "'- '" }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          default: return null;
        }
      };
      

  return (
    <div style={{ fontFamily: mono, color: pal.ink, fontSize: 12, lineHeight: 1.55, padding: '48px 0' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <h1 style={{ fontSize: 18, fontWeight: 400, margin: 0 }}>{fullName(contact)}</h1>
              {contact.jobTitle && <div style={{ ...muted, marginTop: 2 }}>{contact.jobTitle}</div>}
              <div style={{ ...muted, fontSize: 11, marginTop: 6 }}>{contactItems(contact).join('  ·  ')}</div>

              

              

              

              

              
            </div>
          
      {order.map(renderSection)}
      </div>
  );
}
