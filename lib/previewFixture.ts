import type { ResumeData } from '@/lib/types';

/** Rich fixture used only by the dev-only template preview harness. */
export const PREVIEW_RESUME: ResumeData = {
  contact: {
    firstName: 'Priyanka',
    lastName: 'Ramachandran',
    jobTitle: 'Senior Platform Engineer',
    email: 'priyanka.ramachandran@example.com',
    phone: '+91 98450 11234',
    city: 'Bengaluru',
    country: 'India',
    linkedin: 'linkedin.com/in/priyanka-r',
    github: 'github.com/priyanka-r',
    website: 'priyanka.dev',
  },
  summary:
    'Platform engineer with nine years building and operating distributed systems for high-traffic consumer products. Led the migration of a monolithic billing service to an event-driven architecture serving 40M monthly active users, cutting p99 latency by 62%.',
  experience: [
    {
      id: 'e1',
      company: 'Northwind Commerce',
      position: 'Senior Platform Engineer',
      location: 'Bengaluru, India',
      startDate: '2021-03',
      endDate: '',
      currentlyWorking: true,
      description:
        'Designed and shipped an event-driven billing pipeline handling 12M transactions per day.\nReduced infrastructure spend by 34% by right-sizing Kubernetes workloads and introducing spot capacity.\nMentored six engineers; three were promoted within eighteen months.',
    },
    {
      id: 'e2',
      company: 'Fielded Systems',
      position: 'Infrastructure Engineer',
      location: 'Pune, India',
      startDate: '2018-06',
      endDate: '2021-02',
      currentlyWorking: false,
      description:
        'Built the internal CI platform used by 200+ engineers across fourteen product teams.\nCut median build time from 22 minutes to 6 minutes through aggressive caching and test sharding.',
    },
    {
      id: 'e3',
      company: 'Cobalt Labs',
      position: 'Backend Developer',
      location: 'Chennai, India',
      startDate: '2016-07',
      endDate: '2018-05',
      currentlyWorking: false,
      description:
        'Owned the public REST API consumed by 60 partner integrations.\nIntroduced contract testing that eliminated a recurring class of breaking-change incidents.',
    },
  ],
  education: [
    {
      id: 'ed1',
      institution: 'National Institute of Technology, Trichy',
      degree: 'B.Tech',
      field: 'Computer Science and Engineering',
      location: 'Tiruchirappalli, India',
      startDate: '2012-08',
      endDate: '2016-05',
      currentlyStudying: false,
      score: '8.7/10',
    },
    {
      id: 'ed2',
      institution: 'Indian Institute of Science',
      degree: 'M.Tech',
      field: 'Distributed Computing',
      location: 'Bengaluru, India',
      startDate: '2019-08',
      endDate: '2021-06',
      currentlyStudying: false,
      score: '9.1/10',
    },
  ],
  skills: [
    { id: 's1', name: 'Go', level: 'Expert' },
    { id: 's2', name: 'Kubernetes', level: 'Expert' },
    { id: 's3', name: 'PostgreSQL', level: 'Advanced' },
    { id: 's4', name: 'Terraform', level: 'Advanced' },
    { id: 's5', name: 'Kafka', level: 'Advanced' },
    { id: 's6', name: 'TypeScript', level: 'Advanced' },
    { id: 's7', name: 'Observability', level: 'Advanced' },
    { id: 's8', name: 'gRPC', level: 'Intermediate' },
    { id: 's9', name: 'AWS', level: 'Advanced' },
    { id: 's10', name: 'System Design', level: 'Expert' },
  ],
  projects: [
    {
      id: 'p1',
      name: 'Driftwood',
      description:
        'Open-source schema migration tool for Postgres with automatic rollback planning.\nAdopted by 40+ companies; 3.2k GitHub stars.',
      url: 'github.com/priyanka-r/driftwood',
      startDate: '2022-01',
      endDate: '',
    },
    {
      id: 'p2',
      name: 'Ledgerlite',
      description: 'Double-entry accounting library in Go with deterministic replay.',
      url: 'github.com/priyanka-r/ledgerlite',
      startDate: '2020-04',
      endDate: '2021-09',
    },
  ],
  certifications: [
    {
      id: 'c1',
      name: 'Certified Kubernetes Administrator',
      issuer: 'CNCF',
      issueDate: '2021-09',
      expiryDate: '2024-09',
      doesNotExpire: false,
      credentialId: 'CKA-2021-8842',
      credentialUrl: 'cncf.io/verify/CKA-2021-8842',
    },
    {
      id: 'c2',
      name: 'AWS Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2022-04',
      expiryDate: '2025-04',
      doesNotExpire: false,
      credentialId: 'AWS-SAP-55110',
      credentialUrl: 'aws.amazon.com/verify/55110',
    },
  ],
  languages: [
    { id: 'l1', name: 'English', proficiency: 'Fluent' },
    { id: 'l2', name: 'Tamil', proficiency: 'Native Speaker' },
    { id: 'l3', name: 'Hindi', proficiency: 'Professional Working Proficiency' },
  ],
  publications: [
    {
      id: 'pub1',
      title: 'Bounded Staleness in Multi-Region Ledgers',
      publisher: 'ACM SoCC',
      date: '2023-11',
      coAuthors: 'A. Menon, R. Iyer',
      url: 'dl.acm.org/doi/10.1145/example',
    },
  ],
  courses: [
    {
      id: 'co1',
      name: 'Distributed Systems (6.824)',
      platform: 'MIT OpenCourseWare',
      completionDate: '2020-12',
      certificateUrl: 'ocw.mit.edu/certificates/example',
    },
  ],
  awards: [
    {
      id: 'a1',
      name: 'Engineering Excellence Award',
      issuer: 'Northwind Commerce',
      date: '2023-02',
      description: 'Awarded to two engineers annually out of a 400-person organisation.',
    },
  ],
  volunteer: [
    {
      id: 'v1',
      organization: 'Code for Bengaluru',
      role: 'Technical Mentor',
      location: 'Bengaluru, India',
      startDate: '2019-01',
      endDate: '',
      currentlyVolunteering: true,
      description:
        'Mentor a cohort of twelve first-generation graduates through their first backend project each year.',
    },
  ],
  customSections: [],
};
