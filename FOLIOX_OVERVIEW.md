# FolioX — Codebase Overview

> Onboarding context for AI coding sessions. Everything below is derived from the actual code in this repo. File paths are cited inline. Where something could not be determined from the code, it is called out explicitly.

> Note: `package.json` `name` is `foliox`; the repo folder is `passcv` and the Vercel project is `passcv` (`.vercel/project.json`). Some backend code/comments still say "TailorCV" (`services/ats_scorer/main.py`). The product name in all UI copy is **FolioX**.

---

## 1. Product Summary

**FolioX is an AI-powered resume builder + ATS optimizer targeted primarily at the Indian job market** (Naukri/LinkedIn-centric copy, ₹ pricing, India-city detection in scoring).

Two distinct product surfaces exist in the code:

1. **"Tailor My Resume"** flow (`/tailor` → `/score` → `/rewrite`): upload an existing resume (PDF/DOCX) + paste a job description → get a free 100-point ATS score → pay ₹49 → Claude rewrites the resume section-by-section against the JD → download an ATS-safe DOCX + a Naukri profile text block.
2. **"Build New Resume"** flow (`/dashboard` → `/builder`): a from-scratch live resume builder with 15 templates, live preview, live ATS scoring, drag-and-drop section ordering, and inline AI assists (summary generation, bullet enhancement, skill/keyword suggestions). Exports to PDF (client-side via `@react-pdf/renderer`).

**Value proposition** (from `app/page.tsx`, `app/tailor/page.tsx`, `app/layout.tsx`):
- "Resumes that open doors." / "AI-Powered Resume Builder"
- "Upload once. Get your ATS score free. Rewrite with AI for ₹49."
- Positioned around ATS compatibility with "every major ATS": Naukri, LinkedIn, Taleo, Darwinbox, Keka, Workday.
- Trust/privacy copy: "Resumes uploaded are auto-deleted after 24h · No human review" (this is a **marketing claim in footer copy only — no auto-delete logic exists in the code**; uploaded files are sent to Claude for parsing and not persisted server-side at all).

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 14.2.35 (App Router), React 18 (`package.json`, `app/` dir).
- **Language:** TypeScript 5, `strict: true` (`tsconfig.json`), path alias `@/* → ./*`.
- **Styling:** Tailwind CSS 3.4 (`tailwind.config.ts`, `darkMode: 'class'`) + heavy use of inline `style` objects. `next-themes` for light/dark theming (`components/ThemeProvider.tsx`, `ThemeToggle.tsx`). Fonts via `next/font` (Inter; Geist woff files in `app/fonts/`).
- **Animation:** `framer-motion`.
- **Icons:** `lucide-react`.
- **Drag & drop:** `@hello-pangea/dnd` (section + item reordering in the builder).
- **Virtualization:** `@tanstack/react-virtual` (present in deps; used where large lists render).

### State management
- **Zustand 5** — two persisted stores + one ephemeral UI store:
  - `lib/store/useResumeStore.ts` — the builder resume (slice-composed; `persist` to `localStorage` key `resume-builder-storage`, versioned with migrations).
  - `lib/store/useRewriteStore.ts` — the tailor/upload flow (`persist` to **sessionStorage**, key `rewrite-storage`).
  - `lib/store/useUIStore.ts` — ephemeral cross-component signals (section focus, JD text, highlighted experience).
- **TanStack React Query 5** — used for debounced live ATS scoring in the builder (`hooks/useAtsScoreQuery.ts`). Provider in `components/Providers.tsx`.

### Backend / API layer
- **Next.js Route Handlers** under `app/api/**` (serverless functions on Vercel). No separate Node server.
- **Server Actions:** auth only (`app/auth/actions.ts`, `'use server'`).
- **Python microservices** (`services/`) — see §3/§7. Optional, called via proxy.

### Database & ORM
- **Supabase (Postgres)** via `@supabase/supabase-js` + `@supabase/ssr`. No ORM — direct Supabase client queries. Schema in `database-schema.sql` (single `resumes` table with RLS). Clients in `utils/supabase/{client,server,middleware}.ts`.
- **Note:** DB usage is minimal and largely **inactive** — see §5/§8. The builder persists to `localStorage`; autosave-to-Supabase exists (`hooks/useAutosaveSync.ts`) but only runs if a `resumeId` and configured Supabase client both exist, and nothing in the app currently creates a `resumeId`.

### Auth
- **Supabase Auth** (email/password) via server actions `login`/`signup`/`signout` in `app/auth/actions.ts`; UI in `app/login/page.tsx`, `app/signup/page.tsx`.
- **Auth is currently BYPASSED.** `middleware.ts` short-circuits `updateSession` and lets all routes through (comment: "Auth is bypassed for local development"). `/dashboard` and `/builder` are reachable with no session.

### Hosting / deployment
- **Vercel** (`.vercel/project.json` → projectName `passcv`; `vercel.json` sets `maxDuration: 60` for AI/parse routes).
- `next.config.mjs`: marks `pdf-parse`, `mammoth`, `@react-pdf/renderer` as `serverComponentsExternalPackages`; stubs `canvas` in the browser bundle.
- Python ATS scorer designed for **AWS Lambda container image** (`services/ats_scorer/Dockerfile`, `lambda_handler.py` via Mangum) behind API Gateway, or run locally with uvicorn on `:8001`.

### Third-party services / SDKs (from `package.json`)
| Package | Purpose |
|---|---|
| `@anthropic-ai/sdk` (^0.96.0) | **Claude** — all AI (parsing, rewrite, summary, bullets, keywords, skills, cover letter, Naukri profile) |
| `razorpay` (^2.9.6) | Payments (₹49 single / ₹299 pro) — order creation + HMAC signature verify |
| `@supabase/supabase-js`, `@supabase/ssr` | Postgres DB + Auth |
| `@react-pdf/renderer` (^4.5.1) | PDF resume generation (React → PDF) |
| `docx` (^9.6.1) | DOCX resume + cover-letter generation |
| `pdf-parse` (^2.4.5), `mammoth` (^1.12.0) | Text extraction (mammoth for DOCX in `/api/parse`; pdf-parse present but PDF parsing actually uses Claude's native PDF support) |
| `@tanstack/react-query`, `@tanstack/react-virtual` | Data fetching / virtualization |
| `@hello-pangea/dnd` | Drag-and-drop |
| `zod` (^4.4.3) | Schema validation (`lib/schemas.ts`) |
| `zustand` (^5.0.13) | State |
| `framer-motion`, `lucide-react`, `next-themes`, `react-dropzone`, `clsx`, `uuid` | UI utilities |

**Python services** (`requirements.txt`, `services/ats_scorer/requirements.txt`): FastAPI, uvicorn, `openai` (used by the *separate* resume_parser service), `pdfplumber`, `python-docx`; ATS scorer additionally uses `sentence-transformers` (all-MiniLM-L6-v2), `spacy` (en_core_web_sm), `numpy`, `mangum`.

---

## 3. Architecture

### Top-level directory responsibilities
```
app/                 Next.js App Router: pages + API route handlers
  api/               Serverless route handlers (AI, scoring, payment, docx, pdf, parse)
  auth/actions.ts    Supabase auth server actions
  builder/           From-scratch resume builder (live preview) page
  dashboard/         Entry hub: "Tailor" vs "Build New"
  tailor/ score/ rewrite/   The 3-step upload→score→rewrite wizard
  sections/          OLDER/legacy per-section editor flow (see §8)
  login/ signup/     Auth UI
  templates/         Template gallery page
  layout.tsx page.tsx globals.css error.tsx   Root shell, landing page, styles

components/
  builder/           Builder editor panel, steps/*, preview, widgets (ATS, health, stats, insights)
  builder/steps/     Per-section form editors (Personal, Summary, Skills, Experience, ...)
  resume-templates/  15 HTML/React live-preview templates + index registry + shared.ts
  templates/         react-pdf templates (used for PDF/DOCX export) + baseRenderer
  PaymentModal, DiffView, ScoreReport, UploadZone, WizardProgress, Providers, Theme*  ...

lib/
  types.ts           Central TS interfaces (ParsedResume, ResumeData, ATSScore, ...)
  schemas.ts         Zod schemas mirroring types.ts
  scoring.ts         Client-side ATS scoring engine + JD parser + data mappers
  scoringWeights.ts  Scoring weight constants
  claude.ts          Claude rewrite orchestration (tailor flow)
  bulletRefinement.ts / bulletAnalyzer.ts   Human-likeness bullet post-processing
  resumePdf.ts       Client PDF blob generation (maps templateId → react-pdf component)
  templates.ts       TEMPLATE_META registry (id/label/ats/blurb) — single source of truth
  resumeImport.ts    ParsedResume → builder ResumeData adapter
  store/             Zustand stores + slices + selectors
  workers/score.worker.ts   Web Worker running scoring off the main thread
  api/semanticScorer.ts     Typed frontend boundary to Python scorer

hooks/               React hooks (AI enhancer/rewrite, ATS score, autosave, stats, debounce, ...)
utils/supabase/      Supabase browser/server/middleware clients
services/            Python microservices (ats_scorer = FastAPI+Lambda; resume_parser = FastAPI)
legacy_api/          OLD Vercel Python serverless functions (parse.py, generate_docx.py) — see §8
middleware.ts        Next middleware (auth currently no-op)
database-schema.sql  Supabase resumes table + RLS policies
```

### Data flow

**Tailor flow (upload → rewrite):**
1. `components/UploadZone.tsx` reads the file → base64 → `POST /api/parse`.
2. `app/api/parse/route.ts` sends PDF (Claude native document support) or DOCX-extracted text (mammoth) to Claude Haiku → returns `ParsedResume` JSON. Stored in `useRewriteStore`.
3. `/tailor` `handleAnalyze` → `POST /api/score` → `lib/scoring.ts` `parseJD` + `calculateScore` → `ATSScore`. Navigate to `/score`.
4. `/score` `handleRewriteClick` → `POST /api/rewrite` → `lib/claude.ts` `rewriteResume` (Claude Sonnet, 2-step: extract keywords → rewrite). Navigate to `/rewrite`.
5. `/rewrite` (`DiffView`) shows original vs rewritten, editable. Download via `POST /api/generate_docx` (docx). Naukri text via `POST /api/naukri-profile`; cover letter via `POST /api/cover-letter`.

**Builder flow:**
1. `app/builder/page.tsx` binds `useResumeStore` (persisted to localStorage). `EditorPanel` renders lazy `steps/*` editors that mutate the store via slices.
2. Live preview: `components/builder/ResumePreview.tsx` renders the selected HTML template (`components/resume-templates/index.tsx` → `HTML_TEMPLATES[templateId]`).
3. Live ATS score: builder posts `{data, jdText}` to a **Web Worker** (`lib/workers/score.worker.ts`) running `lib/scoring.ts`; result shown in `ScoreFooterBar`. Widgets (`ATSScoreWidget`) use `hooks/useAtsScoreQuery.ts` → `/api/ats-score` (Python) with client-side fallback.
4. Inline AI: steps call `/api/builder/*` (Claude Haiku).
5. Autosave: `hooks/useAutosaveSync.ts` debounces (1.5 s) and `UPDATE`s the Supabase `resumes` row — **only if `resumeId` is set** (see §8).
6. Export: `handleDownload` dynamically imports `lib/resumePdf.ts` → generates PDF blob **client-side**.

### Key design patterns
- **Route Handlers** for all API; **Server Actions** only for auth.
- **Zustand slice pattern** — `useResumeStore` composed from 13 slices (`lib/store/slices/*`), typed via `StoreState` in `slices/types.ts`.
- **Persist + migrate** — versioned store migrations & `onRehydrateStorage` back-fill of new sections into `sectionOrder`.
- **Proxy-with-fallback** — `/api/ats-score` forwards to the Python service if `ATS_SCORER_URL` is set, else falls back to TS scoring (`lib/scoring.ts`).
- **Web Worker offloading** — scoring runs off the main thread in the builder.
- **Typed API boundary** — `lib/api/semanticScorer.ts` is the only module that knows the scorer endpoint/shape.
- **Dual template systems** — HTML templates for on-screen preview, react-pdf templates for export (mapped in `lib/resumePdf.ts`; not 1:1 — see §8).
- **Streaming SSE** — `/api/builder/rewrite` streams Claude tokens as `text/event-stream`.

---

## 4. Core Features (as implemented)

| Feature | Where | Notes / edge cases |
|---|---|---|
| **Landing page** (animated taglines, ATS chips, feature cards) | `app/page.tsx` | Pure marketing; theme-aware via CSS vars. |
| **Dashboard hub** | `app/dashboard/page.tsx` | Two cards: Tailor vs Build. "Create new" calls `reset()`; a single hardcoded "My Resume" demo card. No real saved-resume list. |
| **Resume upload & parse** | `components/UploadZone.tsx`, `app/api/parse/route.ts` | PDF via Claude native document; DOCX via mammoth (text sliced to 8000 chars). Only `.pdf`/`.docx`; UI says max 2 MB (not enforced server-side). Parsing model: `claude-haiku-4-5-20251001`. |
| **ATS scoring (rule-based)** | `lib/scoring.ts`, `app/api/score/route.ts` | 100 pts: keyword 40 / formatting 20 / naukri 20 / content 20. JD parsed heuristically. India-specific signals. |
| **ATS scoring (semantic)** | `services/ats_scorer/*`, `app/api/ats-score/route.ts`, `hooks/useAtsScoreQuery.ts` | Python: sentence-transformers cosine sim + spaCy noun-chunk keyword extraction. Same 4-bucket shape; adds `semanticSimilarity`, `extractedSkills`. Falls back to TS scoring if service down. |
| **Score report UI** | `components/ScoreReport.tsx`, `app/score/page.tsx` | Breakdown + top fixes + rewrite CTA. |
| **AI resume rewrite (tailor)** | `lib/claude.ts`, `app/api/rewrite/route.ts` | Claude Sonnet `claude-sonnet-4-20250514`. 2-step: extract top-20 JD keywords → rewrite. Strict "never fabricate" rules. Zod-validates input. |
| **Diff / edit rewritten resume** | `components/DiffView.tsx`, `app/rewrite/page.tsx` | Side-by-side original vs rewritten, inline-editable, feeds `edited` in store. |
| **From-scratch builder** | `app/builder/page.tsx`, `components/builder/*` | Resizable split editor/preview, zoom, font/accent/spacing controls, template picker, live score footer, completion %, page/word estimate. |
| **Section editors (13)** | `components/builder/steps/*` | Personal, Summary, Skills, Experience, Education, Projects, Certifications, Languages, Publications, Courses, Awards, Volunteer, CustomSection. Drag-reorder via dnd. |
| **Section reordering / hide** | `EditorPanel.tsx`, `globalSlice.ts` (`sectionOrder`, `hiddenSections`) | Persisted + migrated. |
| **15 live-preview templates** | `components/resume-templates/*`, `index.tsx`, `lib/templates.ts` | classic, sidebar-dark, executive-bold, creative-purple, swiss-grid, infographic, minimalist-mono, magazine-spread, card-stack, timeline-left, government, dark-mode, elegant-serif, startup-bold, academic-cv. Each flagged ATS-safe or "Stylized". |
| **Template gallery** | `app/templates/page.tsx`, `components/templates/TemplateGallery.tsx` | Browse all templates. |
| **Import resume into builder** | `components/builder/ImportResumeModal.tsx`, `lib/resumeImport.ts` | Reuses `/api/parse`, adapts `ParsedResume` → builder `ResumeData`. |
| **AI: generate summary** | `app/api/builder/generate-summary/route.ts`, `steps/SummaryStep.tsx` | Haiku, 3–4 sentence summary from experience+skills. |
| **AI: enhance bullets** | `app/api/builder/enhance-bullets/route.ts` + `lib/bulletRefinement.ts` | Haiku (temp 0.7) then local human-likeness post-processing (repetition detection, verb variety). |
| **AI: suggest skills** | `app/api/builder/suggest-skills/route.ts`, `steps/SkillsStep.tsx` | Haiku, exactly 10 skills from job title. |
| **AI: suggest keywords** | `app/api/builder/suggest-keywords/route.ts` | Haiku, 6–8 missing ATS keywords for the summary. |
| **AI: streaming rewrite (builder)** | `app/api/builder/rewrite/route.ts`, `hooks/useAiRewrite.ts` | Haiku SSE stream; rewrites a summary or experience block against optional JD. |
| **PDF export** | `lib/resumePdf.ts`, `app/api/builder/pdf/route.ts` | Client-side blob is primary (`generateBuilderPdfBlob`); server route also exists. Uses react-pdf templates (subset of 5, mapped from the 15). |
| **DOCX export** | `app/api/generate_docx/route.ts` | Resume + cover-letter DOCX via `docx`. Adds a "declaration" line; India-style. |
| **Cover letter generation** | `app/api/cover-letter/route.ts` | Haiku, 3-paragraph, India corporate tone. |
| **Naukri profile text** | `app/api/naukri-profile/route.ts` | Haiku → headline/summary/keySkills with hard char limits (250/2500/15). |
| **Payments** | `components/PaymentModal.tsx`, `app/api/payment/{create-order,verify}/route.ts` | Razorpay. Plans: single ₹49 (4900 paise) / pro ₹299 (29900 paise). HMAC-SHA256 signature verify. |
| **Live widgets** | `components/builder/*Widget.tsx` | ATSScoreWidget, ResumeHealthWidget, ResumeInsightsWidget, ResumeStatsWidget, ScoreBreakdownWidget, ATSKeywordScanner. |
| **Theming (light/dark)** | `next-themes`, `ThemeProvider`, `ThemeToggle` | class-based dark mode. |

---

## 5. Data Models / Schema

### Database (Supabase Postgres) — `database-schema.sql`
Single table:
```
resumes
  id          UUID  PK  default gen_random_uuid()
  user_id     UUID  FK → auth.users(id)  NOT NULL
  name        TEXT  NOT NULL
  data        JSONB NOT NULL           -- the full ResumeData blob
  created_at  TIMESTAMPTZ default now()
  updated_at  TIMESTAMPTZ default now()
```
- **RLS enabled**; policies restrict INSERT/SELECT/UPDATE/DELETE to `auth.uid() = user_id`.
- **Relationship:** `resumes.user_id → auth.users.id` (Supabase-managed auth table). No other tables. Payments/credits are **not** persisted (verify route has a `// In production: save to DB` comment).

### Application data shapes (TypeScript — `lib/types.ts`; Zod mirrors in `lib/schemas.ts`)

Two resume representations exist:

**A. `ParsedResume`** (upload/tailor flow — flat, string-array skills):
`contact{name,email,phone,location,linkedin?}`, `summary`, `experience[]{company,title,startDate,endDate,bullets[]}`, `education[]{institution,degree,field,year,cgpa?}`, `skills[]`, `certifications[]`, `noticePeriod?`, `ctc?`, `hasMultiColumn/hasTables/hasImages`, `rawText?`, `projects[]?`, `languages[]?`.

**B. `ResumeData`** (builder — richer, id'd, level'd):
- `contact`: `{firstName,lastName,jobTitle,email,phone,city,country,linkedin,github,website}`
- `summary: string`
- `experience[]`: `{id,company,position,location,startDate,endDate,currentlyWorking,description}` (description = newline-joined bullets)
- `education[]`: `{id,institution,degree,field,location,startDate,endDate,currentlyStudying,score}`
- `skills[]`: `{id,name,level}`
- `projects[]`: `{id,name,description,url,startDate,endDate}`
- `certifications[]`: `{id,name,issuer,issueDate,expiryDate,doesNotExpire,credentialId,credentialUrl}`
- `languages[]`: `{id,name,proficiency}` (proficiency is a 5-value union `LanguageProficiency`)
- `publications[]?`: `{id,title,publisher,date,coAuthors,url}`
- `courses[]?`: `{id,name,platform,completionDate,certificateUrl}`
- `awards[]?`: `{id,name,issuer,date,description}`
- `volunteer[]?`: `{id,organization,role,location,startDate,endDate,currentlyVolunteering,description}`
- `customSections[]?`: `{id,title,items[]{id,name,description}}`

**Mapping:** `lib/scoring.ts#mapResumeDataToParsedResume` (ResumeData→ParsedResume) and `lib/resumeImport.ts#parsedToBuilderData` (ParsedResume→ResumeData). `lib/resumePdf.ts#adaptToResumeData` adapts `ParsedResume|RewrittenResume` for PDF.

**Other shapes:** `ParsedJD`, `ScoreBreakdown`, `ATSScore`, `RewrittenResume` (adds `naukriProfileText`), `NaukriProfile`, `TemplateId` (union of 15 ids).

**Store persistence keys:** `resume-builder-storage` (localStorage, `useResumeStore`), `rewrite-storage` (sessionStorage, `useRewriteStore`), plus `resumeBuilder_font` (localStorage, set in builder page).

---

## 6. API Surface

All under `app/api/`. **None enforce authentication** (middleware auth is a no-op; no route reads a session). Inputs/outputs are JSON unless noted.

| Route | Method | Purpose | Input | Output | Auth |
|---|---|---|---|---|---|
| `/api/parse` | POST | Parse uploaded resume | `{content: base64, filename}` | `ParsedResume` JSON | none. Requires `ANTHROPIC_API_KEY`. `maxDuration 60`. Model: Haiku. PDF→native doc, DOCX→mammoth. |
| `/api/score` | POST | Rule-based ATS score | `{resume: ParsedResume, jdText}` | `{score: ATSScore, jd: ParsedJD}` | none. Pure TS (`lib/scoring.ts`). |
| `/api/ats-score` | POST | Semantic ATS score (proxy) | `{resume: ResumeData, jdText}` | `ATSScore` (+`semanticSimilarity`,`extractedSkills`) | none. Proxies to `ATS_SCORER_URL` (12 s timeout) or falls back to TS scoring. |
| `/api/rewrite` | POST | AI rewrite (tailor) | `{resume: ParsedResume, jdText}` | `{rewritten: RewrittenResume, jd}` | none. Zod-validates resume. Model: **Sonnet** `claude-sonnet-4-20250514`. `maxDuration 60`. |
| `/api/builder/rewrite` | POST | Streaming section rewrite | `{originalText, jdText?, sectionType:'summary'\|'experience', context?}` | SSE `text/event-stream` (`data: "<token>"` … `data: [DONE]`) | none. Model: Haiku. |
| `/api/builder/generate-summary` | POST | Generate summary | `{experience[], skills[], jobTitle}` | `{summary}` | none. Haiku. |
| `/api/builder/enhance-bullets` | POST | Rewrite bullets + refine | `{text, position?, company?}` | `{enhancedText, metadata}` | none. Haiku + local refinement. |
| `/api/builder/suggest-skills` | POST | Suggest 10 skills | `{jobTitle, industry?}` | `{skills[]}` | none. Haiku. |
| `/api/builder/suggest-keywords` | POST | Missing ATS keywords | `{summary,jobTitle,skills[],experience[]}` | `{keywords[]}` (≤10) | none. Haiku. |
| `/api/builder/pdf` | POST | Server PDF render | `{data,templateId,sectionOrder,builderDesign}` | `application/pdf` | none. react-pdf (5-template subset). |
| `/api/cover-letter` | POST | Generate cover letter | `{resume: ParsedResume, jdText, jobTitle}` | `{coverLetter}` | none. Haiku. `maxDuration 60`. |
| `/api/naukri-profile` | POST | Naukri profile text | `{resume: RewrittenResume, jobTitle}` | `NaukriProfile` (enforced limits) | none. Haiku. |
| `/api/generate_docx` | POST | DOCX (resume or cover letter) | resume mode `{resume,jobTitle}` / `{type:'cover_letter',coverLetter,name,jobTitle}` | `.docx` attachment | none. `docx`. |

**Auth surface (server actions, not routes):** `app/auth/actions.ts` — `login`, `signup`, `signout` (Supabase). `revalidatePath` + `redirect`.

**Error convention:** most routes return `{ error }` with 400/500/502. Missing `ANTHROPIC_API_KEY` → 500 "misconfiguration"/"not configured".

---

## 7. Resume-Specific Logic

### Internal resume shape
See §5. Builder is `ResumeData` (id'd sections, bullets stored as a single newline-delimited `description` string per experience/project/volunteer). Tailor flow is `ParsedResume` (bullets as `string[]`). The two are bridged by explicit mapper functions.

### Templates & rendering
- **Live preview (on-screen):** HTML/React templates in `components/resume-templates/` registered in `index.tsx` as `HTML_TEMPLATES: Record<TemplateId, FC<TemplateProps>>`. `ResumeDoc` renders the chosen template inside a fixed A4 sheet (`SHEET_W`/`SHEET_H` from `shared.ts`) and blanks out hidden sections (`applyHidden`). The builder scales the sheet with a CSS `transform: scale(zoom)`.
- **PDF export:** `@react-pdf/renderer` templates in `components/templates/` (`ClassicTemplate`, `ModernTemplate`, `MinimalTemplate`, `ExecutiveTemplate`, `SidebarTemplate`, `ElegantTemplate`, `CreativeTemplate`, `AcademicTemplate`, `BoldTemplate`, `ContemporaryTemplate`). `lib/resumePdf.ts` maps all 15 `TemplateId`s onto this **subset of ~10** react-pdf components (several ids share one PDF design — e.g. `swiss-grid`/`card-stack`→Modern). **PDF ≠ on-screen for stylized templates** (see code comment: "Exact PDF parity … is a planned follow-up"). Primary export path is client-side `generateBuilderPdfBlob` (`app/builder/page.tsx#handleDownload`); a server route `/api/builder/pdf` exists but only knows 5 templates.
- **DOCX:** hand-built in `app/api/generate_docx/route.ts` (single-column, navy headings, bullets, declaration line).
- **Live preview mechanism:** Zustand store → `useDebounce(data, 300)` → `ResumePreview` re-renders; scoring runs in a Web Worker in parallel.

### ATS scoring logic (two engines, same 4-bucket shape)
- **TS engine** (`lib/scoring.ts`): keyword 40 (JD-keyword coverage), formatting 20 (deductions for multi-column/tables/images/bad dates), naukri 20 (notice period, CTC, location, title-match — with India-city fallback), content 20 (bullet quantification + action-verb ratio + summary keyword alignment). `parseJD` extracts skills/tools/seniority/domain heuristically from constant keyword lists.
- **Python engine** (`services/ats_scorer/scorer.py`): same buckets but content uses **sentence-transformers (all-MiniLM-L6-v2) cosine similarity** (0–10 pts) + quantification + verbs; keywords extracted via 4-pass (constant list, PascalCase, ALL-CAPS acronyms, spaCy noun-chunks with graceful fallback). Response mirrors TS `ATSScore` exactly plus extras. Weight constants are explicitly kept in sync with `lib/scoring.ts`.

### AI / LLM integration
**Provider: Anthropic Claude** (`@anthropic-ai/sdk`). Two models in use:
- **`claude-sonnet-4-20250514`** — tailor-flow full rewrite only (`lib/claude.ts`).
- **`claude-haiku-4-5-20251001`** — everything else (parse, builder rewrite/summary/bullets/skills/keywords, cover letter, Naukri profile).

Triggers & prompts:
- **Parse** (`/api/parse`): fixed `PARSE_PROMPT` demanding strict JSON; PDF sent as native document block.
- **Rewrite** (`lib/claude.ts`): step 1 extracts "top 20 ATS keywords" as JSON array; step 2 system prompt = "expert ATS resume writer for Indian job markets" with strict rules (use exact keywords, mirror JD terminology, never fabricate, remove irrelevant bullets). Returns full resume JSON.
- **Builder rewrite** (`/api/builder/rewrite`): system prompt = "expert ATS Resume Writer" with action-verb/quantify rules, `[N]%`/`[X]x` placeholders when metrics unknown, ±20% length; streamed.
- **Enhance bullets** (`/api/builder/enhance-bullets`): "HUMAN, NATURAL-SOUNDING" system prompt (bans corporate jargon/weak verbs), temp 0.7, then local `refineBullets`/`detectRepetition` post-processing (`lib/bulletRefinement.ts`; examples in `.examples.ts`; algorithm doc in `BULLET_GENERATION_IMPROVEMENTS.md`).
- **Summary/skills/keywords/cover letter/Naukri**: single-shot Haiku prompts, JSON or text output, hard output limits where relevant.

> **Separate, unused parser:** `services/resume_parser/main.py` uses **OpenAI** (`gpt-4.1-mini` via `client.responses.create`) + pdfplumber/python-docx. This is a standalone FastAPI service **not wired into the Next.js app** (the app uses `/api/parse` with Claude). Treat as alternative/experimental.

---

## 8. Known Gaps / TODOs

**Explicit markers in code:**
- `app/api/payment/verify/route.ts:18` — `// In production: save to DB, mark credit as used`. **Payment verification succeeds but grants nothing** — no credit/entitlement is stored, and no route checks payment before rewriting. The AI rewrite is effectively free/unguarded.
- `lib/resumePdf.ts:73` — comment: react-pdf templates are approximations; "Exact PDF parity for the new designs is a planned follow-up."
- `services/ats_scorer/main.py:23` — `allow_origins=["*"]  # tighten … in production`. Same in `resume_parser/main.py`.

**Auth / security:**
- **Auth is disabled** (`middleware.ts` no-op). `/dashboard`, `/builder`, and all API routes are public. Supabase login/signup UI + actions exist but are effectively decorative given the middleware bypass.
- **No authorization on API routes** — any caller can hit AI endpoints (cost/abuse exposure; no rate limiting).
- **No payment gating** — nothing enforces the ₹49 paywall the UI advertises.
- CORS wide-open on both Python services.

**Persistence gaps:**
- The builder saves to **localStorage only**. `useAutosaveSync` (Supabase) is wired but never activates because **nothing sets `resumeId`** and no code path creates a `resumes` row. Dashboard shows a single hardcoded demo card, not real saved resumes.
- Supabase env vars are referenced by `utils/supabase/*` but the app runs fine without them (clients degrade to null).

**Feature completeness / dead-ish code:**
- **`app/sections/*`** (index, summary, experience, skills, naukri, edit, preview) is an **older/parallel per-section flow** not linked from the main nav — appears superseded by `/builder` and `/tailor`. Verify before relying on it.
- **`legacy_api/`** (`parse.py`, `generate_docx.py`) — old Vercel Python serverless functions, superseded by the TS `/api/parse` and `/api/generate_docx`.
- **`services/resume_parser/`** (OpenAI-based) is not called by the frontend.
- `pdf-parse` is a dependency but PDF parsing actually uses Claude's native document support; `@types/pdf-parse` present.
- Root contains stray/dev artifacts: `files.txt` (~2.9 MB), `Jeevith_R_resume.pdf`, `update_inputs.js`, `update_inputs_accent.js`, `tsconfig.tsbuildinfo`.
- The `requirements.txt` at repo root is for `resume_parser` (OpenAI), distinct from the ATS scorer's own requirements.

**Quality/robustness:**
- **No test files** anywhere (no `*.test.*`, no test runner in `package.json`).
- Only one React error boundary: `app/error.tsx` (root). No per-route boundaries.
- LLM JSON parsing relies on regex extraction (`extractJson`, `match(/\{[\s\S]*\}/)`) — brittle if Claude wraps output unexpectedly.
- DOCX upload text is truncated to 8000 chars in `/api/parse`; semantic scorer truncates resume/JD to ~2000/1500 chars for embeddings.
- Product naming inconsistency (FolioX vs TailorCV vs passcv) across UI/backend/repo.
- Landing/footer claim "auto-deleted after 24h" has **no corresponding deletion code**.

---

## 9. Environment & Config

From `.env.example`, `.env.local` (names only), and code usage:

| Var | Purpose | Used in |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key — required for all AI features (parse, rewrite, summary, bullets, keywords, skills, cover letter, Naukri) | `lib/claude.ts`, all `app/api/**` AI routes |
| `ATS_SCORER_URL` | Base URL of the Python semantic ATS scorer (e.g. `http://localhost:8001` or a Lambda URL). **Optional** — if unset, `/api/ats-score` falls back to TS scoring | `app/api/ats-score/route.ts` |
| `RAZORPAY_KEY_ID` | Razorpay public key id (returned to client for checkout) | `app/api/payment/create-order/route.ts` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret — order creation + HMAC signature verification | `app/api/payment/{create-order,verify}/route.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser + server clients) | `utils/supabase/*` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `utils/supabase/*` |
| `VERCEL_OIDC_TOKEN` | Present in `.env.local`; Vercel-injected OIDC token (tooling/deploy) — not read by app code | (Vercel platform) |

**Python `resume_parser` service** (not in `.env.example`; from `services/resume_parser/main.py`):
| Var | Purpose |
|---|---|
| `OPENAI_API_KEY` | Required to enable that service's AI parsing (OpenAI) |
| `OPENAI_MODEL` | Optional; defaults to `gpt-4.1-mini` |

**Other config files:** `next.config.mjs` (external packages, canvas stub), `vercel.json` (60 s max duration on AI/parse routes), `tailwind.config.ts`, `postcss.config.mjs`, `middleware.ts` (auth no-op), `tsconfig.json` (`@/*` alias). No `vercel.json` env or cron config; no `.env.production` in repo.
