/**
 * Next.js proxy route — forwards ATS scoring requests to the Python microservice.
 *
 * Configure the service URL via:
 *   .env.local:      ATS_SCORER_URL=http://localhost:8001
 *   Vercel env vars: ATS_SCORER_URL=https://your-lambda-url.execute-api.region.amazonaws.com
 *
 * If ATS_SCORER_URL is not set, the route falls back to the local scoring
 * implementation in lib/scoring.ts, so the frontend still receives a valid
 * ATS score payload without needing the Python service.
 */
import { NextResponse } from 'next/server';
import { calculateScore, mapResumeDataToParsedResume, parseJD } from '@/lib/scoring';
import type { ResumeData } from '@/lib/types';

const SCORER_URL = process.env.ATS_SCORER_URL?.replace(/\/$/, '');

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!SCORER_URL) {
    const payload = body as { resume?: ResumeData; jdText?: string };
    if (!payload?.resume || typeof payload.jdText !== 'string') {
      return NextResponse.json({ error: 'Missing resume or jdText' }, { status: 400 });
    }

    const parsedResume = mapResumeDataToParsedResume(payload.resume);
    const score = calculateScore(parsedResume, parseJD(payload.jdText));
    return NextResponse.json(score);
  }

  try {
    const upstream = await fetch(`${SCORER_URL}/api/ats-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Abort if the Python service takes more than 12 s
      signal: AbortSignal.timeout(12_000),
    });

    const data: unknown = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scorer unavailable';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
