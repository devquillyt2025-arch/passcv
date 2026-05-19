import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { text, position, company } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are an expert ATS resume reviewer and career coach. 
I have a draft of my responsibilities/achievements for a role as a ${position || 'professional'} at ${company || 'a company'}.
I need you to enhance these points to be impactful, action-oriented bullet points that highlight achievements and metrics.

Original text:
${text}

Guidelines for enhancement:
1. Start each bullet point with a strong action verb (e.g., Spearheaded, Orchestrated, Optimized).
2. Quantify achievements where possible (e.g., increased by X%, reduced time by Y). If specific numbers aren't provided, use phrases like "resulting in significant improvements".
3. Focus on the impact and result of the work, not just the task itself (Use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]).
4. Ensure the bullets are ATS-friendly, removing fluff words.
5. Format the output STRICTLY as a bulleted list using the '-' character. 

Return ONLY the bulleted list. Do not include any introduction, conclusion, or conversational text.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const enhancedText = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    return NextResponse.json({ enhancedText });
  } catch (error) {
    console.error('Error enhancing bullets:', error);
    return NextResponse.json(
      { error: 'Failed to enhance bullets' },
      { status: 500 }
    );
  }
}
