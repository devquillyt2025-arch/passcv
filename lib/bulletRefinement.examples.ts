/**
 * Examples demonstrating the improved resume bullet generation system.
 * These are test cases showing before/after transformations.
 */

import { scoreHumanLikeness, refineBullet, analyzeBulletQuality, detectRepetition } from '@/lib/bulletRefinement';
import { analyzeBullet } from '@/lib/bulletAnalyzer';

// ─── Test Case 1: Corporate Jargon Removal ───────────────────────────────────

const example1Before = "Collaborated with cross-functional stakeholders to ensure alignment of project objectives";
console.log("Example 1 - Corporate Jargon");
console.log("Before:", example1Before);
console.log("Score:", scoreHumanLikeness(example1Before)); // ~45
console.log("Analysis:", analyzeBulletQuality(example1Before));
const example1After = refineBullet(example1Before);
console.log("After:", example1After);
console.log("Score:", scoreHumanLikeness(example1After)); // ~75+
console.log("---\n");

// ─── Test Case 2: Weak Verb Replacement ────────────────────────────────────

const example2Before = "Helped to implement data-driven strategies for the customer success team";
console.log("Example 2 - Weak Verb");
console.log("Before:", example2Before);
console.log("Score:", scoreHumanLikeness(example2Before)); // ~50
const example2After = refineBullet(example2Before);
console.log("After:", example2After);
console.log("Score:", scoreHumanLikeness(example2After)); // ~70+
console.log("---\n");

// ─── Test Case 3: Real-Time Jargon Detection ───────────────────────────────

const example3 = "Utilized leveraged governance principles";
console.log("Example 3 - Real-Time Detection");
console.log("Bullet:", example3);
// Multiple jargon phrases detected
console.log("Real-time issues:");
console.log("  -", analyzeBullet(example3, "exp-1", 0, 0));
console.log("---\n");

// ─── Test Case 4: Repetition Detection ─────────────────────────────────────

const bulletSet = [
  "Led the design of the new feature",
  "Led the development of the infrastructure",
  "Led the implementation of the testing framework",
  "Led the optimization of the database queries"
];
console.log("Example 4 - Repetition Detection");
console.log("Bullets:", bulletSet);
const { hasRepetition, patterns } = detectRepetition(bulletSet);
console.log("Has repetition:", hasRepetition);
console.log("Patterns:", patterns);
// Output: "Verb 'led' used 4 times" — suggests using different verbs
console.log("---\n");

// ─── Test Case 5: Robotic Pattern Detection ────────────────────────────────

const example5 = "Successfully implemented data-driven solutions resulting in significant improvements to efficiency";
console.log("Example 5 - Robotic Language");
console.log("Before:", example5);
const analysis5 = analyzeBulletQuality(example5);
console.log("Analysis:", analysis5);
// Issues: robotic pattern, lacks specific metrics
console.log("Suggestions:", analysis5.suggestions);
const example5After = refineBullet(example5);
console.log("After:", example5After);
console.log("---\n");

// ─── Test Case 6: Strength Showcase ───────────────────────────────────────

const example6Before = "Worked with the team to improve the system performance";
console.log("Example 6 - Full Transformation");
console.log("Before:", example6Before);
console.log("Before Score:", scoreHumanLikeness(example6Before));
const example6After = refineBullet(example6Before);
console.log("After:", example6After);
console.log("After Score:", scoreHumanLikeness(example6After));
console.log("---\n");

// ─── Usage in API ──────────────────────────────────────────────────────────
// These refinements are automatically applied in:
// POST /api/builder/enhance-bullets
//
// Request:
// {
//   "text": "Collaborated with cross-functional teams...",
//   "position": "Product Manager",
//   "company": "TechCorp"
// }
//
// Response (after post-processing):
// {
//   "enhancedText": "- Orchestrated cross-team initiative launching product in Q3...",
//   "metadata": { "bulletCount": 1, "processingApplied": "post-processing refinement" }
// }
