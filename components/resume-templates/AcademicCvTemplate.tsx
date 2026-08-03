import type { CSSProperties } from 'react';
import { TemplateProps, fullName, range, bullets, degreeLine, has, palette } from './shared';
import { FONTS } from './fonts';

// Template 15 — ACADEMIC / CV: long-form, full-width ruled sections, hanging-indent entries.
const serif = FONTS.serif.stack;

const hang: CSSProperties = { paddingLeft: '1.5rem', textIndent: '-1.5rem', marginBottom: 7 };

export default function AcademicCvTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#1f2937');
  const { contact } = data;
  const sectionTitle: CSSProperties = {
    fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
    borderBottom: `1px solid ${pal.accentLine}`, paddingBottom: 3, margin: '18px 0 9px',
  };

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <>
              <div style={sectionTitle}>Work Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span><strong>{e.position}</strong>, {e.company}</span>
                    <span style={{ fontStyle: 'italic', color: pal.inkMuted, fontSize: 11.5 }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Research Interests</div>
              <p style={{ margin: 0, textAlign: 'justify' }}>{data.summary}</p>
            </></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Technical Skills</div>
              <p style={{ margin: 0 }}>{data.skills.map((s) => s.name).join(', ')}</p>
            </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Work Experience</div>
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span><strong>{e.position}</strong>, {e.company}</span>
                    <span style={{ fontStyle: 'italic', color: pal.inkMuted, fontSize: 11.5 }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Education</div>
              {data.education.map((e) => (
                <div key={e.id} style={hang}>
                  <strong>{degreeLine(e)}</strong>, {e.institution}{e.location ? `, ${e.location}` : ''}. {range(e.startDate, e.endDate, e.currentlyStudying)}{e.score ? ` (GPA ${e.score})` : ''}
                </div>
              ))}
            </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Projects</div>
              {data.projects.map((p) => (
                <div key={p.id} style={hang}>
                  <strong>{p.name}</strong>{p.url ? `, ${p.url}` : ''}{range(p.startDate, p.endDate) ? `. ${range(p.startDate, p.endDate)}` : ''}
                  {bullets(p.description).length > 0 && (
                    <ul style={{ margin: '2px 0 0', paddingLeft: 18 }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Certifications</div>
              {data.certifications.map((c: any) => (
                <div key={c.id} style={hang}>
                  <strong>{c.name}</strong>{c.issuer ? `, ${c.issuer}` : ''}{c.issueDate ? ` (${c.issueDate})` : ''}{c.credentialUrl ? `. ${c.credentialUrl}` : ''}
                </div>
              ))}
            </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Languages</div>
              <p style={{ margin: 0 }}>{data.languages.map((s) => `${s.name} - ${s.proficiency}`).join(', ')}</p>
            </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Awards &amp; Honors</div>
              {data.awards!.map((a: any) => (
                <div key={a.id} style={hang}>
                  <strong>{a.name}</strong>{a.issuer ? `, ${a.issuer}` : ''}{a.date ? ` (${a.date})` : ''}{a.description ? `. ${a.description}` : ''}
                </div>
              ))}
            </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Service &amp; Volunteering</div>
              {data.volunteer.map((e) => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span><strong>{e.role}</strong>, {e.organization}</span>
                    <span style={{ fontStyle: 'italic', color: pal.inkMuted, fontSize: 11.5 }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                  </div>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Teaching &amp; Courses</div>
              {data.courses!.map((c: any) => (
                <div key={c.id} style={hang}>
                  <strong>{c.name}</strong>{c.platform ? `, ${c.platform}` : ''}{c.completionDate ? `. ${c.completionDate}` : ''}
                </div>
              ))}
            </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
              <div style={sectionTitle}>Publications</div>
              {data.publications!.map((p: any) => (
                <div key={p.id} style={hang}>
                  {p.coAuthors ? `${p.coAuthors}. ` : ''}&ldquo;{p.title}.&rdquo; <em>{p.publisher}</em>{p.date ? `, ${p.date}` : ''}.{p.url ? ` ${p.url}` : ''}
                </div>
              ))}
            </></div>) : null;
          default: return null;
        }
      };
      

  return (
    <div style={{ fontFamily: serif, color: pal.ink, padding: '44px 56px', fontSize: 12, lineHeight: 1.5 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{fullName(contact)}</h1>
            {contact.jobTitle && <div style={{ fontSize: 13, color: pal.inkMuted }}>{contact.jobTitle}</div>}
            <div style={{ fontSize: 11.5, color: pal.inkFaint, marginTop: 8 }}>
              {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.website].filter(Boolean).map((c, i) => (
                <div key={i}>{c}</div>
              ))}
            </div>

            

            


            



            
          
      {order.map(renderSection)}
      </div>
  );
}
