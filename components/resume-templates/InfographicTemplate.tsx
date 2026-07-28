import type { CSSProperties } from 'react';
import { TemplateProps, fullName, initials, range, bullets, degreeLine, has, SHEET_H, palette } from './shared';

// Template 6 — INFOGRAPHIC: avatar header, dot proficiency meters, sky-blue accents, two-column.
const sans = '"Segoe UI", system-ui, -apple-system, sans-serif';

function Dots({ filled, color, track }: { filled: number; color: string; track: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < filled ? color : track }} />
      ))}
    </span>
  );
}

export default function InfographicTemplate({ data, sectionOrder, builderDesign }: TemplateProps) {
  const pal = palette(builderDesign, '#0ea5e9');
  const SKY = pal.accentInk;
  const { contact } = data;
  const label: CSSProperties = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: SKY, margin: '0 0 9px' };

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
                  <div style={{ ...label, marginTop: 4 }}>{customSection.title}</div>
                  {customSection.items.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 11, color: SKY }}>{p.url}</div>}
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
          case 'summary': return data.summary ? (<div key={id}><div style={{ marginBottom: 16 }}>
                  <div style={label}>Profile</div>
                  <p style={{ margin: 0, color: pal.inkMuted }}>{data.summary}</p>
                </div></div>) : null;
          case 'skills': return has(data.skills) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={label}>Skills</div>
                  {data.skills.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                      <span style={{ fontSize: 11.5 }}>{s.name}</span>
                      <Dots filled={Math.max(3, 5 - (i % 3))} color={SKY} track={pal.rule} />
                    </div>
                  ))}
                </div></div>) : null;
          case 'experience': return has(data.experience) ? (<div key={id}><>
                  <div style={label}>Experience</div>
                  {data.experience.map((e) => (
                    <div key={e.id} style={{ marginBottom: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{e.position}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{range(e.startDate, e.endDate, e.currentlyWorking)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: SKY, fontWeight: 700 }}>{[e.company, e.location].filter(Boolean).join(' · ')}</div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'education': return has(data.education) ? (<div key={id}><div>
                  <div style={label}>Education</div>
                  {data.education.map((e) => (
                    <div key={e.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{degreeLine(e)}</div>
                      <div style={{ fontSize: 11, color: pal.inkFaint }}>{e.institution}</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{range(e.startDate, e.endDate, e.currentlyStudying)}</div>
                    </div>
                  ))}
                </div></div>) : null;
          case 'projects': return has(data.projects) ? (<div key={id}><>
                  <div style={{ ...label, marginTop: 4 }}>Projects</div>
                  {data.projects.map((p) => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 11, color: SKY }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'certifications': return has(data.certifications) ? (<div key={id}><>
                  <div style={{ ...label, marginTop: 4 }}>Certifications</div>
                  {data.certifications.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                      {p.credentialUrl && <div style={{ fontSize: 11, color: SKY }}>{p.credentialUrl}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'languages': return has(data.languages) ? (<div key={id}><div style={{ marginBottom: 20 }}>
                  <div style={label}>Languages</div>
                  {data.languages.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                      <span style={{ fontSize: 11.5 }}>{`${s.name} - ${s.proficiency}`}</span>
                      <Dots filled={Math.max(3, 5 - (i % 3))} color={SKY} track={pal.rule} />
                    </div>
                  ))}
                </div></div>) : null;
          case 'awards': return has(data.awards) ? (<div key={id}><>
                  <div style={{ ...label, marginTop: 4 }}>Awards</div>
                  {data.awards.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                      {p.url && <div style={{ fontSize: 11, color: SKY }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'volunteer': return has(data.volunteer) ? (<div key={id}><>
                  <div style={label}>Volunteer</div>
                  {data.volunteer.map((e: any) => (
                    <div key={e.id} style={{ marginBottom: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{e.role}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{range(e.startDate, e.endDate, e.currentlyVolunteering)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: SKY, fontWeight: 700 }}>{[e.organization, e.location].filter(Boolean).join(' · ')}</div>
                      <ul style={{ margin: '4px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(e.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'courses': return has(data.courses) ? (<div key={id}><>
                  <div style={{ ...label, marginTop: 4 }}>Courses</div>
                  {data.courses.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.name}</div>
                      {p.certificateUrl && <div style={{ fontSize: 11, color: SKY }}>{p.certificateUrl}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
                        {bullets(p.description).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </></div>) : null;
          case 'publications': return has(data.publications) ? (<div key={id}><>
                  <div style={{ ...label, marginTop: 4 }}>Publications</div>
                  {data.publications.map((p: any) => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.title}</div>
                      {p.url && <div style={{ fontSize: 11, color: SKY }}>{p.url}</div>}
                      <ul style={{ margin: '3px 0 0', paddingLeft: 17, color: pal.inkMuted }}>
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
    <div style={{ fontFamily: sans, color: pal.ink, minHeight: SHEET_H }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '28px 36px 22px', borderBottom: `3px solid ${SKY}` }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: SKY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
          {initials(contact)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{fullName(contact)}</h1>
          {contact.jobTitle && <div style={{ fontSize: 13, color: pal.accentInk, fontWeight: 600 }}>{contact.jobTitle}</div>}
          <div style={{ fontSize: 11, color: pal.inkFaint, marginTop: 6 }}>
            {[contact.email, contact.phone, [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin, contact.github].filter(Boolean).join('   ·   ')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Left */}
        <div style={{ width: '35%', background: '#f8fafc', padding: '24px 22px' }}>
              {order.filter(id => leftKeys.includes(id)).map(renderSection)}
              </div>

        {/* Right */}
        <div style={{ width: '65%', padding: '24px 26px', fontSize: 12.5, lineHeight: 1.5 }}>
              {order.filter(id => !leftKeys.includes(id)).map(renderSection)}
              </div>
      </div>
    </div>
  );
}
