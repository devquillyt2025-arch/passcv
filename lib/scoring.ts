import { ParsedResume, ParsedJD, ATSScore } from './types';

const TECH_KEYWORDS = [
  'python', 'java', 'javascript', 'typescript', 'react', 'node', 'nodejs', 'angular', 'vue',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'git', 'linux', 'rest', 'api', 'graphql', 'microservices', 'agile', 'scrum', 'jira', 'confluence',
  'spring', 'django', 'flask', 'express', 'tailwind', 'css', 'html', 'figma', 'excel', 'powerbi',
  'tableau', 'spark', 'hadoop', 'kafka', 'elasticsearch', 'terraform', 'jenkins', 'ci/cd',
  'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'pandas', 'numpy',
  'product management', 'roadmap', 'stakeholder', 'analytics', 'ab testing', 'user research',
  'salesforce', 'sap', 'power bi', 'data analysis', 'data science', 'etl', 'data warehouse',
];

const SOFT_SKILL_KEYWORDS = [
  'leadership', 'communication', 'collaboration', 'problem solving', 'analytical',
  'team player', 'cross-functional', 'strategic', 'innovation', 'mentoring',
];

const ACTION_VERBS = [
  'led', 'built', 'developed', 'managed', 'increased', 'reduced', 'improved',
  'delivered', 'launched', 'designed', 'implemented', 'created', 'achieved',
  'drove', 'optimised', 'optimized', 'spearheaded', 'established', 'streamlined',
  'automated', 'migrated', 'deployed', 'architected', 'engineered', 'scaled',
  'negotiated', 'onboarded', 'trained', 'mentored', 'collaborated', 'owned',
];

const INDIA_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'pune',
  'kolkata', 'ahmedabad', 'noida', 'gurgaon', 'gurugram', 'jaipur', 'bhopal',
  'indore', 'lucknow', 'chandigarh', 'kochi', 'coimbatore', 'surat',
];

export function parseJD(jdText: string): ParsedJD {
  const text = jdText.toLowerCase();
  const lines = jdText.split('\n').map(l => l.trim()).filter(Boolean);

  const jobTitle = lines[0]?.replace(/[*_#]/g, '').trim() || '';

  const yearsMatch = text.match(/(\d+)\+?\s*(?:to\s*\d+)?\s*years?\s*(?:of\s*)?(?:experience|exp)/i);
  const yearsRequired = yearsMatch ? parseInt(yearsMatch[1]) : 0;

  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];
  const tools: string[] = [];

  const requiredSection = extractSection(text, ['required', 'must have', 'mandatory', 'responsibilities']);
  const preferredSection = extractSection(text, ['preferred', 'good to have', 'nice to have', 'plus']);

  TECH_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) {
      if (requiredSection.includes(kw)) {
        requiredSkills.push(kw);
      } else if (preferredSection.includes(kw)) {
        preferredSkills.push(kw);
      } else {
        requiredSkills.push(kw);
      }
    }
  });

  // Extract tools (capitalized single words in JD that look like product names)
  const toolPattern = /\b([A-Z][a-zA-Z]+(?:\.[a-zA-Z]+)?)\b/g;
  let m;
  const seen = new Set<string>();
  while ((m = toolPattern.exec(jdText)) !== null) {
    const t = m[1];
    if (t.length > 2 && !seen.has(t.toLowerCase()) && !['The', 'A', 'An', 'In', 'For', 'And', 'Or', 'With', 'To', 'Of', 'At', 'We', 'You', 'Our', 'Your', 'Is', 'Are', 'Will', 'Be', 'As', 'By', 'This', 'That', 'It', 'Its', 'On', 'From', 'Into'].includes(t)) {
      tools.push(t);
      seen.add(t.toLowerCase());
    }
  }

  const industryKeywords = [...SOFT_SKILL_KEYWORDS.filter(sk => text.includes(sk))];

  const domain = classifyDomain(text);
  const seniorityLevel = classifySeniority(text, yearsRequired);

  return {
    jobTitle,
    requiredSkills: [...new Set(requiredSkills)].slice(0, 30),
    preferredSkills: [...new Set(preferredSkills)].slice(0, 15),
    yearsRequired,
    tools: [...new Set(tools)].slice(0, 20),
    industryKeywords,
    seniorityLevel,
    domain,
  };
}

function extractSection(text: string, headers: string[]): string {
  for (const header of headers) {
    const idx = text.indexOf(header);
    if (idx !== -1) {
      return text.slice(idx, idx + 500);
    }
  }
  return '';
}

function classifyDomain(text: string): string {
  const domains: Record<string, string[]> = {
    'IT Services': ['tcs', 'infosys', 'wipro', 'cognizant', 'it services', 'outsourcing'],
    'Product': ['product manager', 'product management', 'saas', 'product roadmap'],
    'BFSI': ['banking', 'financial', 'insurance', 'fintech', 'bfsi', 'nbfc'],
    'E-commerce': ['ecommerce', 'e-commerce', 'marketplace', 'retail'],
    'Startup': ['startup', 'early stage', 'seed', 'series a'],
    'Data/AI': ['data science', 'machine learning', 'ai', 'analytics', 'data engineer'],
  };

  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some(kw => text.includes(kw))) return domain;
  }
  return 'General';
}

function classifySeniority(text: string, years: number): string {
  if (text.includes('vp ') || text.includes('vice president') || text.includes('director')) return 'Director+';
  if (text.includes('senior manager') || text.includes('sr. manager') || years >= 8) return 'Senior Manager';
  if (text.includes('manager') || years >= 5) return 'Manager';
  if (text.includes('senior') || text.includes('sr.') || years >= 3) return 'Senior';
  if (years <= 1 || text.includes('fresher') || text.includes('entry')) return 'Entry Level';
  return 'Mid Level';
}

export function calculateScore(resume: ParsedResume, jd: ParsedJD): ATSScore {
  const resumeText = buildResumeText(resume);

  // --- Keyword match (40 pts) ---
  const allJDKeywords = [...new Set([...jd.requiredSkills, ...jd.tools.map(t => t.toLowerCase()), ...jd.industryKeywords])];
  const matchedKeywords = allJDKeywords.filter(kw => resumeText.includes(kw.toLowerCase()));
  const missingKeywords = allJDKeywords.filter(kw => !resumeText.includes(kw.toLowerCase()));

  const keywordScore = allJDKeywords.length > 0
    ? Math.round((matchedKeywords.length / allJDKeywords.length) * 40)
    : 30;

  // --- Formatting (20 pts) ---
  let formattingScore = 20;
  const formattingIssues: string[] = [];

  if (resume.hasMultiColumn) {
    formattingScore -= 8;
    formattingIssues.push('Multi-column layout detected — ATS parsers read left-to-right and will scramble your content');
  }
  if (resume.hasTables) {
    formattingScore -= 6;
    formattingIssues.push('Tables detected — replace with plain bullet points for ATS compatibility');
  }
  if (resume.hasImages) {
    formattingScore -= 4;
    formattingIssues.push('Images/graphics found — ATS cannot read image content, remove all photos and icons');
  }
  const badDates = resume.experience.some(e =>
    /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/.test(`${e.startDate} ${e.endDate}`)
  );
  if (badDates) {
    formattingScore -= 2;
    formattingIssues.push('Non-standard date format found — use "Jun 2022 – Mar 2024" format');
  }

  formattingScore = Math.max(formattingScore, 0);

  // --- Naukri-specific (20 pts) ---
  let naukriScore = 0;
  const naukriIssues: string[] = [];

  if (resume.noticePeriod) {
    naukriScore += 5;
  } else {
    // Give partial credit (3pts) if they have a linkedin/github profile — strong online presence
    const hasOnlinePresence = resumeText.includes('linkedin') || resumeText.includes('github');
    if (hasOnlinePresence) {
      naukriScore += 3;
    } else {
      naukriIssues.push('Notice period missing — add "Notice Period: Immediate / 30 days" to your contact section');
    }
  }

  if (resume.ctc) {
    naukriScore += 5;
  } else {
    // Give partial credit (3pts) if contact section is complete (email + phone)
    const hasCompleteContact = !!(resume.contact.email && resume.contact.phone);
    if (hasCompleteContact) {
      naukriScore += 3;
    } else {
      naukriIssues.push('Contact info incomplete — ensure email and phone are filled in');
    }
  }

  if (resume.contact.location) {
    naukriScore += 5;
  } else {
    const cityFound = INDIA_CITIES.some(c => resumeText.includes(c));
    if (cityFound) {
      naukriScore += 5;
    } else {
      naukriIssues.push('Location missing — add your current city (e.g., "Bengaluru, Karnataka")');
    }
  }

  const lastJob = resume.experience[0];
  if (lastJob && jd.jobTitle) {
    const jdWords = jd.jobTitle.toLowerCase().split(/\s+/);
    const hasMatch = jdWords.some(w => w.length > 3 && lastJob.title.toLowerCase().includes(w));
    if (hasMatch) {
      naukriScore += 5;
    } else {
      naukriIssues.push(`Current title "${lastJob.title}" doesn't align with JD title "${jd.jobTitle}" — Naukri ranks by title match`);
    }
  } else {
    naukriScore += 5;
  }

  // --- Content quality (20 pts) ---
  let contentScore = 0;
  const contentIssues: string[] = [];
  const allBullets = resume.experience.flatMap(e => e.bullets);

  if (allBullets.length === 0) {
    contentIssues.push('No bullet points found in work experience — add achievement-focused bullets');
  } else {
    const quantified = allBullets.filter(b => /\d/.test(b));
    const quantRatio = quantified.length / allBullets.length;
    contentScore += Math.round(quantRatio * 10);
    if (quantRatio < 0.3) {
      contentIssues.push(`Only ${quantified.length}/${allBullets.length} bullets have numbers — quantify results (e.g., "reduced load time by 40%")`);
    }

    const withVerbs = allBullets.filter(b => {
      const first = b.trim().toLowerCase().split(/\s+/)[0];
      return ACTION_VERBS.some(v => first.startsWith(v));
    });
    const verbRatio = withVerbs.length / allBullets.length;
    contentScore += Math.round(verbRatio * 5);
    if (verbRatio < 0.5) {
      contentIssues.push('Many bullets don\'t start with action verbs — start each bullet with "Led", "Built", "Drove", etc.');
    }
  }

  if (resume.summary) {
    if (jd.requiredSkills.length === 0) {
      // No JD provided — give full credit for having a summary
      contentScore += 5;
    } else {
      const summaryText = resume.summary.toLowerCase();
      const jdKeywordHits = jd.requiredSkills.slice(0, 10).filter(kw => summaryText.includes(kw)).length;
      const summaryScore = Math.round((jdKeywordHits / Math.min(jd.requiredSkills.length, 10)) * 5);
      contentScore += summaryScore;
      if (summaryScore < 3) {
        contentIssues.push('Professional summary doesn\'t reference key JD skills — tailor it to include role-specific keywords');
      }
    }
  } else {
    contentIssues.push('No professional summary found — add a 3–4 line summary at the top targeting this role');
  }

  contentScore = Math.min(contentScore, 20);

  const total = Math.min(keywordScore + formattingScore + naukriScore + contentScore, 100);

  // Top 5 most impactful fixes
  const allIssues = [
    ...formattingIssues,
    ...naukriIssues,
    ...contentIssues,
    missingKeywords.length > 0
      ? `Add missing keywords to your resume: ${missingKeywords.slice(0, 5).join(', ')}`
      : null,
  ].filter(Boolean) as string[];

  return {
    total,
    breakdown: {
      keyword: keywordScore,
      formatting: formattingScore,
      naukri: naukriScore,
      content: contentScore,
    },
    matchedKeywords,
    missingKeywords,
    formattingIssues,
    naukriIssues,
    contentIssues,
    topFixes: allIssues.slice(0, 5),
  };
}

function buildResumeText(resume: ParsedResume): string {
  return [
    resume.summary,
    resume.skills.join(' '),
    ...resume.experience.map(e => `${e.title} ${e.company} ${e.bullets.join(' ')}`),
    ...resume.education.map(e => `${e.degree} ${e.field} ${e.institution}`),
    resume.certifications.join(' '),
    ...(resume.projects || []).map(p => `${p.name} ${p.description}`),
    ...(resume.languages || []).map(l => `${l.name} ${l.proficiency || ''}`),
    resume.rawText || '',
  ].join(' ').toLowerCase();
}

import { ResumeData } from './types';

export function mapResumeDataToParsedResume(data: ResumeData): ParsedResume {
  return {
    contact: {
      name: `${data.contact.firstName} ${data.contact.lastName}`.trim(),
      email: data.contact.email,
      phone: data.contact.phone,
      location: [data.contact.city, data.contact.country].filter(Boolean).join(', '),
      linkedin: data.contact.linkedin,
    },
    summary: data.summary,
    experience: data.experience.map(e => ({
      company: e.company,
      title: e.position,
      startDate: e.startDate,
      endDate: e.currentlyWorking ? 'Present' : e.endDate,
      bullets: e.description.split('\n').map(b => b.trim()).filter(Boolean).map(b => b.replace(/^[-•]\s*/, '')),
    })),
    education: data.education.map(e => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      year: e.endDate || e.startDate,
      cgpa: e.score,
    })),
    skills: data.skills.map(s => s.name),
    certifications: (data.certifications || []).map(c => c.name),
    projects: (data.projects || []).map(p => ({
      name: p.name,
      description: p.description,
      url: p.url,
      startDate: p.startDate,
      endDate: p.endDate,
    })),
    languages: (data.languages || []).map(l => ({
      name: l.name,
      proficiency: l.proficiency,
    })),
    hasMultiColumn: false,
    hasTables: false,
    hasImages: false,
  };
}
