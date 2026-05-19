'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';

interface Props {
  editable?: boolean;
}

// Textarea that auto-resizes to its content
function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onInput={e => {
        const el = e.currentTarget;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }}
      placeholder={placeholder}
      rows={2}
      className={className}
      style={{ resize: 'none', overflow: 'hidden' }}
    />
  );
}

// Shared style: looks like resume text but signals "editable"
const fieldCls = (base: string) =>
  `${base} w-full bg-amber-50 border border-amber-200 rounded outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 placeholder-gray-300 transition-colors`;

function SectionRule({ title }: { title: string }) {
  return (
    <div className="mt-4 mb-1.5">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-indigo-900">{title}</p>
      <div className="border-t border-indigo-900 mt-0.5 opacity-70" />
    </div>
  );
}

export default function ResumeCanvas({ editable = false }: Props) {
  const data = useResumeStore((state) => state.data);
  const updateContact = useResumeStore((state) => state.updateContact);
  const updateSummary = useResumeStore((state) => state.updateSummary);
  const updateExperience = useResumeStore((state) => state.updateExperience);

  const contactParts = [
    data.contact.email,
    data.contact.phone,
    [data.contact.city, data.contact.country].filter(Boolean).join(', '),
    data.contact.linkedin,
    data.contact.github || data.contact.website,
  ].filter(Boolean);

  return (
    <div className="bg-white font-sans" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Edit hint banner */}
      {editable && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-center">
          <p className="text-[9.5px] text-amber-700 font-medium">
            ✏ Highlighted fields are editable — click to type
          </p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="text-center">
        {editable ? (
          <div className="flex justify-center gap-2">
            <input
              value={data.contact.firstName}
              onChange={e => updateContact({ firstName: e.target.value })}
              placeholder="First Name"
              className={fieldCls('text-[19px] font-bold text-indigo-900 text-right px-2 py-0.5 w-32')}
            />
            <input
              value={data.contact.lastName}
              onChange={e => updateContact({ lastName: e.target.value })}
              placeholder="Last Name"
              className={fieldCls('text-[19px] font-bold text-indigo-900 text-left px-2 py-0.5 w-32')}
            />
          </div>
        ) : (
          <p className="text-[19px] font-bold text-indigo-900 leading-tight">
            {data.contact.firstName || data.contact.lastName ? `${data.contact.firstName} ${data.contact.lastName}` : <span className="text-gray-300 italic text-base">Your Name</span>}
          </p>
        )}
        
        {data.contact.jobTitle && (
          <p className="text-[12px] font-semibold text-gray-700 mt-1">
            {data.contact.jobTitle}
          </p>
        )}

        {contactParts.length > 0 && (
          <p className="text-[9.5px] text-gray-500 mt-1 leading-snug">
            {contactParts.join('  |  ')}
          </p>
        )}
      </div>

      {/* Header rule */}
      <div className="mt-2 border-t-[1.5px] border-indigo-900" />

      {/* ── Summary ── */}
      {(data.summary || editable) && (
        <>
          <SectionRule title="Summary" />
          {editable ? (
            <AutoTextarea
              value={data.summary}
              onChange={updateSummary}
              placeholder="Write your professional summary…"
              className={fieldCls('text-[11px] text-gray-800 leading-[1.6] px-2 py-1')}
            />
          ) : (
            <p className="text-[11px] text-gray-800 leading-[1.6]">{data.summary}</p>
          )}
        </>
      )}

      {/* ── Skills ── */}
      {data.skills.length > 0 && (
        <>
          <SectionRule title="Skills" />
          <p className="text-[11px] text-gray-800 leading-[1.6]">
            {data.skills.map(s => s.name).join(' • ')}
          </p>
        </>
      )}

      {/* ── Work Experience ── */}
      {data.experience.length > 0 && (
        <>
          <SectionRule title="Work Experience" />
          <div className="space-y-3">
            {data.experience.map((job) => {
              const titleCompany = [job.position, job.company].filter(Boolean).join(' — ');
              const dateRange = [job.startDate, job.currentlyWorking ? 'Present' : job.endDate].filter(Boolean).join(' – ');
              const filledBullets = job.description.split('\n').map(b => b.trim()).filter(Boolean).map(b => b.replace(/^[-•]\s*/, ''));

              return (
                <div key={job.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-900">
                      {titleCompany || <span className="text-gray-300 italic">Job Title — Company</span>}
                    </span>
                    {(dateRange || job.location) && (
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {job.location ? `${job.location} | ` : ''}{dateRange}
                      </span>
                    )}
                  </div>

                  {editable ? (
                    <div className="mt-1">
                      <AutoTextarea
                        value={job.description}
                        onChange={v => updateExperience(job.id, { description: v })}
                        placeholder="• Describe your achievements..."
                        className={fieldCls('text-[11px] text-gray-800 leading-[1.5] px-2 py-1')}
                      />
                    </div>
                  ) : filledBullets.length > 0 && (
                    <ul className="mt-0.5 space-y-0.5">
                      {filledBullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex gap-1.5 text-[11px] text-gray-800 leading-[1.5]">
                          <span className="shrink-0 text-gray-500 pt-px">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <>
          <SectionRule title="Education" />
          <div className="space-y-1.5">
            {data.education.map((edu) => {
              const degreeField = [edu.degree, edu.field ? `in ${edu.field}` : '']
                .filter(Boolean).join(' ').trim();
              
              const dateRange = [edu.startDate, edu.currentlyStudying ? 'Present' : edu.endDate].filter(Boolean).join(' – ');
              
              const instParts = [
                edu.institution,
                edu.location,
                dateRange ? `(${dateRange})` : '',
                edu.score ? `• ${edu.score}` : '',
              ].filter(Boolean).join('  ');

              return (
                <div key={edu.id}>
                  {degreeField && (
                    <p className="text-[11px] font-bold text-gray-900">{degreeField}</p>
                  )}
                  {instParts && (
                    <p className="text-[11px] text-gray-500">{instParts}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Projects ── */}
      {data.projects.length > 0 && (
        <>
          <SectionRule title="Projects" />
          <div className="space-y-3">
            {data.projects.map((proj) => {
              const nameUrl = [proj.name, proj.url].filter(Boolean).join(' — ');
              const dateRange = [proj.startDate, proj.endDate].filter(Boolean).join(' – ');
              const filledBullets = proj.description.split('\n').map(b => b.trim()).filter(Boolean).map(b => b.replace(/^[-•]\s*/, ''));

              return (
                <div key={proj.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-900">
                      {nameUrl || <span className="text-gray-300 italic">Project Name</span>}
                    </span>
                    {dateRange && (
                      <span className="text-[10px] text-gray-500 shrink-0">{dateRange}</span>
                    )}
                  </div>
                  
                  {filledBullets.length > 0 && !editable && (
                    <ul className="mt-0.5 space-y-0.5">
                      {filledBullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex gap-1.5 text-[11px] text-gray-800 leading-[1.5]">
                          <span className="shrink-0 text-gray-500 pt-px">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
