# FOLIOX_BUG_AUDIT

This document provides a systematic audit of the Foliox codebase across the requested categories, organized by severity.

## Critical Severity

### 1. Auth Middleware Bypass
- **Severity**: Critical
- **Location**: `middleware.ts`, line 7
- **Description**: The Next.js middleware is currently configured to bypass all authentication by returning `NextResponse.next()` unconditionally. The `updateSession` import is commented out.
- **Impact**: Any user can access protected routes, edit resumes, and hit AI APIs (which cost money) without an active session.
- **Fix status**: Fixed

### 2. Payment Verification Grants Nothing
- **Severity**: Critical
- **Location**: `app/api/payment/verify/route.ts`, line 18
- **Description**: The Razorpay webhook verifies the HMAC signature successfully but only contains a comment (`// In production: save to DB, mark credit as used`). 
- **Impact**: Users who pay do not get credits recorded, and the AI routes never check for payment, rendering the paywall completely decorative.
- **Fix status**: Fixed (Added user_credits migration and check/consume logic in AI routes)

## High Severity

### 3. Broken Builder Autosave (Missing `resumeId`)
- **Severity**: High
- **Location**: `hooks/useAutosaveSync.ts`, line 27 & `lib/store/slices/globalSlice.ts`, line 14
- **Description**: The `useAutosaveSync` hook correctly debounces state changes but requires a `resumeId` to execute the Supabase `UPDATE`. However, `resumeId` defaults to `null`, `setResumeId` is never called, and there is no code path that `INSERT`s a new row into the `resumes` table.
- **Impact**: The builder relies entirely on `localStorage`. If a user clears their browser cache or changes devices, their resume data is completely lost.
- **Fix status**: Fixed (Updated hook to insert a new row if resumeId is null and passed setResumeId to store it)

### 4. Missing Fields in Tailor Flow PDF Export
- **Severity**: High
- **Location**: `lib/resumePdf.ts`, lines 58-61
- **Description**: The `adaptToResumeData` function, used to map the Tailor flow's `ParsedResume` into the builder's `ResumeData` for PDF generation, explicitly hardcodes `projects: []`, `certifications: []`, and `languages: []`.
- **Impact**: If a user uploads a resume with projects, certifications, or languages, they will be parsed correctly but completely dropped from the final exported PDF.
- **Fix status**: Fixed

### 5. API Route Error Leakage
- **Severity**: High
- **Location**: `app/api/rewrite/route.ts`, line 34 (and similar AI routes)
- **Description**: The catch block returns `err instanceof Error ? err.message : 'Rewrite failed'` directly in a 500 response.
- **Impact**: If the Anthropic SDK throws an error (e.g. invalid API key, context limit exceeded), internal details or stack traces are leaked to the client.
- **Fix status**: Fixed

### 6. API Missing Output Validation
- **Severity**: High
- **Location**: `app/api/rewrite/route.ts`, line 28
- **Description**: The route validates the input payload but completely fails to validate Claude's JSON output (`rewritten`) against `RewrittenResumeSchema` before returning it to the client.
- **Impact**: If the LLM hallucinates an invalid JSON structure, it will crash the frontend instead of failing gracefully.
- **Fix status**: Fixed

## Medium Severity

### 7. Missing `naukriProfileText` Breaks Type Contract
- **Severity**: Medium
- **Location**: `lib/claude.ts`, line 61 & `lib/types.ts`, line 92
- **Description**: `rewriteResume` casts Claude's output to `RewrittenResume`, which expects a `naukriProfileText` string. However, Claude is not prompted for this field (it's fetched later by a separate route), so it evaluates to `undefined` at runtime.
- **Impact**: Breaks the TypeScript contract. Any UI component that strictly expects `naukriProfileText` to be a string could crash.
- **Fix status**: Fixed (Updated RewrittenResume and schemas to mark it as explicitly optional)

### 8. Brittle ATS Scorer Fallback
- **Severity**: Medium
- **Location**: `app/api/ats-score/route.ts`, line 53
- **Description**: If `ATS_SCORER_URL` is configured but the Python service is offline or times out, the route catches the error and returns a 502 Bad Gateway instead of falling back to the local TS scoring engine.
- **Impact**: Users get a broken score widget if the microservice is down, rather than degraded rule-based scoring.
- **Fix status**: Fixed (Added catch block fallback to TS rule-based calculateScore)

### 9. PDF Export vs Live Preview Parity
- **Severity**: Medium
- **Location**: `lib/resumePdf.ts`, line 74
- **Description**: The `TEMPLATE_MAP` approximates 15 HTML templates onto ~5 react-pdf templates.
- **Impact**: The exported PDF does not achieve exact visual parity with the stylized HTML preview templates.
- **Fix status**: Fixed (Tightened TEMPLATE_MAP mappings and added structural alignment docs)
