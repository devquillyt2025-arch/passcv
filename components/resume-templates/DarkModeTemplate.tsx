import type { CSSProperties } from 'react';
import { TemplateProps, fullName, initials, range, bullets, degreeLine, has, SHEET_H, palette } from './shared';
import { FONTS } from './fonts';

// Template 12 — DARK MODE: full dark background, 35/65 two-column, teal accents.
const sans = FONTS.sans.stack;

export default function DarkModeTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#14b8a6');
  const BG = pal.surfaceDarker;
  const PANEL = pal.surfaceDark;
  const TEAL = pal.accentOnDark;
  const { contact } = data;
  const label: CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: TEAL, margin: '18px 0 8px' };

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <>
                <div style={label}>{customSection.title}</div>
                {customSection.items.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.onDark }}>{p.name}</div>
                    {p.url && <div style={{ fontSize: 11, color: TEAL }}>{p.url}</div>}
                    <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets((p.description || "")).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            </div>
          );
        }
        
        switch(id) {
          case 'summary': return data.summary ? (<div key={id} data-section={id}><p style={{ margin: '12px 0 0', color: pal.onDark }}>{data.summary}</p></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><>
                <div style={label}>Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {data.skills.map((s) => (
                    <span key={s.id} style={{ fontSize: 10.5, border: `1px solid ${TEAL}`, color: TEAL, borderRadius: 4, padding: '2px 7px' }}>{s.name}</span>
                  ))}
                </div>
              </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
                <div style={label}>Experience</div>
                {data.experience.map((e) => (
                  <div key={e.id} style={{ marginBottom: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: pal.onDark }}>{e.position}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><>
                <div style={label}>Education</div>
                {data.education.map((e) => (
                  <div key={e.id} style={{ marginBottom: 9 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: pal.onDark }}>{degreeLine(e)}</div>
                    <div style={{ fontSize: 10.5, color: pal.onDarkMuted }}>{e.institution}</div>
                    <div style={{ fontSize: 10, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                  </div>
                ))}
              </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
                <div style={label}>Projects</div>
                {data.projects.map((p) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.onDark }}>{p.name}</div>
                    {p.url && <div style={{ fontSize: 11, color: TEAL }}>{p.url}</div>}
                    <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><>
                <div style={label}>Certifications</div>
                {data.certifications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.onDark }}>{p.name}</div>
                    {p.credentialUrl && <div style={{ fontSize: 11, color: TEAL }}>{p.credentialUrl}</div>}
                    <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><>
                <div style={label}>Languages</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {data.languages.map((s) => (
                    <span key={s.id} style={{ fontSize: 10.5, border: `1px solid ${TEAL}`, color: TEAL, borderRadius: 4, padding: '2px 7px' }}>{`${s.name} - ${s.proficiency}`}</span>
                  ))}
                </div>
              </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
                <div style={label}>Awards</div>
                {data.awards.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.onDark }}>{p.name}</div>
                    {p.url && <div style={{ fontSize: 11, color: TEAL }}>{p.url}</div>}
                    <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
                <div style={label}>Volunteer</div>
                {data.volunteer.map((e) => (
                  <div key={e.id} style={{ marginBottom: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: pal.onDark }}>{e.role}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>{[e.organization, e.location].filter(Boolean).join(' · ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
                <div style={label}>Courses</div>
                {data.courses.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.onDark }}>{p.name}</div>
                    {p.certificateUrl && <div style={{ fontSize: 11, color: TEAL }}>{p.certificateUrl}</div>}
                    <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
                <div style={label}>Publications</div>
                {data.publications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.onDark }}>{p.title}</div>
                    {p.url && <div style={{ fontSize: 11, color: TEAL }}>{p.url}</div>}
                    <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.onDark }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          default: return null;
        }
      };
    const leftKeys = ['summary', 'skills', 'education', 'languages', 'certifications', 'awards'];
      

  return (
    <div style={{ display: 'flex', fontFamily: sans, background: BG, color: pal.onDark, minHeight: SHEET_H }}>
      {/* Sidebar */}
      <div style={{ width: '35%', flexShrink: 0, background: PANEL, padding: '32px 22px' }}>
        <div style={{ width: 70, height: 70, borderRadius: 12, background: TEAL, color: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {initials(contact)}
        </div>
        <div style={{ fontSize: 12, color: pal.onDarkMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Contact</div>
        {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.github, contact.website].filter(Boolean).map((c, i) => (
          <div key={i} style={{ fontSize: 11, marginTop: 5, wordBreak: 'break-word', color: pal.onDark }}>{c}</div>
        ))}

        {order.filter(id => leftKeys.includes(id)).map(renderSection)}
      </div>

      {/* Main */}
      <div style={{ width: '65%', padding: '32px 28px', fontSize: 12.5, lineHeight: 1.55 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>{fullName(contact)}</h1>
        {contact.jobTitle && <div style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>{contact.jobTitle}</div>}

        {order.filter(id => !leftKeys.includes(id)).map(renderSection)}
      </div>
    </div>
  );
}
