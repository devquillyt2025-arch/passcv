import type { CSSProperties } from 'react';
import { TemplateProps, fullName, range, bullets, degreeLine, has, palette } from './shared';
import { FONTS } from './fonts';

// Template 11 — GOVERNMENT / FEDERAL: USAJobs-style form document.
// Identity vs CLASSIC: Government is the *condensed* one — tight 1.3 leading,
// small type, rules that read as form fields. Classic keeps the airy book feel.
const serif = FONTS.times.stack;

export default function GovernmentTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const { contact } = data;
  const pal = palette(builderDesign, '#334155');
  // Ruled band rather than an underlined string: same officialdom, controllable colour.
  const sectionTitle: CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.9,
    color: pal.accentInk,
    borderBottom: `1px solid ${pal.accentLine}`,
    paddingBottom: 2,
    margin: '13px 0 5px',
  };
  const cell: CSSProperties = { padding: '1px 7px', border: `1px solid ${pal.rule}`, fontSize: 10.5 };
  // Weight hierarchy: entry titles semibold, org line regular, dates/qualifiers faint.
  const entryTitle: CSSProperties = { fontWeight: 600, fontSize: 11.5 };
  const entryOrg: CSSProperties = { fontWeight: 400 };
  const entryMeta: CSSProperties = { fontSize: 10.5, color: pal.inkMuted };
  const tightList: CSSProperties = { margin: '2px 0 0', paddingLeft: 17 };

  const contactRows: [string, string][] = [
    ['Email', contact.email || ''],
    ['Phone', contact.phone || ''],
    ['Address', [contact.city, contact.country].filter(Boolean).join(', ')],
    ['LinkedIn', contact.linkedin || ''],
  ].filter(([, v]) => v) as [string, string][];

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <>
              <div style={sectionTitle}>Relevant Projects</div>
              {customSection.items.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={entryTitle}>{p.name}{p.url ? ` (${p.url})` : ''}</div>
                  <ul style={tightList}>
                    {bullets((p.description || "")).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Professional Summary</div>
              <p style={{ margin: 0, textAlign: 'justify' }}>{data.summary}</p>
            </></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Skills</div>
              <p style={{ margin: 0 }}>{data.skills.map((s) => s.name).join('; ')}</p>
            </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Work Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={entryTitle}>{e.position}</div>
                  <div style={entryOrg}>{[e.company, e.location].filter(Boolean).join(', ')}</div>
                  <div style={entryMeta}>{range(e.startDate, e.endDate, e.currentlyWorking, true)}</div>
                  <div style={{ ...entryMeta, fontStyle: 'italic', color: pal.inkFaint }}>Hours per week: 40 &nbsp;|&nbsp; Supervisor: Available upon request</div>
                  <ul style={tightList}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 5 }}>
                  <div style={entryTitle}>{degreeLine(e)}</div>
                  <div style={entryOrg}>{[e.institution, e.location].filter(Boolean).join(', ')}</div>
                  <div style={entryMeta}>{range(e.startDate, e.endDate, e.currentlyStudying, true)}{e.score ? ` · GPA: ${e.score}` : ''}</div>
                </div>
              ))}
            </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Relevant Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={entryTitle}>{p.name}{p.url ? ` (${p.url})` : ''}</div>
                  <ul style={tightList}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Certifications &amp; Licenses</div>
              {data.certifications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={entryTitle}>{p.name}{p.credentialUrl ? ` (${p.credentialUrl})` : ''}</div>
                  <ul style={tightList}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Languages</div>
              <p style={{ margin: 0 }}>{data.languages.map((s) => `${s.name} - ${s.proficiency}`).join('; ')}</p>
            </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Awards &amp; Recognition</div>
              {data.awards.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={entryTitle}>{p.name}{p.url ? ` (${p.url})` : ''}</div>
                  <ul style={tightList}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Volunteer Experience</div>
              {data.volunteer.map((e) => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div style={entryTitle}>{e.role}</div>
                  <div style={entryOrg}>{[e.organization, e.location].filter(Boolean).join(', ')}</div>
                  <div style={entryMeta}>{range(e.startDate, e.endDate, e.currentlyVolunteering, true)}</div>
                  <div style={{ ...entryMeta, fontStyle: 'italic', color: pal.inkFaint }}>Hours per week: 40 &nbsp;|&nbsp; Supervisor: Available upon request</div>
                  <ul style={tightList}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Professional Training</div>
              {data.courses.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={entryTitle}>{p.name}{p.certificateUrl ? ` (${p.certificateUrl})` : ''}</div>
                  <ul style={tightList}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Publications</div>
              {data.publications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 6 }}>
                  <div style={entryTitle}>{p.title}{p.url ? ` (${p.url})` : ''}</div>
                  <ul style={tightList}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          default: return null;
        }
      };
      

  return (
    <div style={{ fontFamily: serif, color: pal.ink, padding: '38px 50px', fontSize: 11.5, lineHeight: 1.3 }}>
            {/* Name block — form header, ruled top and bottom */}
            <div style={{ borderTop: `2px solid ${pal.accentLine}`, borderBottom: `1px solid ${pal.rule}`, padding: '6px 0', textAlign: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.4, color: pal.accentInk }}>{fullName(contact)}</div>
              {contact.jobTitle && <div style={{ fontSize: 11, color: pal.inkMuted, letterSpacing: 0.4 }}>{contact.jobTitle}</div>}
            </div>

            <div style={{ ...sectionTitle, margin: '0 0 5px' }}>Contact Information</div>
            <table style={{ borderCollapse: 'collapse', marginBottom: 4 }}>
              <tbody>
                {contactRows.map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ ...cell, fontWeight: 700, width: 110 }}>{k}</td>
                    <td style={cell}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            

            

            

            

            
          
      {order.map(renderSection)}
      </div>
  );
}
