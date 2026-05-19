import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { ParsedResume } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resume, jdText, jobTitle } = await req.json() as {
      resume: ParsedResume;
      jdText: string;
      jobTitle: string;
    };

    const recentRole = resume.experience[0]
      ? `${resume.experience[0].title} at ${resume.experience[0].company}`
      : 'professional';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a professional cover letter for a ${jobTitle} position.

Candidate details:
- Name: ${resume.contact.name}
- Current/Recent Role: ${recentRole}
- Top Skills: ${resume.skills.slice(0, 8).join(', ')}
- Summary: ${resume.summary}
- Notice Period: ${resume.noticePeriod || 'immediately available'}

Job Description:
${jdText.slice(0, 2000)}

Rules:
- 3 concise paragraphs
- Para 1: Express interest in the exact role, reference one specific detail from the JD
- Para 2: Connect 2-3 resume achievements directly to JD requirements — be specific, use numbers from the resume if available
- Para 3: Reiterate fit, mention availability/notice period, professional call to action
- Tone: Professional but human, suitable for Indian corporate market
- Do NOT fabricate metrics or companies not in the resume
- Do NOT include address headers, date, or subject line
- End with exactly: "Regards,\n${resume.contact.name}"
- Return only the cover letter body, no preamble or explanation`,
      }],
    });

    const coverLetter = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter generation error', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
