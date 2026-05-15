import { NextRequest, NextResponse } from 'next/server';
import { parseJD, calculateScore } from '@/lib/scoring';
import { ParsedResume } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, jdText } = body as { resume: ParsedResume; jdText: string };

    if (!resume || !jdText) {
      return NextResponse.json({ error: 'Missing resume or jdText' }, { status: 400 });
    }

    const jd = parseJD(jdText);
    const score = calculateScore(resume, jd);

    return NextResponse.json({ score, jd });
  } catch (err) {
    console.error('score error', err);
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
