import Anthropic from '@anthropic-ai/sdk';
import { ParsedResume, ParsedJD, RewrittenResume } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSystemPrompt(keywords: string[]): string {
  return `You are an expert ATS resume writer for Indian job markets.

You will rewrite the candidate's resume to match the target job description.

STRICT RULES:
- Use these exact keywords naturally throughout the rewrite: ${keywords.join(", ")}
- Every experience bullet must reference at least one keyword from the list above
- Mirror the JD's exact terminology — if JD says "vector databases", use "vector databases" not "database systems"
- Rewrite summary to open with the exact job title from the JD
- Skills section must list ALL matched keywords first, then remaining candidate skills
- Never fabricate tools, companies, dates, or metrics the candidate hasn't mentioned
- Remove bullets that have zero relevance to the JD
- Keep all company names, job titles, and dates exactly as provided

Return ONLY valid JSON with the same structure as the input resume object. No explanation.`;
}

export async function rewriteResume(
  resume: ParsedResume,
  jd: ParsedJD,
  jdRawText: string
): Promise<RewrittenResume> {
  // Step 1: Extract keywords from JD first
  const keywordResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Extract the top 20 ATS keywords from this job description. 
      Return ONLY a JSON array of strings. No explanation.
      Prioritise: tools, technologies, frameworks, skills, and action verbs.
      JD: ${jdRawText}`
    }]
  });

  const kwText = keywordResponse.content[0].type === 'text' ? keywordResponse.content[0].text : '[]';
  const kwMatch = kwText.match(/\[[\s\S]*\]/);
  const keywords: string[] = kwMatch ? JSON.parse(kwMatch[0]) : [];

  const prompt = buildRewritePrompt(resume, jdRawText, keywords);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: getSystemPrompt(keywords),
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude returned invalid JSON');

  const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return parsed as RewrittenResume;
}

function buildRewritePrompt(resume: ParsedResume, jdRawText: string, keywords: string[]): string {
  return `
TARGET JD KEYWORDS: ${keywords.join(", ")}

ORIGINAL RESUME:
${JSON.stringify(resume)}

TARGET JOB DESCRIPTION:
${jdRawText}

Rewrite the resume JSON to maximally match this JD using the keywords above.
`;
}
