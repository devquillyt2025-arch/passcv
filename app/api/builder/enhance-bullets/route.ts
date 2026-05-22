import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { refineBullets, detectRepetition } from '@/lib/bulletRefinement';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const HUMAN_LIKE_SYSTEM_PROMPT = `You are an expert resume coach who writes HUMAN, NATURAL-SOUNDING resume bullets—not corporate fluff.

CRITICAL RULES:
1. AVOID corporate jargon: cross-functional, stakeholder management, data-driven, governance, alignment, leverage, synergies, best practices
2. SOUND NATURAL: Write like a real person would describe their work, not like marketing copy
3. ONE STRONG VERB PER BULLET: Lead with an action verb that shows clear ownership
4. PRIORITIZE OUTCOMES over process: Focus on WHAT changed, not HOW you did it
5. VARY YOUR VERBS: Don't repeat the same starting verb across bullets
6. USE METRICS: Add numbers, percentages, or business impact wherever possible
7. BE CONCISE: Aim for 1 line per bullet when possible (max 150 chars)
8. ACTIVE VOICE ONLY: Never use passive constructions like "was responsible for"
9. NO WEAK VERBS: Avoid: helped, worked, assisted, supported, participated, utilized, handled, made sure
10. BE SPECIFIC: Replace vague language with concrete details

STRONG VERBS TO USE: Spearheaded, Orchestrated, Architected, Accelerated, Transformed, Pioneered, Catapulted, Overhauled, Engineered, Forged, Galvanized, Maximized, Amplified, Expedited, Revolutionized, Cultivated, Elevated, Scaled, Consolidated, Strategized, Championed, Executed, Deployed, Automated, Established, Negotiated, Captured, Secured, Generated, Converted, Reduced, Recovered

WRITE LIKE A REAL PERSON:
- Use specific details (not "improved efficiency" but "cut processing time from 2 hours to 30 minutes")
- Show personality: use concrete examples
- Short, punchy sentences beat long corporate speak`;

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

    const userPrompt = `I have draft responsibilities/achievements for a ${position || 'professional'} role at ${company || 'a company'}.

ORIGINAL TEXT:
${text}

Please transform these into punchy, natural-sounding achievement bullets. Each bullet should:
- Start with a different, powerful action verb
- Lead with the outcome/impact
- Include metrics or business results where possible
- Sound like a real person, not a bot

Format ONLY as a bullet list using '-'. No intro, no explanations, no markdown backticks.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: HUMAN_LIKE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7, // Slightly higher for more natural variation
    });

    let enhancedText = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    // ── Post-processing: Refine for human-likeness ────────────────────────────

    // Parse bullets
    const bullets = enhancedText
      .split('\n')
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);

    if (bullets.length > 0) {
      // Check for repetition
      const { hasRepetition, patterns } = detectRepetition(bullets);
      if (hasRepetition) {
        console.log('Repetition detected:', patterns);
      }

      // Refine bullets for human-likeness
      const refinedBullets = refineBullets(bullets);

      // Filter out bullets with very low human-likeness and keep the refined ones
      const finalBullets = refinedBullets
        .map((b) => {
          // Use refined version if it improved the score significantly, otherwise use original
          if (b.scoresAfter.humanLikeness > b.scoresBefore.humanLikeness + 10) {
            return `- ${b.refined}`;
          }
          return `- ${b.original}`;
        })
        .join('\n');

      enhancedText = finalBullets;
    }

    return NextResponse.json({
      enhancedText,
      metadata: {
        bulletCount: bullets.length,
        processingApplied: 'post-processing refinement for human-likeness',
      },
    });
  } catch (error) {
    console.error('Error enhancing bullets:', error);
    return NextResponse.json(
      { error: 'Failed to enhance bullets' },
      { status: 500 }
    );
  }
}
