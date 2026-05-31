# Her Lab Academy

E-learning platform for **Her Lab Academy** (Perur Rays of Hope CBO, West Pokot, Kenya) — vocational training for women and girls.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) — database, auth, storage
- [Cloudinary](https://cloudinary.com) — file uploads
- [Resend](https://resend.com) — optional email notifications

## Setup

```bash
cd her-lab-academy
npm install
cp .env.local.example .env.local
# Fill in Supabase + Cloudinary (+ Resend optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Link CLI: `npx supabase login` then `npx supabase link --project-ref YOUR_REF`
3. Push migrations: `npx supabase db push`
4. Create first admin (SQL Editor):

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) and [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |

## Roles

- **Student** — enroll with code, complete modules, earn certificates
- **Teacher** — build courses, upload resources, moderate forum
- **Admin** — manage users, courses, complaints, platform notices

## License

Private — Perur Rays of Hope CBO.
