# Supabase setup — link CLI or apply SQL manually

`npx supabase db push` only works after the CLI is linked to your **remote** project.

---

## Option A — Link CLI (recommended for future updates)

### 1. Get your Project Reference ID

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project
3. **Settings** → **General** → copy **Reference ID**  
   (also in the URL: `https://supabase.com/dashboard/project/abcdefghijklmnop`)

### 2. Log in and link (PowerShell)

Your project ref (from your URL): **`yexlyccgbbqktutsxmyy`**

```powershell
cd "C:\Users\HP\Documents\Her Lab Academy\her-lab-academy"

npx supabase login
```

A browser window opens — sign in and approve access.

```powershell
npx supabase link --project-ref yexlyccgbbqktutsxmyy
```

Or pass the database password in one step (from Dashboard → Settings → Database):

```powershell
npx supabase link --project-ref yexlyccgbbqktutsxmyy --password "YOUR_DB_PASSWORD"
```

When prompted for the database password, use the password from  
**Settings → Database → Database password** (reset it there if you forgot).

### 3. Push migrations

```powershell
npx supabase db push
```

---

## Option B — Run SQL in the Dashboard (no CLI link)

Use this if you prefer not to link the CLI, or linking fails.

### Step 1 — Initial schema (only if tables do NOT exist yet)

If you already created tables in Supabase, **skip** this step.

1. Dashboard → **SQL Editor** → **New query**
2. Open `supabase/migrations/20260528092542_initial_schema.sql`
3. Copy all contents → **Run**

### Step 2 — RLS + security (required)

1. SQL Editor → **New query**
2. Open `supabase/migrations/20260529120000_rls_and_constraints.sql`
3. Copy all → **Run**

If you see errors like `constraint already exists`, some parts were applied before — safe to ignore duplicates or run sections individually.

### Step 3 — Certificates storage (required)

1. SQL Editor → **New query**
2. Open `supabase/migrations/20260529130000_storage_and_certificates.sql`
3. Copy all → **Run**

### Step 4 — Student ID column on profiles (required for registration)

Registration and login use a `student_code` field on `profiles`. If sign-up fails with  
`Could not find the 'student_code' column of 'profiles' in the schema cache`, run:

1. SQL Editor → **New query**
2. Open `supabase/migrations/20260604165000_add_student_code_to_profiles.sql`
3. Copy all → **Run**

Or paste:

```sql
alter table profiles
  add column if not exists student_code text unique;
```

Then wait a few seconds (or reload the Supabase dashboard) so PostgREST refreshes its schema cache.

Also run `supabase/migrations/20260530120000_quizzes_and_auth_trigger.sql` if you have not applied it yet (auth trigger + quizzes).

### Step 4b — Student login by ID (required for ID + email sign-in)

If students cannot log in with their TVET registration number, run:

1. SQL Editor → **New query**
2. Open `supabase/migrations/20260605183000_resolve_login_email.sql`
3. Copy all → **Run**

### Step 5 — Create storage bucket (if Step 3 bucket insert failed)

1. **Storage** → **New bucket**
2. Name: `certificates`
3. Enable **Public bucket**
4. Allowed MIME: `application/pdf` (optional)
5. Save

Then re-run only the `create policy` lines from the Step 3 file in SQL Editor.

---

## App environment variables

Create `her-lab-academy/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find URL + anon key under **Settings → API** (use the **anon** `public` key for the app).  
For **Admin → bulk CSV import**, add **service_role** as `SUPABASE_SERVICE_ROLE_KEY` in Vercel/local (server only — never expose to the browser).

Optional — domain for auto-generated student emails when CSV has no email column:

```env
STUDENT_AUTH_EMAIL_DOMAIN=students.herlabacademy.app
```

(Supabase rejects `.local` addresses; do not use `@student.herlab.local`.)

**Auth → Providers → Email:** consider disabling **Confirm email** for classroom rollouts so students can sign in immediately after import.

Optional for teacher file uploads:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Create your first admin user

1. Register once at `/register` (or create user in **Authentication → Users**)
2. SQL Editor:

```sql
update profiles set role = 'admin' where email = 'your-email@example.com';
```

---

## Quick check

After migrations, in SQL Editor:

```sql
select tablename from pg_tables where schemaname = 'public' order by 1;
```

You should see: `profiles`, `courses`, `enrollments`, `certificates`, etc.
