import { NextRequest, NextResponse } from 'next/server';
import { parseJD } from '@/lib/scoring';
import { rewriteResume } from '@/lib/claude';
import { ParsedResume } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, jdText } = body as {
      resume: ParsedResume;
      jdText: string;
    };

    if (!resume || !jdText) {
      return NextResponse.json({ error: 'Missing resume or jdText' }, { status: 400 });
    }

    const jd = parseJD(jdText);
    const rewritten = await rewriteResume(resume, jd, jdText);

    return NextResponse.json({ rewritten, jd });
  } catch (err) {
    console.error('rewrite error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Rewrite failed' },
      { status: 500 }
    );
  }
}
