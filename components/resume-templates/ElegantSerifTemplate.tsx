import type { CSSProperties } from 'react';
import { TemplateProps, fullName, contactItems, range, bullets, degreeLine, has, palette } from './shared';
import { FONTS } from './fonts';

// Template 13 — ELEGANT SERIF: italic name, small-caps sections on a hairline underline.
const serif = FONTS.serif.stack;

export default function ElegantSerifTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  // Burgundy is only this template's *default*; the builder accent overrides it.
  const pal = palette(builderDesign, '#7b2c35');
  const { contact } = data;

  const headingRow: CSSProperties = {
    borderBottom: `1px solid ${pal.accentLine}`,
    padding: '0 0 4px',
    margin: '19px 0 10px',
  };
  const headingText: CSSProperties = {
    fontVariant: 'small-caps',
    fontSize: 14.5,
    letterSpacing: 1.6,
    color: pal.accentInk,
    fontWeight: 600,
  };

  const Ornament = ({ title }: { title: string }) => (
    <div style={headingRow}>
      <span style={headingText}>{title}</span>
    </div>
  );

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <>
              <Ornament title={customSection.title} />
              {customSection.items.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}{p.url ? <span style={{ fontStyle: 'italic', fontWeight: 400, color: pal.inkFaint }}> — {p.url}</span> : null}</div>
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
              <Ornament title="Profile" />
              <p style={{ margin: 0, textAlign: 'left', fontStyle: 'italic', color: pal.inkMuted }}>{data.summary}</p>
            </></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><>
              <Ornament title="Skills" />
              <p style={{ margin: 0, textAlign: 'left', fontStyle: 'italic' }}>{data.skills.map((s) => s.name).join(',  ')}</p>
            </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
              <Ornament title="Experience" />
              {data.experience.map((e) => (
                <div key={e.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700 }}>{e.company}</span>
                    <span style={{ fontSize: 11.5, fontStyle: 'italic', color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                  </div>
                  <div style={{ fontStyle: 'italic', color: pal.inkMuted }}>{[e.position, e.location].filter(Boolean).join(', ')}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><>
              <Ornament title="Education" />
              {data.education.map((e) => (
                <div key={e.id} style={{ marginBottom: 7, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{degreeLine(e)}</div>
                  <div style={{ fontStyle: 'italic', color: pal.inkMuted }}>{[e.institution, e.location].filter(Boolean).join(', ')} · {range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                </div>
              ))}
            </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
              <Ornament title="Projects" />
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}{p.url ? <span style={{ fontStyle: 'italic', fontWeight: 400, color: pal.inkFaint }}> — {p.url}</span> : null}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><>
              <Ornament title="Certifications" />
              {data.certifications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}{p.credentialUrl ? <span style={{ fontStyle: 'italic', fontWeight: 400, color: pal.inkFaint }}> — {p.credentialUrl}</span> : null}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><>
              <Ornament title="Languages" />
              <p style={{ margin: 0, textAlign: 'left', fontStyle: 'italic' }}>{data.languages.map((s) => `${s.name} - ${s.proficiency}`).join(',  ')}</p>
            </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
              <Ornament title="Awards" />
              {data.awards.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}{p.url ? <span style={{ fontStyle: 'italic', fontWeight: 400, color: pal.inkFaint }}> — {p.url}</span> : null}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
              <Ornament title="Volunteer" />
              {data.volunteer.map((e) => (
                <div key={e.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700 }}>{e.organization}</span>
                    <span style={{ fontSize: 11.5, fontStyle: 'italic', color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                  </div>
                  <div style={{ fontStyle: 'italic', color: pal.inkMuted }}>{[e.role, e.location].filter(Boolean).join(', ')}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
              <Ornament title="Courses" />
              {data.courses.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}{p.certificateUrl ? <span style={{ fontStyle: 'italic', fontWeight: 400, color: pal.inkFaint }}> — {p.certificateUrl}</span> : null}</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
              <Ornament title="Publications" />
              {data.publications.map((p: any) => (
                <div key={p.id} style={{ marginBottom: 9 }}>
                  <div style={{ fontWeight: 700 }}>{p.title}{p.url ? <span style={{ fontStyle: 'italic', fontWeight: 400, color: pal.inkFaint }}> — {p.url}</span> : null}</div>
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
    <div style={{ fontFamily: serif, color: pal.ink, padding: '50px 64px', fontSize: 12.5, lineHeight: 1.6 }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 36, fontStyle: 'italic', letterSpacing: 2, color: pal.accentInk, margin: 0, fontWeight: 500 }}>
                {fullName(contact)}
              </h1>
              {contact.jobTitle && <div style={{ fontSize: 13, fontStyle: 'italic', color: pal.inkMuted, marginTop: 4 }}>{contact.jobTitle}</div>}
              <div style={{ fontSize: 11.5, color: pal.inkFaint, marginTop: 8 }}>{contactItems(contact).join('  —  ')}</div>
            </div>

            

            

            

            

            
          
      {order.map(renderSection)}
      </div>
  );
}
