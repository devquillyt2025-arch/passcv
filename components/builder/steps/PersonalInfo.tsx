'use client';

import { useResumeStore } from '@/lib/store/useResumeStore';

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{children}</p>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

export default function PersonalInfo({ headless = false }: { headless?: boolean }) {
  const { contact } = useResumeStore((state) => state.data);
  const updateContact = useResumeStore((state) => state.updateContact);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateContact({ [e.target.name]: e.target.value });
  };

  const inputCls =
    'w-full rounded-[8px] border border-[#E2E8F0] bg-white px-[14px] py-[10px] text-[14px] text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus:border-[var(--accent-color)] focus:ring-[3px] focus:ring-[var(--accent-ring)] focus:outline-none';

  return (
    <div className="space-y-5">
      {!headless && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-500 mt-1">Make sure recruiters can easily reach you.</p>
        </div>
      )}

      {/* ─ Identity ─────────────────────────────── */}
      <FieldGroup>
        <GroupLabel>Identity</GroupLabel>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
            <input type="text" name="firstName" value={contact.firstName} onChange={handleChange} className={inputCls} placeholder="John" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
            <input type="text" name="lastName" value={contact.lastName} onChange={handleChange} className={inputCls} placeholder="Doe" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Professional Title</label>
          <input type="text" name="jobTitle" value={contact.jobTitle} onChange={handleChange} className={inputCls} placeholder="e.g. Senior Software Engineer" />
        </div>
      </FieldGroup>

      <div className="border-t border-slate-100" />

      {/* ─ Contact ───────────────────────────────── */}
      <FieldGroup>
        <GroupLabel>Contact</GroupLabel>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
          <input type="email" name="email" value={contact.email} onChange={handleChange} className={inputCls} placeholder="john@example.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
            <input type="tel" name="phone" value={contact.phone} onChange={handleChange} className={inputCls} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
            <input type="text" name="city" value={contact.city} onChange={handleChange} className={inputCls} placeholder="San Francisco" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Country</label>
          <input type="text" name="country" value={contact.country} onChange={handleChange} className={inputCls} placeholder="USA" />
        </div>
      </FieldGroup>

      <div className="border-t border-slate-100" />

      {/* ─ Online Presence ───────────────────────── */}
      <FieldGroup>
        <GroupLabel>Online Presence</GroupLabel>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">LinkedIn</label>
            <input type="url" name="linkedin" value={contact.linkedin} onChange={handleChange} className={inputCls} placeholder="linkedin.com/in/johndoe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">GitHub / Portfolio</label>
            <input type="url" name="github" value={contact.github} onChange={handleChange} className={inputCls} placeholder="github.com/johndoe" />
          </div>
        </div>
      </FieldGroup>
    </div>
  );
}
