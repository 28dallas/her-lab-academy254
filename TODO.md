# Her Lab Academy — TODO

See [PROJECT_STATUS.md](./her-lab-academy/PROJECT_STATUS.md) for full project memory.

## Done
- [x] Core platform (student / teacher / admin)
- [x] RLS, certificates, public catalog, Cloudinary
- [x] Mock pages wired (students, evals, settings, forum, admin certs/surveys/analytics)
- [x] Quizzes schema + basic teacher/student UI
- [x] Resend emails (welcome, certificate, complaint reply)
- [x] Auth profile trigger + Vitest + CI
- [x] SEO, logo, README

## Your next step
```bash
cd her-lab-academy
npx supabase db push   # applies quizzes + auth trigger migration
```

## Optional later
- [ ] Payments
- [ ] Multi-question quiz builder
- [ ] Playwright E2E
- [ ] Email all students on course announcement (batch)
