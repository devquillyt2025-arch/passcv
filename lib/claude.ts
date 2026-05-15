import Anthropic from '@anthropic-ai/sdk';
import { ParsedResume, ParsedJD, RewrittenResume } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert resume writer specialising in optimising resumes for Indian job markets — Naukri, LinkedIn, and company ATS systems (Taleo, Keka, Darwinbox, Workday).

CRITICAL RULES — you must follow these without exception:
- You are REWRITING, NOT FABRICATING. Preserve all factual content. Enhance framing, not facts.
- Do NOT invent job titles, companies, or dates not in the original
- Do NOT add skills or tools not evidenced by the original resume
- Do NOT fabricate or change quantitative metrics (if original says "increased sales", do NOT add "by 40%")
- Do NOT remove any work experience entry
- Do NOT alter education credentials
- If original has no metrics, use strong action verbs but do NOT invent numbers

OUTPUT FORMAT: Always respond with valid JSON matching the exact schema requested.`;

export async function rewriteResume(
  resume: ParsedResume,
  jd: ParsedJD,
  jdRawText: string
): Promise<RewrittenResume> {
  const prompt = buildRewritePrompt(resume, jd, jdRawText);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude returned invalid JSON');

  const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return parsed as RewrittenResume;
}

function buildRewritePrompt(resume: ParsedResume, jd: ParsedJD, jdRawText: string): string {
  return `Rewrite this resume to be optimised for the following job description. Return ONLY valid JSON.

## JOB DESCRIPTION
Title: ${jd.jobTitle}
Domain: ${jd.domain}
Seniority: ${jd.seniorityLevel}
Required Skills: ${jd.requiredSkills.join(', ')}
Preferred Skills: ${jd.preferredSkills.join(', ')}

Full JD:
${jdRawText.slice(0, 2000)}

## ORIGINAL RESUME
${JSON.stringify(resume, null, 2)}

## REWRITE INSTRUCTIONS

**Summary (Step 1):** Rewrite the professional summary to:
- Incorporate the most important JD keywords naturally
- Match the seniority level: ${jd.seniorityLevel}
- Use third-person voice, no pronouns ("I", "my")
- Max 4 lines
- No generic phrases like "hardworking professional", "dynamic individual", "results-driven"

**Experience bullets (Step 2):** For each job entry:
- Rewrite bullets to be achievement-focused
- Quantify where the original already has numbers (do NOT add new numbers)
- Naturally insert missing JD keywords ONLY where they're legitimately inferable from the candidate's actual work
- Start each bullet with a strong action verb
- Keep bullets concise (1–2 lines max)

**Skills (Step 3):**
- Reorder skills by relevance to this JD (most relevant first)
- Add missing MUST-HAVE keywords from JD ONLY if legitimately inferable from experience
- Do NOT add skills not supported by the resume

**Formatting (Step 4):**
- Standardise all dates to "Mon YYYY – Mon YYYY" format (e.g., "Jun 2022 – Mar 2024")
- Section order: summary → skills → experience → education → certifications

**Naukri Profile Text (Step 5):**
- Write a separate 150-word "About Me" block for Naukri's profile summary field
- Keyword-dense but readable
- Third person, no pronouns

## OUTPUT JSON SCHEMA
Return this exact JSON structure:
\`\`\`json
{
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string or empty"
  },
  "summary": "rewritten 3-4 line summary",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or Present",
      "bullets": ["rewritten bullet 1", "rewritten bullet 2"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "year": "YYYY or Mon YYYY",
      "cgpa": "string or empty"
    }
  ],
  "skills": ["skill1", "skill2"],
  "certifications": ["cert1"],
  "naukriProfileText": "150-word Naukri about me text",
  "noticePeriod": "string or empty",
  "ctc": "string or empty"
}
\`\`\``;
}
