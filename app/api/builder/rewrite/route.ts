import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert ATS Resume Writer. Rewrite the provided resume section to be highly optimized for Applicant Tracking Systems and human hiring managers. The output must be achievement-oriented, not just descriptive.

RULES:

1. WORK EXPERIENCE BULLETS
   Rewrite each bullet point to lead with a strong action verb, include at least one quantified metric (use realistic estimates if exact numbers unavailable), and demonstrate business impact. Output only the improved bullets, no commentary.

2. KEYWORDS
   Extract the most impactful technical terms, tools, and domain skills from the Job Description (if provided) and embed them naturally. If no JD is provided, proactively match keywords from common JDs for the role. Prioritise exact keyword matches over synonyms.

3. ACTION VERBS
   Every bullet point must open with a strong, industry-specific verb.
   ✓ Preferred: Led, Engineered, Scaled, Deployed, Architected, Delivered, Optimised, Automated, Designed, Reduced, Increased, Launched, Drove, Built, Migrated, Implemented, Spearheaded
   ✗ Banned: Helped, Worked, Assisted, Participated, Was responsible for, Handled, Utilised, Made sure, Supported, Contributed

4. QUANTIFY
   Turn every vague impact into a measurable result. You MUST add quantified metrics (%, $, time saved).
   ✓ "Reduced API latency by 35% via connection pooling, cutting p99 from 420 ms to 270 ms"
   ✗ "Improved API performance"
   When no figures are available, use [N]%, [X]x, or [$Y] as fill-in placeholders.

4. CONCISENESS
   Remove filler words and passive voice. No "Successfully", "Was able to", or empty adverbs.
   Each bullet = one tight, powerful sentence.

5. FORMAT
   Preserve the input format exactly — bullets stay bullets, paragraphs stay paragraphs.
   Use the same bullet character (-, •, *) and newline style as the input.

6. LENGTH
   Output must be within ±20% of the original character count.

OUTPUT: Return ONLY the rewritten text. No preamble, no explanation, no surrounding quotes or markdown unless present in the original.`;

// ── User message builders ─────────────────────────────────────────────────────
function buildUserMessage(
  originalText: string,
  jdText: string,
  sectionType: 'summary' | 'experience',
  context?: string,
): string {
  const jdSection = jdText.trim()
    ? `\nTARGET JOB DESCRIPTION (extract keywords from this):\n${jdText.trim().slice(0, 1000)}\n`
    : '';

  const contextSection = context?.trim() ? `\nCANDIDATE CONTEXT:\n${context.trim()}\n` : '';

  if (sectionType === 'summary') {
    const action = originalText.trim()
      ? `CURRENT PROFESSIONAL SUMMARY:\n${originalText}`
      : 'Generate a compelling professional summary for this candidate.';
    return `TASK: You are a professional resume writer. Rewrite this professional summary in under 80 words. Lead with years of experience and domain. Include 2–3 quantified achievements. End with a value proposition. Use active voice. No buzzwords. Output only the rewritten summary.${jdSection}${contextSection}\n${action}`;
  }

  return `TASK: Optimise Work Experience Bullets${jdSection}${contextSection}\nCURRENT BULLETS (rewrite these):\n${originalText}`;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const body = await req.json() as {
    originalText?: string;
    jdText?: string;
    sectionType?: 'summary' | 'experience';
    context?: string;
  };

  const { originalText = '', jdText = '', sectionType = 'experience', context } = body;

  if (!originalText.trim() && sectionType === 'experience') {
    return NextResponse.json({ error: 'originalText is required for experience rewrites' }, { status: 400 });
  }

  const userMessage = buildUserMessage(originalText, jdText, sectionType, context);

  // Use .stream() for clean async-iterable access
  const msgStream = anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of msgStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            // JSON-encode each token so newlines and special chars are safe in SSE
            const line = `data: ${JSON.stringify(event.delta.text)}\n\n`;
            controller.enqueue(encoder.encode(line));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      // Client disconnected — abort the upstream Anthropic stream
      msgStream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no', // prevent nginx from buffering the stream
    },
  });
}
