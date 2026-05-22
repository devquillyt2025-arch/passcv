import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { experience, skills, jobTitle } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const expText = experience?.map((e: { position: string, company: string, startDate: string, endDate: string, description: string }) => `${e.position} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})\n${e.description}`).join('\n\n') || 'No experience provided.';
    const skillsText = skills?.map((s: { name: string }) => s.name).join(', ') || 'No skills provided.';

    const prompt = `You are an expert resume writer. Generate a professional, compelling, and ATS-optimized resume summary (3-4 sentences max) for a candidate with the following background. 
Focus on their most significant achievements, core expertise, and value proposition. Do not use first-person pronouns (I, me, my). Be concise and punchy.

Target Job Title / Role: ${jobTitle || 'Not specified'}

Experience:
${expText}

Skills:
${skillsText}

Return ONLY the generated summary text. Do not include any intro, outro, or quotes.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Using haiku for speed
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const summary = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
