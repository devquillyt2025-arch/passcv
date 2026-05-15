import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ParsedResume } from '@/lib/types';

const PARSE_PROMPT = `Extract all information from this resume and return it as JSON matching this exact schema. If a field is not found, use an empty string or empty array.

Return ONLY valid JSON, no markdown fences, no explanation:
{
  "contact": {
    "name": "full name",
    "email": "email address",
    "phone": "phone number",
    "location": "city, state or city, country",
    "linkedin": "linkedin URL or empty string"
  },
  "summary": "professional summary or objective text, or empty string",
  "experience": [
    {
      "company": "company name",
      "title": "job title",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or Present",
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "institution": "college or university name",
      "degree": "degree type e.g. B.Tech MBA",
      "field": "field of study",
      "year": "graduation year YYYY",
      "cgpa": "cgpa or percentage or empty string"
    }
  ],
  "skills": ["skill1", "skill2"],
  "certifications": ["cert1"],
  "noticePeriod": "notice period if mentioned else empty string",
  "ctc": "current CTC if mentioned else empty string",
  "hasMultiColumn": false,
  "hasTables": false,
  "hasImages": false
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfiguration: missing API key' }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const { content, filename } = await req.json() as { content: string; filename: string };

    if (!content || !filename) {
      return NextResponse.json({ error: 'Missing content or filename' }, { status: 400 });
    }

    const isPdf = filename.toLowerCase().endsWith('.pdf');
    const isDocx = filename.toLowerCase().endsWith('.docx');

    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 400 });
    }

    let claudeContent: Anthropic.MessageParam['content'];

    if (isPdf) {
      // Use Claude's native PDF support — no webpack-hostile native modules
      claudeContent = [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: content },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        { type: 'text', text: PARSE_PROMPT },
      ];
    } else {
      // DOCX: use mammoth to extract plain text
      const mammoth = await import('mammoth');
      const buffer = Buffer.from(content, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      const rawText = result.value.trim();

      if (!rawText) {
        return NextResponse.json({ error: 'Could not extract text from DOCX' }, { status: 400 });
      }

      claudeContent = `Here is the raw text from a resume:\n\n${rawText.slice(0, 8000)}\n\n${PARSE_PROMPT}`;
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: claudeContent }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const resumeData = extractJson(text);

    return NextResponse.json(resumeData);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('parse error:', msg);
    return NextResponse.json({ error: `Parse failed: ${msg}` }, { status: 500 });
  }
}

function extractJson(text: string): ParsedResume {
  const fenced = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  const raw = text.match(/\{[\s\S]*\}/);
  const jsonStr = fenced?.[1] ?? raw?.[0];
  if (!jsonStr) throw new Error('No JSON found in Claude response');
  return JSON.parse(jsonStr) as ParsedResume;
}
