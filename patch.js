const fs = require('fs');
const files = [
  'app/api/builder/rewrite/route.ts',
  'app/api/naukri-profile/route.ts',
  'app/api/cover-letter/route.ts',
  'app/api/builder/suggest-skills/route.ts',
  'app/api/builder/suggest-keywords/route.ts',
  'app/api/builder/generate-summary/route.ts',
  'app/api/builder/enhance-bullets/route.ts',
  'app/api/parse/route.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('checkAndConsumeCredit')) continue;
  
  // Insert import
  const importCheck = `import { checkAndConsumeCredit } from '@/lib/credits';\n`;
  if (!content.includes('NextResponse')) {
     content = `import { NextResponse } from 'next/server';\n` + content;
  }
  content = importCheck + content;
  
  // Insert check inside POST
  const checkCode = `
  const creditCheck = await checkAndConsumeCredit();
  if (!creditCheck.allowed) {
    return NextResponse.json({ error: creditCheck.error }, { status: 402 });
  }
`;
  
  content = content.replace(/export async function POST\([^)]+\) \{/, match => {
    return match + checkCode;
  });
  
  fs.writeFileSync(file, content);
}
console.log('Done');
