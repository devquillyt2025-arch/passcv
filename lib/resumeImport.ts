import { v4 as uuidv4 } from 'uuid';
import { ParsedResume, ResumeData } from '@/lib/types';

export function parsedToBuilderData(parsed: ParsedResume): ResumeData {
  const parts = (parsed.contact.name || '').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ');

  const locationParts = (parsed.contact.location || '').split(',');
  const city = locationParts[0]?.trim() || '';
  const country = locationParts[1]?.trim() || '';

  return {
    contact: {
      firstName,
      lastName,
      jobTitle: parsed.experience[0]?.title || '',
      email: parsed.contact.email || '',
      phone: parsed.contact.phone || '',
      city,
      country,
      linkedin: parsed.contact.linkedin || '',
      github: '',
      website: '',
    },
    summary: parsed.summary || '',
    experience: (parsed.experience || []).map(exp => ({
      id: uuidv4(),
      company: exp.company || '',
      position: exp.title || '',
      location: '',
      startDate: exp.startDate || '',
      endDate: (exp.endDate || '').toLowerCase().includes('present') ? '' : (exp.endDate || ''),
      currentlyWorking: (exp.endDate || '').toLowerCase().includes('present'),
      description: (exp.bullets || []).join('\n'),
    })),
    education: (parsed.education || []).map(edu => ({
      id: uuidv4(),
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      location: '',
      startDate: '',
      endDate: edu.year || '',
      currentlyStudying: false,
      score: edu.cgpa || '',
    })),
    skills: (parsed.skills || []).map(skill => ({
      id: uuidv4(),
      name: skill,
      level: 'Intermediate' as const,
    })),
    projects: [],
  };
}
