# Her Lab Academy — Implementation Status

## All core phases complete

### Phases 1–4 (previous)
- RLS, student dashboard, teacher tools, admin courses/users/notices

### Optional features (completed)
- [x] Public `/courses` catalog + landing page from published Supabase courses
- [x] Cloudinary file uploads (`/api/upload`) for teacher PDF/image/document resources
- [x] Auto PDF certificates on 100% course completion (Supabase Storage + `certificates` table)
- [x] Admin complaints inbox with replies and status management
- [x] Soap Making enrollment prefix (`SM`)

## Apply migrations

```bash
cd her-lab-academy
npx supabase db push
```

Migrations to apply:
1. `20260529120000_rls_and_constraints.sql`
2. `20260529130000_storage_and_certificates.sql`

## Environment variables

Copy `.env.example` to `.env.local` and fill in:
- Supabase URL + anon key
- Cloudinary cloud name, API key, API secret (for file uploads)

## Supabase Storage

Create the `certificates` bucket if migration doesn't run — must be **public** for PDF download links.

## Test flow

1. Admin creates + publishes a course
2. Teacher adds modules/resources (upload PDF or paste video URL)
3. Student registers with enrollment code → completes all resources
4. Certificate auto-appears on `/dashboard/certificates`
5. Admin replies to student complaints at `/admin/complaints`
