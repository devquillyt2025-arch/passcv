"""
Pydantic schemas for the ATS scorer service.

Field names use camelCase throughout to exactly match the TypeScript interfaces
in lib/types.ts — this ensures the JSON payload needs zero transformation on
either the frontend or the Python side.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


# ── Inbound resume payload (mirrors ResumeData in lib/types.ts) ───────────────

class ResumeContactPayload(BaseModel):
    firstName: str = ""
    lastName: str = ""
    jobTitle: str = ""
    email: str = ""
    phone: str = ""
    city: str = ""
    country: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""


class ResumeExperiencePayload(BaseModel):
    id: str = ""
    company: str = ""
    position: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    currentlyWorking: bool = False
    description: str = ""  # newline-delimited bullet points


class ResumeEducationPayload(BaseModel):
    id: str = ""
    institution: str = ""
    degree: str = ""
    field: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    currentlyStudying: bool = False
    score: str = ""


class ResumeSkillPayload(BaseModel):
    id: str = ""
    name: str = ""
    level: str = ""


class ResumeProjectPayload(BaseModel):
    id: str = ""
    name: str = ""
    description: str = ""
    url: str = ""
    startDate: str = ""
    endDate: str = ""


class ResumeCertificationPayload(BaseModel):
    id: str = ""
    name: str = ""
    issuer: str = ""
    issueDate: str = ""
    expiryDate: str = ""
    doesNotExpire: bool = False
    credentialId: str = ""
    credentialUrl: str = ""


class ResumeDataPayload(BaseModel):
    contact: ResumeContactPayload = Field(default_factory=ResumeContactPayload)
    summary: str = ""
    experience: list[ResumeExperiencePayload] = []
    education: list[ResumeEducationPayload] = []
    skills: list[ResumeSkillPayload] = []
    projects: list[ResumeProjectPayload] = []
    certifications: list[ResumeCertificationPayload] = []


# ── Request ───────────────────────────────────────────────────────────────────

class ATSScoreRequest(BaseModel):
    resume: ResumeDataPayload = Field(default_factory=ResumeDataPayload)
    jdText: str = ""  # camelCase matches frontend useUIStore field name


# ── Response (must match ATSScore in lib/types.ts exactly) ───────────────────

class ScoreBreakdown(BaseModel):
    """Mirrors TypeScript ScoreBreakdown interface."""
    keyword: int
    formatting: int
    naukri: int
    content: int


class ATSScoreResponse(BaseModel):
    """
    Mirrors TypeScript ATSScore interface exactly.
    Extra fields (semanticSimilarity, extractedSkills) are safe addenda —
    TypeScript will ignore unknown JSON keys when cast with 'as ATSScore'.
    """
    total: int
    breakdown: ScoreBreakdown
    missingKeywords: list[str]
    matchedKeywords: list[str]
    formattingIssues: list[str]
    naukriIssues: list[str]
    contentIssues: list[str]
    topFixes: list[str]
    # Extended fields — useful for the frontend keyword scanner
    semanticSimilarity: float = 0.0   # raw cosine similarity 0.0–1.0
    extractedSkills: list[str] = []   # skills extracted from the JD by NLP
