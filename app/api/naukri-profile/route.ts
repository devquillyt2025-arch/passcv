import { checkAndConsumeCredit } from '@/lib/credits';
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { RewrittenResume, NaukriProfile } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const creditCheck = await checkAndConsumeCredit();
  if (!creditCheck.allowed) {
    return NextResponse.json({ error: creditCheck.error }, { status: 402 });
  }

  try {
    const { resume, jobTitle } = await req.json() as {
      resume: RewrittenResume;
      jobTitle: string;
    };

    const expSummary = resume.experience
      .slice(0, 3)
      .map(e => `${e.title} at ${e.company} (${e.startDate}–${e.endDate})`)
      .join(', ');

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{
        role: 'user',
        content: `Generate a structured Naukri profile for a candidate targeting a ${jobTitle} role.

Candidate:
- Summary: ${resume.summary}
- Skills: ${resume.skills.join(', ')}
- Experience: ${expSummary}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "headline": "...",
  "summary": "...",
  "keySkills": ["skill1", "skill2", ...]
}

Rules:
- headline: max 250 chars, format: "Job Title | X Years | Skill1, Skill2, Skill3"
- summary: max 2500 chars, 3-4 sentences written in first person, keyword-dense for Naukri search, NO bullet points
- keySkills: exactly 15 strings, most ATS-relevant first, mix of technical and domain skills`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid response from Claude');

    const profile = JSON.parse(match[0]) as NaukriProfile;

    // Enforce char limits
    profile.headline = (profile.headline || '').slice(0, 250);
    profile.summary = (profile.summary || '').slice(0, 2500);
    profile.keySkills = (profile.keySkills || []).slice(0, 15);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Naukri profile generation error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
