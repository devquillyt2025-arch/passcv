import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { jobTitle, industry } = await req.json();

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are an expert technical recruiter and career coach. 
Suggest a list of exactly 10 highly relevant, ATS-friendly skills for a candidate targeting the role of: ${jobTitle} ${industry ? `in the ${industry} industry` : ''}.

Mix hard technical skills and important soft skills that ATS systems typically scan for this role.

Output exactly a comma-separated list of 10 skills. No numbers, no bullet points, no introductory text. For example: React.js, TypeScript, Project Management, Agile, Communication, Node.js, GraphQL, SEO, Data Analysis, Leadership`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    const skills = text.split(',').map(s => s.trim()).filter(Boolean);

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error suggesting skills:', error);
    return NextResponse.json(
      { error: 'Failed to suggest skills' },
      { status: 500 }
    );
  }
}
