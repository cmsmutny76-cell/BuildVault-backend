# BuildVault Handoff — Closed Testing Started (2026-03-20)

## Status
- Closed testing is now active in Google Play.
- Test credential mismatch was fixed and standardized to:
  - `homeowner@test.com / password123`
  - `contractor@test.com / password123`
- Copy/paste assets are prepared for Play Console and tester onboarding.

## Files Added/Updated This Session
- `mobile/play-store-assets/BUILDVAULT_PLAY_STORE_COPY_PASTE.md` (copy/paste-only text blocks)
- `mobile/play-store-assets/BUILDVAULT_PLAY_STORE_QUICK_REFERENCE.md` (credentials fixed)
- `mobile/play-store-assets/BUILDVAULT_PLAY_STORE_TEST_INSTRUCTIONS.md` (credentials fixed)
- `BETA_TESTING_GUIDE.md` (credentials fixed)
- `backend/app/test-accounts.ts` (credentials fixed)
- `backend/scripts/seed-test-accounts.js` (credentials fixed)

## Immediate Next Focus
- Build and connect the internet platform (web app) with backend + mobile so all clients use the same API source of truth.

## Integration Goal
- One backend API consumed by:
  1. Mobile app (`mobile/services/api.ts`)
  2. Web platform (root Next.js app)
- Shared authentication flow against backend `/api/auth/login`.
- Shared environment strategy for API base URL across mobile and web.

## Known Constraints
- Backend currently uses partial mock data in several routes.
- Root web app currently has starter template UI and needs product-facing pages.
- Expo local network API URL is currently configured for device testing.

## Next Execution Steps
1. Add web API client in root app with `NEXT_PUBLIC_BACKEND_API_URL`.
2. Connect root web homepage to backend health/status and auth entry path.
3. Add root `.env.example` entries for web+backend alignment.
4. Validate type checks and basic run flow.

## Run Commands
- Backend: `cd backend && npm run dev`
- Web: `cd . && npm run dev` (if script added) or `npx next dev`
- Mobile: `cd mobile && npm start`

## Success Criteria
- Web page shows backend connection status.
- Web API client points to same backend as mobile.
- No hardcoded conflicting credentials in tester-facing docs.
