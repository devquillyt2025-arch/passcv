"""
Core ATS scoring engine — framework-agnostic.

All web-framework imports (FastAPI, mangum, etc.) live in main.py / lambda_handler.py.
This module can be imported and called directly from an AWS Lambda handler,
a CLI script, or a test without any HTTP context.

Scoring weights (must match lib/scoring.ts for frontend compatibility):
  keyword    40 pts  — exact + semantic keyword match against JD
  formatting 20 pts  — ATS-safe structure signals
  content    20 pts  — semantic cosine similarity + bullet quality
  naukri     20 pts  — recruiter profile signals (location, contact, title)
"""
from __future__ import annotations

import re
from functools import lru_cache

from .schemas import ATSScoreRequest, ATSScoreResponse, ResumeDataPayload, ScoreBreakdown

# ── Keyword constants (kept in sync with lib/scoring.ts) ─────────────────────

TECH_KEYWORDS: list[str] = [
    "python", "java", "javascript", "typescript", "react", "node", "nodejs",
    "angular", "vue", "sql", "mysql", "postgresql", "mongodb", "redis",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "linux", "rest",
    "api", "graphql", "microservices", "agile", "scrum", "jira", "confluence",
    "spring", "django", "flask", "express", "tailwind", "css", "html",
    "figma", "excel", "powerbi", "power bi", "tableau", "spark", "hadoop",
    "kafka", "elasticsearch", "terraform", "jenkins", "ci/cd",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "pandas", "numpy", "product management", "roadmap", "stakeholder",
    "analytics", "ab testing", "user research", "salesforce", "sap",
    "data analysis", "data science", "etl", "data warehouse",
    "airflow", "dbt", "looker", "redshift", "snowflake", "bigquery",
    "databricks", "scikit-learn", "r programming", "matlab", "bash",
    "c++", "c#", "go", "rust", "swift", "flutter", "react native",
    "android", "ios", "firebase", "supabase", "vercel", "netlify",
    "openai", "langchain", "vector database", "llm", "prompt engineering",
]

SOFT_SKILL_KEYWORDS: list[str] = [
    "leadership", "communication", "collaboration", "problem solving",
    "analytical", "team player", "cross-functional", "strategic",
    "innovation", "mentoring",
]

ACTION_VERBS: frozenset[str] = frozenset([
    "led", "built", "developed", "managed", "increased", "reduced",
    "improved", "delivered", "launched", "designed", "implemented",
    "created", "achieved", "drove", "optimised", "optimized",
    "spearheaded", "established", "streamlined", "automated", "migrated",
    "deployed", "architected", "engineered", "scaled", "negotiated",
    "onboarded", "trained", "mentored", "collaborated", "owned",
])

WEAK_VERBS: frozenset[str] = frozenset([
    "helped", "worked", "assisted", "participated", "was", "involved",
    "contributed", "responsible", "handled", "utilized", "made", "supported",
])

INDIA_CITIES: list[str] = [
    "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai",
    "pune", "kolkata", "ahmedabad", "noida", "gurgaon", "gurugram",
    "jaipur", "bhopal", "indore", "lucknow", "chandigarh", "kochi",
    "coimbatore", "surat",
]

# Capitalized words that are common English sentence starters, not product names
_JD_GENERIC_WORDS: frozenset[str] = frozenset([
    "The", "A", "An", "In", "For", "And", "Or", "With", "To", "Of", "At",
    "We", "You", "Our", "Your", "Is", "Are", "Will", "Be", "As", "By",
    "This", "That", "It", "Its", "On", "From", "Into", "Has", "Have",
    "Not", "Must", "May", "Can", "Should", "Would", "Could", "Do", "Does",
    "All", "Any", "Both", "Each", "Few", "More", "Most", "Other", "Such",
    "No", "Nor", "So", "Yet", "Both", "Either", "Neither",
])

_NOUN_CHUNK_SKIP: frozenset[str] = frozenset([
    "experience", "skill", "knowledge", "ability", "strong", "excellent",
    "good", "proven", "working", "demonstrated", "proficiency", "required",
    "preferred", "minimum", "year", "years", "plus", "team", "role",
    "position", "candidate", "requirement", "looking", "need", "passion",
    "background", "degree", "understanding", "familiarity", "proficiency",
])

# ── Lazy model loading — cached for Lambda warm invocations ───────────────────

@lru_cache(maxsize=1)
def _get_embedder():
    """Load sentence-transformers model once; reuse across Lambda invocations."""
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def _get_nlp():
    """Load spaCy small English model once; reuse across Lambda invocations."""
    import spacy
    return spacy.load("en_core_web_sm")


# ── Text helpers ──────────────────────────────────────────────────────────────

def _resume_to_text(resume: "ResumeDataPayload") -> str:
    """Flatten the entire resume into a single lower-cased searchable string."""
    parts: list[str] = [
        resume.summary,
        " ".join(s.name for s in resume.skills),
        " ".join(
            f"{e.position} {e.company} {e.description}"
            for e in resume.experience
        ),
        " ".join(
            f"{e.degree} {e.field} {e.institution}"
            for e in resume.education
        ),
        " ".join(c.name for c in resume.certifications),
        " ".join(p.name + " " + p.description for p in resume.projects),
        resume.contact.jobTitle,
    ]
    return " ".join(p for p in parts if p).lower()


def _extract_bullets(resume: ResumeDataPayload) -> list[str]:
    """Return all non-empty bullet strings from experience descriptions."""
    bullets: list[str] = []
    for exp in resume.experience:
        for line in exp.description.split("\n"):
            stripped = re.sub(r"^[-•*]\s*", "", line.strip())
            if len(stripped) > 10:
                bullets.append(stripped)
    return bullets


# ── JD keyword extraction ─────────────────────────────────────────────────────

def _extract_jd_keywords(jd_text: str) -> list[str]:
    """
    Three-pass keyword extraction from the job description:
      1. Exact match against predefined TECH_KEYWORDS list (high precision)
      2. Capitalized PascalCase words — product/tool names (e.g. Kubernetes, PostgreSQL)
      3. ALL-CAPS acronyms (e.g. REST, AWS, CI/CD, NLP)
      4. spaCy noun chunks — catches multi-word technical phrases the lists miss

    spaCy is tried with a graceful fallback so the scorer still works if
    the en_core_web_sm model hasn't been downloaded yet.
    """
    jd_lower = jd_text.lower()
    found: set[str] = set()

    # Pass 1 — predefined list (handles multi-word terms like "machine learning")
    for kw in TECH_KEYWORDS + SOFT_SKILL_KEYWORDS:
        if kw in jd_lower:
            found.add(kw)

    # Pass 2 — PascalCase tool/product names (e.g. "React", "Terraform", "FastAPI")
    for m in re.finditer(r"\b([A-Z][a-zA-Z][a-zA-Z0-9+#.\-]*)\b", jd_text):
        word = m.group(1)
        if word not in _JD_GENERIC_WORDS and len(word) >= 2:
            found.add(word.lower())

    # Pass 3 — ALL-CAPS acronyms (e.g. AWS, REST, SQL, CI/CD)
    for m in re.finditer(r"\b([A-Z]{2,}(?:[/\-][A-Z]+)*)\b", jd_text):
        acronym = m.group(1)
        if 2 <= len(acronym) <= 15:
            found.add(acronym.lower())

    # Pass 4 — spaCy noun chunks (graceful fallback if model missing)
    try:
        nlp = _get_nlp()
        doc = nlp(jd_text[:4000])  # cap for speed; 4000 chars ≈ 600-800 tokens
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.strip().lower()
            # Keep only chunks where at least one non-stopword token survives the skip list
            useful = [
                t.lower_ for t in chunk
                if not t.is_stop and not t.is_punct and t.lower_ not in _NOUN_CHUNK_SKIP
                and len(t.lower_) > 2
            ]
            if useful and 3 <= len(chunk_text) <= 40:
                found.add(chunk_text)
    except Exception:
        pass  # en_core_web_sm not installed — passes 1-3 are still in play

    return sorted(found)


# ── Semantic similarity ───────────────────────────────────────────────────────

def _cosine_similarity(resume_text: str, jd_text: str) -> float:
    """
    Encode resume and JD with all-MiniLM-L6-v2, return cosine similarity 0–1.

    Inputs are truncated to ~1800 chars each (≈ 384 tokens — model max).
    Normalised embeddings make cosine = dot product.
    """
    import numpy as np

    embedder = _get_embedder()
    embs = embedder.encode(
        [resume_text[:2000], jd_text[:1500]],
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    sim = float(np.dot(embs[0], embs[1]))
    return max(0.0, min(1.0, sim))


# ── Individual scoring functions ──────────────────────────────────────────────

def _score_keywords(
    resume_text: str,
    jd_keywords: list[str],
) -> tuple[int, list[str], list[str]]:
    """Keyword coverage: 0–40 pts."""
    if not jd_keywords:
        return 30, [], []  # neutral when no JD — mirrors TypeScript baseline

    matched = [kw for kw in jd_keywords if kw in resume_text]
    missing = [kw for kw in jd_keywords if kw not in resume_text]
    score = round((len(matched) / len(jd_keywords)) * 40)
    return score, matched, missing


def _score_formatting(resume) -> tuple[int, list[str]]:
    """
    Formatting ATS-safety: 0–20 pts.

    Builder output is always structurally ATS-safe (no tables, images, or
    multi-column layouts), so the baseline is 20. We only deduct for date
    format patterns the builder would never produce but an imported resume might.
    """
    score = 20
    issues: list[str] = []
    bad_date_re = re.compile(r"\d{1,2}/\d{1,2}/\d{2,4}|\d{4}-\d{2}-\d{2}")
    for exp in resume.experience:
        if bad_date_re.search(f"{exp.startDate} {exp.endDate}"):
            score -= 2
            issues.append(
                'Non-standard date format — use "Jun 2022 – Mar 2024" format'
            )
            break
    return max(0, score), issues


def _score_content(
    resume,
    jd_keywords: list[str],
    semantic_sim: float,
    jd_text: str,
) -> tuple[int, list[str]]:
    """
    Content quality: 0–20 pts.

    Composed of three sub-signals:
      • Semantic similarity (0–10 pts) — how closely the resume language
        matches the JD at the embedding level; replaces the rough keyword-
        density proxy used in the TypeScript implementation.
      • Bullet quantification (0–5 pts) — percentage of bullets with numbers.
      • Action-verb quality (0–5 pts) — percentage of bullets starting with
        strong verbs from the ACTION_VERBS set.
    """
    issues: list[str] = []
    bullets = _extract_bullets(resume)

    # --- Semantic similarity (0–10 pts) ---
    if jd_text.strip():
        # Linear scale: sim < 0.25 → 0 pts, sim > 0.75 → 10 pts
        sem_score = int(min(10, max(0, (semantic_sim - 0.25) / 0.50 * 10)))
    else:
        sem_score = 5  # neutral baseline when no JD provided

    # --- Bullet quantification (0–5 pts) ---
    if not bullets:
        quant_score = 0
        issues.append(
            "No bullet points found in work experience — "
            "add achievement-focused bullets to each role"
        )
    else:
        quantified = [b for b in bullets if re.search(r"\d", b)]
        q_ratio = len(quantified) / len(bullets)
        quant_score = int(q_ratio * 5)
        if q_ratio < 0.3:
            issues.append(
                f"Only {len(quantified)}/{len(bullets)} bullets have numbers — "
                "quantify results (e.g. 'reduced load time by 40%')"
            )

    # --- Action-verb quality (0–5 pts) ---
    if bullets:
        good_verb_count = 0
        for b in bullets:
            words = b.lower().split()
            if not words:
                continue
            first = words[0]
            if first in ACTION_VERBS:
                good_verb_count += 1
            elif first in WEAK_VERBS:
                pass  # explicit penalty: don't count
        verb_ratio = good_verb_count / len(bullets)
        verb_score = int(verb_ratio * 5)
        if verb_ratio < 0.5:
            issues.append(
                "Many bullets start with weak verbs — "
                "begin each with 'Led', 'Built', 'Drove', 'Engineered'"
            )
    else:
        verb_score = 0

    # Summary keyword alignment bonus — deduct if summary misses JD keywords
    if resume.summary and jd_keywords:
        summary_lower = resume.summary.lower()
        hits = sum(1 for kw in jd_keywords[:10] if kw in summary_lower)
        if hits < 2:
            issues.append(
                "Professional summary doesn't reference key JD skills — "
                "tailor it to include role-specific keywords"
            )
    elif not resume.summary:
        issues.append(
            "No professional summary — add a 3–4 line summary targeting this role"
        )

    total = min(20, sem_score + quant_score + verb_score)
    return total, issues


def _score_recruiter(resume, jd_text: str) -> tuple[int, list[str]]:
    """
    Recruiter / Naukri profile signals: 0–20 pts.

    Four equal 5-point signals: location, complete contact, online presence,
    title alignment with the JD.
    """
    score = 0
    issues: list[str] = []
    resume_text = _resume_to_text(resume)

    # Signal 1: Location (5 pts)
    if resume.contact.city:
        score += 5
    else:
        city_found = any(c in resume_text for c in INDIA_CITIES)
        if city_found:
            score += 5
        else:
            issues.append(
                "Location missing — add your current city to the Contact section "
                "(e.g. 'Bengaluru, Karnataka')"
            )

    # Signal 2: Complete contact (5 pts)
    if resume.contact.email and resume.contact.phone:
        score += 5
    else:
        issues.append(
            "Contact info incomplete — ensure both email and phone are filled in"
        )

    # Signal 3: Online presence (5 pts)
    has_online = bool(resume.contact.linkedin or resume.contact.github)
    if has_online:
        score += 5
    else:
        issues.append(
            "Add your LinkedIn or GitHub URL — recruiters screen for online presence"
        )

    # Signal 4: Title alignment with JD (5 pts)
    if jd_text.strip():
        jd_first_line = jd_text.strip().split("\n")[0].lower()
        job_title = resume.contact.jobTitle.lower()
        title_words = [w for w in job_title.split() if len(w) > 3]
        if title_words and any(w in jd_first_line for w in title_words):
            score += 5
        elif resume.experience:
            last_title = resume.experience[0].position.lower()
            exp_words = [w for w in last_title.split() if len(w) > 3]
            if exp_words and any(w in jd_first_line for w in exp_words):
                score += 5
            else:
                issues.append(
                    f"Your job title doesn't align with the JD — "
                    "update your header title to match the target role"
                )
        else:
            score += 3  # partial credit — no experience to compare
    else:
        score += 5  # no JD to penalise against

    return min(20, score), issues


# ── Public entry point ────────────────────────────────────────────────────────

def compute_ats_score(request: ATSScoreRequest) -> ATSScoreResponse:
    """
    Main scoring function — accepts a validated ATSScoreRequest, returns an
    ATSScoreResponse whose shape exactly matches the TypeScript ATSScore interface.

    Isolation from the web framework means this function can be called verbatim
    from an AWS Lambda handler, a CLI, or a test.
    """
    resume = request.resume
    jd_text = request.jdText

    resume_text = _resume_to_text(resume)

    # NLP: keyword extraction (spaCy + pattern matching)
    jd_keywords = _extract_jd_keywords(jd_text) if jd_text.strip() else []

    # Semantic similarity (sentence-transformers) — skip if no JD
    if jd_text.strip():
        semantic_sim = _cosine_similarity(resume_text, jd_text)
    else:
        semantic_sim = 0.0

    # Four scoring dimensions
    keyword_score, matched_keywords, missing_keywords = _score_keywords(
        resume_text, jd_keywords
    )
    formatting_score, formatting_issues = _score_formatting(resume)
    content_score, content_issues = _score_content(
        resume, jd_keywords, semantic_sim, jd_text
    )
    recruiter_score, naukri_issues = _score_recruiter(resume, jd_text)

    total = min(100, keyword_score + formatting_score + content_score + recruiter_score)

    # Consolidate fixes; keyword gap always last (lowest-effort-highest-impact pattern)
    all_issues: list[str] = [
        *formatting_issues,
        *naukri_issues,
        *content_issues,
    ]
    if missing_keywords:
        top_missing = ", ".join(missing_keywords[:5])
        all_issues.append(f"Add missing keywords to your resume: {top_missing}")

    return ATSScoreResponse(
        total=total,
        breakdown=ScoreBreakdown(
            keyword=keyword_score,
            formatting=formatting_score,
            naukri=recruiter_score,
            content=content_score,
        ),
        missingKeywords=missing_keywords[:25],
        matchedKeywords=matched_keywords[:35],
        formattingIssues=formatting_issues,
        naukriIssues=naukri_issues,
        contentIssues=content_issues,
        topFixes=all_issues[:5],
        semanticSimilarity=round(semantic_sim, 4),
        extractedSkills=jd_keywords[:30],
    )
