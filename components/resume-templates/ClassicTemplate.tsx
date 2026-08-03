import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette } from './shared';
import { FONTS } from './fonts';

// Template 1 — CLASSIC: single column, centered serif, refined book typography.
// Identity vs GOVERNMENT: Classic is the *typographic* one — generous leading,
// small-caps section marks on a single hairline, italic metadata. Government is
// the condensed, strictly-ruled form.
const serif = FONTS.serif.stack;

export default function ClassicTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const { contact } = data;
  const pal = palette(builderDesign, '#1f2937');
  // One hairline under the title instead of the old #111 box rules.
  const sectionTitle: CSSProperties = {
    fontFamily: serif,
    fontSize: 11.5,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 600,
    color: pal.accentInk,
    borderBottom: `1px solid ${pal.accentLine}`,
    padding: '0 0 5px',
    margin: '20px 0 11px',
  };
  const role: CSSProperties = { fontSize: 13, fontWeight: 600, color: pal.ink };
  const meta: CSSProperties = { fontSize: 11.5, color: pal.inkMuted, fontStyle: 'italic' };

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <>
              <div style={sectionTitle}>{customSection.title}</div>
              {customSection.items.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{p.name}</span>
                    <span style={meta}>{range(p.startDate, p.endDate)}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: pal.inkFaint }}>{p.url}</div>}
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets((p.description || "")).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Summary</div>
              <p style={{ margin: 0, textAlign: 'justify' }}>{data.summary}</p>
            </></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Skills</div>
              <p style={{ margin: 0, textAlign: 'center' }}>{data.skills.map((s) => s.name).join(', ')}</p>
            </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{e.position}</span>
                    <span style={meta}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <div style={meta}>{[e.company, e.location].filter(Boolean).join(', ')}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{degreeLine(e)}</span>
                    <span style={meta}>{range(e.startDate, e.endDate, e.currentlyStudying)}</span>
                  </div>
                  <div style={meta}>{[e.institution, e.location, e.score && `GPA ${e.score}`].filter(Boolean).join(', ')}</div>
                </div>
              ))}
            </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{p.name}</span>
                    <span style={meta}>{range(p.startDate, p.endDate)}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: pal.inkFaint }}>{p.url}</div>}
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Certifications</div>
              {data.certifications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{p.name}</span>
                    <span style={meta}>{range(p.issueDate, p.expiryDate)}</span>
                  </div>
                  {p.credentialUrl && <div style={{ fontSize: 11, color: pal.inkFaint }}>{p.credentialUrl}</div>}
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Languages</div>
              <p style={{ margin: 0, textAlign: 'center' }}>{data.languages.map((s) => `${s.name} - ${s.proficiency}`).join(', ')}</p>
            </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Awards</div>
              {data.awards.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{p.name}</span>
                    <span style={meta}>{range(p.date, "")}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: pal.inkFaint }}>{p.url}</div>}
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Volunteer</div>
              {data.volunteer.map((e) => (
                <div key={e.id} style={{ marginBottom: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{e.role}</span>
                    <span style={meta}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                  </div>
                  <div style={meta}>{[e.organization, e.location].filter(Boolean).join(', ')}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Courses</div>
              {data.courses.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{p.name}</span>
                    <span style={meta}>{range(p.completionDate, "")}</span>
                  </div>
                  {p.certificateUrl && <div style={{ fontSize: 11, color: pal.inkFaint }}>{p.certificateUrl}</div>}
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Publications</div>
              {data.publications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={role}>{p.title}</span>
                    <span style={meta}>{range(p.date, "")}</span>
                  </div>
                  {p.url && <div style={{ fontSize: 11, color: pal.inkFaint }}>{p.url}</div>}
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          default: return null;
        }
      };
      

  return (
    <div style={{ fontFamily: serif, color: pal.ink, padding: '46px 60px', fontSize: 12.5, lineHeight: 1.62 }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <h1 style={{ fontFamily: serif, fontSize: 31, fontWeight: 400, letterSpacing: 0.5, margin: 0, color: pal.ink }}>
                {fullName(contact)}
              </h1>
              {contact.jobTitle && (
                <div style={{ fontSize: 12.5, fontStyle: 'italic', color: pal.accentInk, marginTop: 5, letterSpacing: 0.3 }}>
                  {contact.jobTitle}
                </div>
              )}
              <div style={{ fontSize: 11, color: pal.inkFaint, marginTop: 7 }}>{contactItems(contact).join('   ·   ')}</div>
            </div>

            

            

            

            

            
          
      {order.map(renderSection)}
      </div>
  );
}
