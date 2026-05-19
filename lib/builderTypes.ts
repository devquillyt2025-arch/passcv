export interface BuilderContact {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface BuilderExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface BuilderEducation {
  degree: string;
  field: string;
  institution: string;
  year: string;
  cgpa: string;
}

export interface BuilderData {
  contact: BuilderContact;
  summary: string;
  skills: string[];
  experience: BuilderExperience[];
  education: BuilderEducation[];
  certifications: string[];
}

export const EMPTY_EXPERIENCE: BuilderExperience = {
  title: '',
  company: '',
  startDate: '',
  endDate: '',
  bullets: [''],
};

export const EMPTY_EDUCATION: BuilderEducation = {
  degree: '',
  field: '',
  institution: '',
  year: '',
  cgpa: '',
};

export const EMPTY_BUILDER_DATA: BuilderData = {
  contact: { name: '', email: '', phone: '', location: '', linkedin: '' },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
};
