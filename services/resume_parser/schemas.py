from __future__ import annotations

from pydantic import BaseModel, Field


class ResumeContact(BaseModel):
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


class ResumeExperience(BaseModel):
    id: str = ""
    company: str = ""
    position: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    currentlyWorking: bool = False
    description: str = ""


class ResumeEducation(BaseModel):
    id: str = ""
    institution: str = ""
    degree: str = ""
    field: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    currentlyStudying: bool = False
    score: str = ""


class ResumeSkill(BaseModel):
    id: str = ""
    name: str = ""
    level: str = "Intermediate"


class ResumeProject(BaseModel):
    id: str = ""
    name: str = ""
    description: str = ""
    url: str = ""
    startDate: str = ""
    endDate: str = ""


class ResumeCertification(BaseModel):
    id: str = ""
    name: str = ""
    issuer: str = ""
    issueDate: str = ""
    expiryDate: str = ""
    doesNotExpire: bool = False
    credentialId: str = ""
    credentialUrl: str = ""


class ResumeLanguage(BaseModel):
    id: str = ""
    name: str = ""
    proficiency: str = ""


class ResumeData(BaseModel):
    contact: ResumeContact = Field(default_factory=ResumeContact)
    summary: str = ""
    experience: list[ResumeExperience] = Field(default_factory=list)
    education: list[ResumeEducation] = Field(default_factory=list)
    skills: list[ResumeSkill] = Field(default_factory=list)
    projects: list[ResumeProject] = Field(default_factory=list)
    certifications: list[ResumeCertification] = Field(default_factory=list)
    languages: list[ResumeLanguage] = Field(default_factory=list)
