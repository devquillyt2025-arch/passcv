import { ResumeData } from '../../types';

export const emptyResumeData: ResumeData = {
  contact: {
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

export const DEMO_RESUME_DATA: ResumeData = {
  contact: {
    firstName: 'Alex',
    lastName: 'Chen',
    jobTitle: 'Senior Software Engineer',
    email: 'alex.chen@example.com',
    phone: '+1 (555) 234-5678',
    city: 'San Francisco',
    country: 'USA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    website: '',
  },
  summary:
    'Results-driven Software Engineer with 6+ years of experience designing and delivering scalable web applications. Led cross-functional teams to ship products serving 2M+ users. Deep expertise in React, TypeScript, and cloud architecture.',
  skills: [
    { id: 'sk1', name: 'React.js', level: 'Expert' },
    { id: 'sk2', name: 'TypeScript', level: 'Expert' },
    { id: 'sk3', name: 'Node.js', level: 'Advanced' },
    { id: 'sk4', name: 'PostgreSQL', level: 'Advanced' },
    { id: 'sk5', name: 'AWS', level: 'Intermediate' },
    { id: 'sk6', name: 'Docker', level: 'Intermediate' },
    { id: 'sk7', name: 'GraphQL', level: 'Advanced' },
    { id: 'sk8', name: 'Python', level: 'Intermediate' },
  ],
  experience: [
    {
      id: 'ex1',
      company: 'Stripe',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2021-06',
      endDate: '',
      currentlyWorking: true,
      description:
        '• Led development of merchant payment dashboard used by 500K+ businesses\n• Reduced page load time by 40% via code splitting and lazy loading\n• Mentored 3 junior engineers and conducted 50+ code reviews\n• Architected microservices migration cutting infrastructure costs by $120K/year',
    },
    {
      id: 'ex2',
      company: 'Airbnb',
      position: 'Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2019-03',
      endDate: '2021-05',
      currentlyWorking: false,
      description:
        '• Built search ranking algorithm improving booking conversion by 18%\n• Developed host dashboard features serving 4M+ active hosts worldwide\n• Collaborated in cross-functional Agile sprints shipping bi-weekly releases',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2015-08',
      endDate: '2019-05',
      currentlyStudying: false,
      score: '3.8 / 4.0',
    },
  ],
  projects: [
    {
      id: 'pr1',
      name: 'OpenMetrics',
      description:
        '• Open-source observability dashboard with 2.1K GitHub stars\n• Built with Next.js, ClickHouse, and Grafana; adopted by 200+ engineering teams',
      url: 'github.com/alexchen/openmetrics',
      startDate: '2022-01',
      endDate: '2023-06',
    },
  ],
  certifications: [],
  languages: [],
};
