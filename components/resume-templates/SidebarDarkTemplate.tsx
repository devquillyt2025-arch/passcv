import type { CSSProperties } from 'react';
import { TemplateProps, fullName, initials, range, bullets, degreeLine, has, SHEET_H, palette } from './shared';
import { FONTS } from './fonts';

// Template 2 — SIDEBAR DARK: 32% slate rail + 68% white content.
// Identity vs INFOGRAPHIC: this one puts only the *credential* sections
// (contact, skills, education, languages) in a solid dark rail and gives the
// whole narrative — summary included — to the white column. Infographic keeps a
// light rail and pushes summary/certs/awards into it as well.
const sans = FONTS.sans.stack;

export default function SidebarDarkTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const { contact } = data;
  // Slate rather than pure black: holds up in print and at low contrast.
  const pal = palette(builderDesign, '#38bdf8');
  const RAIL = pal.surfaceDark;
  // Accent lightened until it clears 4.5:1 on the rail — this is the fix for
  // link/heading colours disappearing into the dark background.
  const ON_RAIL = pal.accentOnDark;
  const sideLabel: CSSProperties = {
    color: ON_RAIL, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2,
    margin: '18px 0 7px', borderBottom: `1px solid ${pal.ruleOnDark}`, paddingBottom: 4,
  };
  const mainLabel: CSSProperties = {
    color: pal.accentInk, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
    borderBottom: `2px solid ${pal.accentLine}`, paddingBottom: 3, margin: '18px 0 9px',
  };

      const order = sectionOrder;
      
      const renderSection = (id: string) => {
        if (id.startsWith('custom-')) {
          const customSection = data.customSections?.find((c: any) => c.id === id);
          if (!customSection || !has(customSection.items)) return null;
          return (
            <div key={id} data-section={id}>
              <>
                <div style={mainLabel}>{customSection.title}</div>
                {customSection.items.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.startDate, p.endDate)}</span>
                    </div>
                    {p.url && <div style={{ fontSize: 11, color: pal.accentInk }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
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
                <div style={mainLabel}>Profile</div>
                <p style={{ margin: 0, color: pal.inkMuted }}>{data.summary}</p>
              </></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id} data-section={id}><>
                <div style={sideLabel}>Skills</div>
                {data.skills.map((s) => <div key={s.id} style={{ fontSize: 11.5, marginBottom: 5 }}>{s.name}</div>)}
              </></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id} data-section={id}><>
                <div style={mainLabel}>Experience</div>
                {data.experience.map((e) => (
                  <div key={e.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{e.position}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: pal.accentInk, fontWeight: 600 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id} data-section={id}><>
                <div style={sideLabel}>Education</div>
                {data.education.map((e) => (
                  <div key={e.id} style={{ marginBottom: 9 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>{degreeLine(e)}</div>
                    <div style={{ fontSize: 10.5, color: pal.onDark }}>{e.institution}</div>
                    <div style={{ fontSize: 10, color: pal.onDarkMuted }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                  </div>
                ))}
              </></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id} data-section={id}><>
                <div style={mainLabel}>Projects</div>
                {data.projects.map((p) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.startDate, p.endDate)}</span>
                    </div>
                    {p.url && <div style={{ fontSize: 11, color: pal.accentInk }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id} data-section={id}><>
                <div style={mainLabel}>Certifications</div>
                {data.certifications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.issueDate, p.expiryDate)}</span>
                    </div>
                    {p.credentialUrl && <div style={{ fontSize: 11, color: pal.accentInk }}>{p.credentialUrl}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id} data-section={id}><>
                <div style={sideLabel}>Languages</div>
                {data.languages.map((s) => <div key={s.id} style={{ fontSize: 11.5, marginBottom: 5 }}>{`${s.name} - ${s.proficiency}`}</div>)}
              </></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id} data-section={id}><>
                <div style={mainLabel}>Awards</div>
                {data.awards.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.date, "")}</span>
                    </div>
                    {p.url && <div style={{ fontSize: 11, color: pal.accentInk }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id} data-section={id}><>
                <div style={mainLabel}>Volunteer</div>
                {data.volunteer.map((e) => (
                  <div key={e.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{e.role}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: pal.accentInk, fontWeight: 600 }}>{[e.organization, e.location].filter(Boolean).join(' · ')}</div>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id} data-section={id}><>
                <div style={mainLabel}>Courses</div>
                {data.courses.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.completionDate, "")}</span>
                    </div>
                    {p.certificateUrl && <div style={{ fontSize: 11, color: pal.accentInk }}>{p.certificateUrl}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id} data-section={id}><>
                <div style={mainLabel}>Publications</div>
                {data.publications.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.title}</span>
                      <span style={{ fontSize: 11, color: pal.inkFaint }}>{range(p.date, "")}</span>
                    </div>
                    {p.url && <div style={{ fontSize: 11, color: pal.accentInk }}>{p.url}</div>}
                    <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                      {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </></div>) : null;
          default: return null;
        }
      };
      // Only these live in the dark rail; they are the cases styled with sideLabel.
      const railKeys = ['skills', 'education', 'languages'];

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', fontFamily: sans, minHeight: SHEET_H, color: pal.ink }}>
            {/* Sidebar — credentials only */}
            <div style={{ width: '32%', flexShrink: 0, background: RAIL, color: pal.onDark, padding: '34px 22px' }}>
              <div style={{
                width: 84, height: 84, borderRadius: '50%', background: ON_RAIL, color: RAIL,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800,
                margin: '0 auto 14px',
              }}>{initials(contact)}</div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', textAlign: 'center', margin: 0, lineHeight: 1.2 }}>
                {fullName(contact)}
              </h1>
              {contact.jobTitle && <div style={{ textAlign: 'center', color: ON_RAIL, fontSize: 12, marginTop: 4 }}>{contact.jobTitle}</div>}

              <div style={sideLabel}>Contact</div>
              {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.github, contact.website].filter(Boolean).map((c, i) => (
                <div key={i} style={{ fontSize: 11, marginBottom: 5, wordBreak: 'break-word', color: pal.onDark }}>{c}</div>
              ))}

              {order.filter((id) => railKeys.includes(id)).map(renderSection)}
            </div>

            {/* Main — the whole narrative, summary included */}
            <div style={{ width: '68%', padding: '34px 30px', fontSize: 12.5, lineHeight: 1.5 }}>
              {order.filter((id) => !railKeys.includes(id)).map(renderSection)}
            </div>
      </div>
  );
}
