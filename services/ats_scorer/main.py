"""
FastAPI application — thin HTTP adapter over the framework-agnostic scorer.

Run locally:
    uvicorn services.ats_scorer.main:app --port 8001 --reload

The scorer module is imported lazily inside the route so the sentence-transformer
model isn't loaded until the first real request, keeping startup time fast.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import ATSScoreRequest, ATSScoreResponse

app = FastAPI(
    title="TailorCV ATS Scorer",
    version="1.0.0",
    description="Semantic ATS scoring engine powering the TailorCV resume builder.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Next.js origin in production
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/api/ats-score", response_model=ATSScoreResponse)
async def ats_score(request: ATSScoreRequest) -> ATSScoreResponse:
    """
    Score a resume against a job description.

    Accepts the full ResumeData payload (same shape as the Zustand store) and
    an optional jdText string. Returns scores in the exact shape of the
    TypeScript ATSScore interface so the frontend needs no transformation.
    """
    try:
        from .scorer import compute_ats_score
        return compute_ats_score(request)
    except Exception as exc:
        # Surface unexpected errors clearly in dev; replace with logging in prod
        raise HTTPException(status_code=500, detail=str(exc)) from exc
