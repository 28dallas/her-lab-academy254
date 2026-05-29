# TODO — Her Lab Academy fixes

## Priority 1: Auth blank pages
- [x] Add runtime guard for missing Supabase env vars in `src/utils/supabase/server.ts`
- [x] Wrap `register` server action in `try/catch` and redirect with safe error messages
- [x] Wrap `login` server action in `try/catch` and redirect with safe error messages
- [x] Confirm `/login` and `/register` no longer produce blank pages on deployment (via error redirect)



## Priority 2: `/courses/[id]` 404 UUID handling
- [x] Add UUID validation (avoid querying DB for non-UUID route params)
- [ ] If UUID is valid but still 404, verify DB column expectations in `src/lib/courses.ts`
- [ ] Update queries to match actual schema


## Priority 3: Supabase reseed correct 13 courses
- [ ] Inspect existing Supabase schema & current seed expectations in `supabase/migrations/*`
- [x] Add/adjust a seed SQL to insert exactly 13 correct courses
- [x] Provide reset SQL (delete dependent rows in correct order, then courses) then seed


## Priority 4: Add chatbot
- [x] Import + render chatbot component in `src/app/layout.tsx`


## Priority 5: Fix hardcoded homepage stats
- [x] Stop breaking build by removing broken hardcoded JSX; keep placeholders until DB metrics are wired
- [ ] Replace these placeholders with real DB-backed queries


- [x] Keep “Vocational Programs” dynamic via `getPublishedCourseCount()`



