import { checkAndConsumeCredit } from '@/lib/credits';
import { NextRequest, NextResponse } from 'next/server';
import { parseJD } from '@/lib/scoring';
import { rewriteResume } from '@/lib/claude';
import { ParsedResume } from '@/lib/types';
import { ParsedResumeSchema, RewrittenResumeSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  const creditCheck = await checkAndConsumeCredit();
  if (!creditCheck.allowed) {
    return NextResponse.json({ error: creditCheck.error }, { status: 402 });
  }

  try {
    const body = await req.json();
    const { resume, jdText } = body as {
      resume: ParsedResume;
      jdText: string;
    };

    if (!resume || !jdText) {
      return NextResponse.json({ error: 'Missing resume or jdText' }, { status: 400 });
    }

    const parseResult = ParsedResumeSchema.safeParse(resume);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid resume data structure', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const jd = parseJD(jdText);
    const rewritten = await rewriteResume(resume, jd, jdText);

    const outParseResult = RewrittenResumeSchema.safeParse(rewritten);
    if (!outParseResult.success) {
      console.error('Claude output validation failed:', outParseResult.error.format());
      return NextResponse.json({ error: 'AI generated invalid data structure' }, { status: 500 });
    }

    return NextResponse.json({ rewritten, jd });
  } catch (err) {
    console.error('rewrite error', err);
    return NextResponse.json(
      { error: 'An internal error occurred during rewrite' },
      { status: 500 }
    );
  }
}
