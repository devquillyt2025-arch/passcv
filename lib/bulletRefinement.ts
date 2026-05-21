/**
 * Post-processing refinement for AI-generated resume bullets.
 * Detects and fixes:
 * - Repetitive corporate jargon
 * - Robotic language patterns
 * - Lack of sentence structure variation
 * - Low "human-likeness" scores
 */

// ── Anti-Jargon Patterns ──────────────────────────────────────────────────────

const CORPORATE_JARGON = [
  /cross-?functional/gi,
  /stakeholder\s+management/gi,
  /data-?driven/gi,
  /governance/gi,
  /alignment/gi,
  /synerg/gi,
  /leverage/gi,
  /utilize/gi,
  /implement/gi,
  /strategic\s+initiative/gi,
  /best\s+practice/gi,
  /touch\s+base/gi,
  /circle\s+back/gi,
  /holistic/gi,
  /end-?to-?end/gi,
  /mission-?critical/gi,
  /robust/gi,
  /scalable/gi,
  /seamless/gi,
  /cutting-?edge/gi,
];

const WEAK_STARTERS = [
  /^was\s+responsible\s+for/i,
  /^helped\s+to/i,
  /^assisted\s+with/i,
  /^involved\s+in/i,
  /^participated\s+in/i,
  /^contributed\s+to/i,
  /^worked\s+(?:on|with)/i,
];

const ROBOTIC_PATTERNS = [
  /successfully\s+(?:managed|implemented|delivered)/gi,
  /resulted\s+in\s+(?:significant|substantial|remarkable)/gi,
  /improved\s+efficiency\s+by/gi,
  /enhanced\s+(?:productivity|performance)/gi,
];

const OVERUSED_VERBS = [
  /^improved/i,
  /^enhanced/i,
  /^optimized/i,
  /^streamlined/i,
  /^collaborated/i,
  /^managed/i,
  /^led/i,
];

// ── Jargon Replacement Map ────────────────────────────────────────────────────

const JARGON_REPLACEMENTS: Record<string, string[]> = {
  'cross-functional': ['across', 'between teams', 'with'],
  'stakeholder management': ['coordination', 'communication', 'alignment'],
  'data-driven': ['measurable', 'fact-based', 'metrics-backed'],
  'governance': ['oversight', 'control', 'supervision'],
  'alignment': ['coordination', 'agreement', 'sync'],
  'leverage': ['use', 'employ', 'tap'],
  'utilize': ['use', 'apply', 'employ'],
  'implement': ['built', 'delivered', 'launched', 'rolled out'],
  'strategic initiative': ['project', 'effort', 'program'],
  'best practice': ['standard', 'approach', 'method'],
  'holistic': ['comprehensive', 'complete', 'end-to-end'],
  'robust': ['reliable', 'solid', 'dependable'],
  'scalable': ['flexible', 'adaptable'],
  'seamless': ['smooth', 'frictionless'],
};

// ── Strong Varied Verbs ───────────────────────────────────────────────────────

const STRONG_VERB_POOL = [
  'Spearheaded',
  'Orchestrated',
  'Architected',
  'Accelerated',
  'Transformed',
  'Pioneered',
  'Catapulted',
  'Overhauled',
  'Engineered',
  'Forged',
  'Galvanized',
  'Maximized',
  'Amplified',
  'Expedited',
  'Revolutionized',
  'Cultivated',
  'Elevated',
  'Scaled',
  'Reconfigured',
  'Revitalized',
  'Redirected',
  'Surpassed',
  'Consolidated',
  'Strategized',
  'Championed',
  'Executed',
  'Deployed',
  'Automated',
  'Established',
  'Negotiated',
  'Captured',
  'Secured',
  'Generated',
  'Converted',
  'Reduced',
  'Recovered',
  'Reclaimed',
];

// ── Analysis Functions ────────────────────────────────────────────────────────

export interface BulletScore {
  jargonCount: number;
  repetitionRisk: boolean;
  humanLikeness: number; // 0-100
  issues: string[];
  suggestions: string[];
}

/**
 * Detect how many jargon phrases appear in the bullet
 */
export function detectJargon(bullet: string): number {
  let count = 0;
  for (const pattern of CORPORATE_JARGON) {
    if (pattern.test(bullet)) count++;
  }
  return count;
}

/**
 * Check if a bullet sounds robotic/overly polished
 */
export function detectRoboticPatterns(bullet: string): boolean {
  return ROBOTIC_PATTERNS.some((pattern) => pattern.test(bullet));
}

/**
 * Check for weak starter verbs
 */
export function hasWeakStarter(bullet: string): boolean {
  return WEAK_STARTERS.some((pattern) => pattern.test(bullet));
}

/**
 * Score human-likeness of a bullet (0-100)
 * Factors: no jargon, no robotic patterns, has metrics, varied verbs, active voice
 */
export function scoreHumanLikeness(bullet: string): number {
  let score = 100;

  // Penalty for each jargon phrase
  const jargonCount = detectJargon(bullet);
  score -= jargonCount * 15;

  // Penalty for robotic patterns
  if (detectRoboticPatterns(bullet)) score -= 20;

  // Penalty for weak starters
  if (hasWeakStarter(bullet)) score -= 15;

  // Bonus for having metrics
  if (/\d+\%?|[$€£]\d+|increased|reduced|grew/i.test(bullet)) {
    score += 10;
  }

  // Penalty for being too long (over 200 chars is verbose)
  if (bullet.length > 200) score -= 5;

  // Penalty for repeated phrases
  const words = bullet.toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();
  for (const word of words) {
    if (word.length > 4) wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }
  const maxFreq = Math.max(...wordFreq.values());
  if (maxFreq > 2) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Analyze a bullet and return detailed feedback
 */
export function analyzeBulletQuality(bullet: string): BulletScore {
  const jargonCount = detectJargon(bullet);
  const isRobotic = detectRoboticPatterns(bullet);
  const hasWeak = hasWeakStarter(bullet);
  const humanLikeness = scoreHumanLikeness(bullet);

  const issues: string[] = [];
  const suggestions: string[] = [];

  if (jargonCount > 0) {
    issues.push(`Contains ${jargonCount} corporate jargon phrase(s)`);
    suggestions.push('Replace jargon with simpler, more specific language');
  }

  if (isRobotic) {
    issues.push('Sounds overly polished/AI-written');
    suggestions.push('Use more specific impact details and vary language');
  }

  if (hasWeak) {
    issues.push('Starts with weak verb');
    suggestions.push('Lead with a strong action verb');
  }

  if (!/\d+\%?|[$€£]\d+|increased|reduced|grew/i.test(bullet)) {
    issues.push('Missing quantifiable metric');
    suggestions.push('Add a number, percentage, or business impact measure');
  }

  return {
    jargonCount,
    repetitionRisk: isRobotic,
    humanLikeness,
    issues,
    suggestions,
  };
}

// ── Refinement Functions ──────────────────────────────────────────────────────

/**
 * Replace corporate jargon with simpler alternatives
 */
export function replaceJargon(bullet: string): string {
  let refined = bullet;

  for (const [jargon, replacements] of Object.entries(JARGON_REPLACEMENTS)) {
    const pattern = new RegExp(`\\b${jargon.replace(/[-]/g, '-?')}\\b`, 'gi');
    if (pattern.test(refined)) {
      // Pick a random alternative
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      refined = refined.replace(pattern, replacement);
    }
  }

  return refined;
}

/**
 * Vary the sentence structure if it's too repetitive
 */
export function varyStructure(bullet: string): string {
  // Remove common weak patterns and restructure
  let refined = bullet;

  // Transform "X by doing Y" to more direct structure
  refined = refined.replace(/([^,]+?)\s+by\s+([^,]+?)(\.|$)/i, '$1 through $2$3');

  // Transform "successfully X" patterns
  refined = refined.replace(/successfully\s+(\w+)/gi, '$1');

  // Transform "resulted in X improvement" to shorter form
  refined = refined.replace(/resulted\s+in\s+(?:a\s+)?(\w+)\s+improvement/gi, 'boosted $1');

  return refined;
}

/**
 * Refactor a bullet to make it more human-like
 * Applies multiple refinements: jargon removal, structure variation, verb variety
 */
export function refineBullet(bullet: string): string {
  let refined = bullet;

  // 1. Replace corporate jargon
  refined = replaceJargon(refined);

  // 2. Vary sentence structure
  refined = varyStructure(refined);

  // 3. Remove weak starters and rebuild if needed
  const weakMatch = refined.match(/^(was\s+responsible\s+for|helped\s+to|assisted\s+with|involved\s+in|participated\s+in)\s+(.+)/i);
  if (weakMatch) {
    const action = weakMatch[2];
    // Pick a random strong verb
    const verb = STRONG_VERB_POOL[Math.floor(Math.random() * STRONG_VERB_POOL.length)];
    refined = `${verb} ${action}`;
  }

  // 4. Ensure it doesn't start with weak verb from the pool
  const bulletStart = refined.split(/\s+/)[0].toLowerCase();
  const overusedMatch = OVERUSED_VERBS.find((v) => v.test(bulletStart));
  if (overusedMatch && Math.random() > 0.5) {
    // 50% chance to replace overused verb with variety
    const parts = refined.split(/\s+/);
    if (parts.length > 1) {
      const remainingText = parts.slice(1).join(' ');
      const newVerb = STRONG_VERB_POOL[Math.floor(Math.random() * STRONG_VERB_POOL.length)];
      refined = `${newVerb} ${remainingText}`;
    }
  }

  // 5. Trim excessive whitespace
  refined = refined.replace(/\s+/g, ' ').trim();

  return refined;
}

/**
 * Refine a list of bullets and return refined versions with scores
 */
export function refineBullets(bullets: string[]): Array<{ original: string; refined: string; score: BulletScore; scoresBefore: BulletScore; scoresAfter: BulletScore }> {
  return bullets.map((bullet) => {
    const scoresBefore = analyzeBulletQuality(bullet);
    const refined = refineBullet(bullet);
    const scoresAfter = analyzeBulletQuality(refined);

    return {
      original: bullet,
      refined,
      score: scoresAfter,
      scoresBefore,
      scoresAfter,
    };
  });
}

/**
 * Check if a set of bullets has high repetition (same phrases, verbs, patterns)
 */
export function detectRepetition(bullets: string[]): { hasRepetition: boolean; patterns: string[] } {
  const patterns: string[] = [];
  const verbs = new Map<string, number>();
  const phrases = new Map<string, number>();

  for (const bullet of bullets) {
    // Extract starting verb
    const verbMatch = bullet.match(/^(\w+)/);
    if (verbMatch) {
      const verb = verbMatch[1].toLowerCase();
      verbs.set(verb, (verbs.get(verb) || 0) + 1);
    }

    // Extract common phrases (2-word combinations)
    const words = bullet.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (words[i].length > 3 && words[i + 1].length > 3) {
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
      }
    }
  }

  // Report patterns that appear in 50% or more of bullets
  const threshold = bullets.length * 0.5;
  for (const [verb, count] of verbs) {
    if (count >= threshold) patterns.push(`Verb "${verb}" used ${count} times`);
  }
  for (const [phrase, count] of phrases) {
    if (count >= threshold) patterns.push(`Phrase "${phrase}" used ${count} times`);
  }

  return {
    hasRepetition: patterns.length > 0,
    patterns,
  };
}
