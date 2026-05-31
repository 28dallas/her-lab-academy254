# Her Lab Academy — Project memory / status

Last updated: conversation session (ongoing).

## Stack
- Next.js 16 App Router, React 19, Tailwind 4, TypeScript
- Supabase (Auth, Postgres, Storage)
- Cloudinary (teacher file uploads)
- Resend (email, optional via `RESEND_API_KEY`)
- Vitest + GitHub Actions CI

## Completed
- Student dashboard fully DB-backed (courses, modules, progress, forum, complaints, profile, certs, evaluations)
- Teacher: outline, resources, announcements, students, evaluations, settings, forum moderation, quizzes
- Admin: courses, users, notices, complaints inbox, certificates (manual issue), surveys, analytics stats
- Public catalog from published courses + SEO metadata
- RLS migrations + certificates storage + quizzes schema + auth profile trigger
- Auto PDF certificates on 100% progress
- Logo at `/public/logo/logo.svg`

## Migrations (apply via `npx supabase db push`)
1. `20260528092542_initial_schema.sql` (may already exist remotely)
2. `20260529120000_rls_and_constraints.sql`
3. `20260529130000_storage_and_certificates.sql`
4. `20260530120000_quizzes_and_auth_trigger.sql` ← **new, run if not applied**

## Chatbot
- UI: `src/components/chatbot/Chatbot.tsx` on all pages
- API: `POST /api/chat` — FAQ fallback always; OpenAI when `OPENAI_API_KEY` is set
- Knowledge: `src/lib/chatbot/institution.ts` (PRoH, HER Lab, partners, impact, curriculum, portal)
- Context: published courses + live user role when signed in

## Env vars (`.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDINARY_*` (uploads)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (emails, optional)
- `OPENAI_API_KEY`, `OPENAI_MODEL` (chatbot AI, optional)

## First admin
```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

## Not started / future
- Payments
- Full multi-question quiz builder UI
- Playwright E2E tests
- PWA / i18n

## Key paths
- App: `her-lab-academy/src/app/`
- Actions: `src/app/actions/{admin,teacher,student}.ts`
- Migrations: `her-lab-academy/supabase/migrations/`
