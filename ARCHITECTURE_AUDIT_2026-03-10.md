# Architecture Audit - 2026-03-10

## Scope
Audit focused on the current backend/mobile implementation for:
- duplication of data models
- service-boundary/coupling violations
- API consistency
- readiness for project-centric platform architecture

## 1) Duplication Map

### A. Project and estimate models are duplicated and diverging
- `backend/app/api/quotes/generate/route.ts`
  - local `EstimateLineItem`, `EstimateRecord`
- `backend/app/api/quotes/revisions/route.ts`
  - local `EstimateRevision`
- `backend/lib/pdf.ts`
  - local `EstimateData`
- `mobile/services/mockData.ts`
  - `MockProject`, `MockEstimate`, `MockMessage`
- `mobile/types/profiles.ts`
  - `ProjectProfile` (more complete and role-oriented than backend models)

Impact:
- No single source of truth for project/estimate structures.
- Contract drift risk between mobile and backend.

### B. User/contractor schemas diverge between DB, auth store, and API payloads
- DB schema uses relational `users` and `contractors` with numeric IDs: `database/schema.sql`
- Auth system uses in-memory `AuthUser` string IDs and mixed homeowner/contractor object: `backend/lib/authStore.ts`
- Profile endpoint returns another shape: `backend/app/api/users/profile/route.ts`

Impact:
- Migration to persistent DB will be error-prone.
- Identity and role boundaries are unclear.

### C. Messaging data duplicated
- Route-local message/conversation shape: `backend/app/api/messages/route.ts`
- SSE event shape: `backend/lib/messageBus.ts`
- Mobile chat message shape: `mobile/screens/ChatScreen.tsx`

Impact:
- Inconsistent assumptions about conversation ID and fields.

## 2) Coupling and Service-Boundary Violations

### A. Route-level state stores (siloed, non-portable)
- Local in-memory stores directly inside route modules:
  - `estimateStore` in `backend/app/api/quotes/generate/route.ts`
  - `revisionStore` in `backend/app/api/quotes/revisions/route.ts`

Impact:
- Data lost on restart.
- Not horizontally scalable.
- Violates centralized data/service architecture.

### B. Route handlers mix transport + domain + mock infra
- `backend/app/api/messages/route.ts` includes hardcoded mock sender/receiver and email side effects.
- `backend/app/api/ai/match-contractors/route.ts` includes scoring logic + mock contractor source in handler.
- `backend/app/api/building-codes/fetch/route.ts` contains retrieval prompt logic + fallback code generation directly in route.

Impact:
- Hard to test and reuse.
- Increases blast radius of route changes.

### C. Missing project service boundary
- No project API route found under `backend/app/api/projects/**` despite centrality of project object.

Impact:
- Other domains (quotes/matching/messages/permits) cannot depend on a canonical project lifecycle service.

## 3) API Consistency Findings

### A. Endpoint responsibility ambiguity
- `POST /api/quotes/generate` handles two unrelated workflows:
  - material retail quote generation
  - contractor estimate creation

Impact:
- One endpoint, multiple contracts.
- Hard to version and validate safely.

### B. Method mismatch between mobile and backend
- Mobile calls `PATCH /users/profile`: `mobile/services/api.ts`
- Backend implements `PUT /users/profile`: `backend/app/api/users/profile/route.ts`

Impact:
- Live profile update can fail or behave inconsistently.

### C. Contract mismatch in messaging read receipts
- Mobile sends `{ messageIds, userId }` for mark-as-read: `mobile/services/api.ts`
- Backend ignores `userId` in `PATCH /api/messages`: `backend/app/api/messages/route.ts`

Impact:
- Authorization boundary not enforced for read updates.

## 4) Project Data Model Impact Assessment

Current platform behavior does not consistently center on a canonical Project object.

### Existing gaps
- IDs are inconsistent (`SERIAL` integers in DB vs prefixed string IDs in API/mocks).
- Location is modeled both as flat fields and nested objects.
- Timeline fields differ across modules.
- Compliance/permit outputs are not attached to a canonical project aggregate.

### Required canonical model (proposal)
Create shared domain contract in backend (and generated type client for mobile):

`Project`
- `id: string` (or UUID; use consistent type end-to-end)
- `ownerId: string`
- `projectType: string`
- `title: string`
- `description?: string`
- `location: { street?: string; city: string; state: string; zipCode: string; lat?: number; lng?: number }`
- `dimensions?: Record<string, string | number>`
- `structuralComponents?: string[]`
- `materials?: Array<{ name: string; quantity: number; unit: string; source?: string }>`
- `costEstimate?: { subtotal: number; tax: number; total: number; confidence?: number; sourceRefs?: string[] }`
- `timeline?: { startDate?: string; endDate?: string; estimatedDays?: number }`
- `contractorAssignment?: { contractorId?: string; status: 'unassigned' | 'matched' | 'assigned' | 'in-progress' | 'completed' }`
- `compliance?: { codesCheckedAt?: string; findings: Array<{ rule: string; reference: string; severity: 'info' | 'warning' | 'critical'; confidence: number }> }`
- `status: 'draft' | 'scoped' | 'estimating' | 'matched' | 'active' | 'completed' | 'cancelled'`
- `createdAt: string`
- `updatedAt: string`

## 5) Event Logging Gap

No centralized event log pipeline found for key actions (`project_created`, `estimate_generated`, etc.).

Recommendation:
- Add `backend/lib/eventLogger.ts` abstraction.
- Emit events from route/service layer for all major workflow transitions.
- Persist to DB table `platform_events` (later stream to warehouse).

## 6) First Refactor Sequence (Execution Plan)

### Step 1 - Establish domain contracts (no behavior change)
- Add `backend/lib/domain/` with shared TS interfaces:
  - `project.ts`, `estimate.ts`, `message.ts`, `compliance.ts`.
- Replace route-local interfaces with imports.

### Step 2 - Split `quotes/generate` into explicit endpoints
- New endpoints:
  - `POST /api/material-quotes/generate`
  - `POST /api/estimates`
  - `GET /api/estimates?projectId=...`
- Keep old endpoint as compatibility shim temporarily.

### Step 3 - Introduce project service boundary
- Add `backend/app/api/projects/route.ts` (+ details route).
- All estimate/revision/matching operations require project existence.

### Step 4 - Normalize profile API semantics
- Support `PATCH /api/users/profile` in backend (or update mobile to `PUT` consistently).
- Enforce one contract.

### Step 5 - Extract route business logic into services
- Add `backend/lib/services/`:
  - `estimateService.ts`, `matchingService.ts`, `messageService.ts`, `complianceService.ts`.
- Route handlers become transport-only.

### Step 6 - Add platform event logging
- Emit events for:
  - `project_created`, `project_updated`, `estimate_generated`, `revision_added`, `contractor_matched`, `message_sent`, `permit_guidance_generated`.

## 7) Risk Level Summary
- High: project schema inconsistency, route-level stores, mixed endpoint responsibilities.
- Medium: HTTP method mismatches, missing project service boundary.
- Medium: missing centralized event logging for learning pipeline.

## 8) Recommended Next Action
Before any new feature module, execute Steps 1-2 first to stop schema drift and API ambiguity.
