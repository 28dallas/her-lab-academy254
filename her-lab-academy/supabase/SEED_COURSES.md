# Seed All 12 Courses

Run this SQL in your Supabase SQL Editor to seed/update all 12 HER Lab Academy courses:

```bash
cd her-lab-academy
cat supabase/seed_courses_13.sql | pbcopy  # macOS
# or on Windows: type supabase\seed_courses_13.sql | clip
```

Then paste into Supabase → SQL Editor → Run.

**Or** run directly if you have the CLI linked:

```bash
npx supabase db execute -f supabase/seed_courses_13.sql
```

## The 12 Courses

All enrollment codes follow the pattern: **PREFIX + 5 digits** (e.g. `EL12345`)

| Course | Prefix | Code |
|---|---|---|
| Electrical Installation | EL | EL12345 |
| Solar PV Installation | SP | SP12345 |
| Plumbing | PL | PL12345 |
| Cosmetology | CT | CT12345 |
| Fashion Design | FD | FD12345 |
| Regenerative Agriculture | RA | RA12345 |
| Core Agriculture | CA | CA12345 |
| Reproductive Health | RH | RH12345 |
| ICT | IT | IT12345 |
| Basic Digital Literacy | DL | DL12345 |
| Entrepreneurship | EP | EP12345 |
| Beadwork | BW | BW12345 |

All courses are published by default (`is_published = true`) and have a 10-week duration.
