# CM Ear Wax Removal

Mobile ear wax removal website for **CM Ear Wax Removal**, run by Cristiana Mamularu, based in Bentley, Hampshire.

**Live site:** [cmearwaxremoval.co.uk](https://cmearwaxremoval.co.uk) — DNS is cut over, custom domain enabled on GitHub Pages with an approved HTTPS certificate.
**GitHub Pages URL (fallback):** [mobile-massage.github.io/cm-earwax-removal](https://mobile-massage.github.io/cm-earwax-removal/)
**Admin panel:** `/admin.html`
**Repo:** [github.com/mobile-massage/cm-earwax-removal](https://github.com/mobile-massage/cm-earwax-removal)

Built as a sibling project to [restore-relax](https://github.com/Quaydale/restore-relax), reusing the same architecture with a clinical colour palette and content for ear care instead of massage therapy.

---

## Status

- [x] Site content, design, coverage map, SEO/JSON-LD written
- [x] Logo cropped from the practitioner's business card, stock photography sourced (Unsplash License, free for commercial use)
- [x] Supabase project live (`volydinbgoelrtfzbeck.supabase.co`, under a separate account from restore-relax's org). `reviews` + `enquiries` tables and RLS policies applied from the schema below. `src/supabase.ts` and the CSP in `index.html` point at the real project
- [x] GitHub repo created, GitHub Pages enabled, serving `docs/` from `main` at the `github.io` URL above
- [x] `notify-new-submission` Edge Function (Resend email) — deployed, wired up via SQL trigger (not the dashboard's Database Webhooks UI, which errored on this project — see below), sending domain `cmearwaxremoval.co.uk` verified in Resend. Confirmed working end-to-end: inserting into `enquiries` triggers a real `200` from Resend and an email lands at `cristina_cristina973@yahoo.com` — see "Email notification for the contact form and reviews" below
- [x] Pricing decided (£65 flat fee, £25 consultation-only) but deliberately not shown publicly — site says "Contact me" / "get in touch" instead, across App.tsx, index.html JSON-LD and llms.txt
- [x] DNS cut over at the domain registrar (IONOS) to point `cmearwaxremoval.co.uk` at GitHub Pages. Custom domain enabled in Pages settings, HTTPS certificate approved (covers both the apex and `www`). Canonical domain is the **apex** (`cmearwaxremoval.co.uk`, no `www`) — all canonical URLs, JSON-LD `@id`/`url`, sitemap, robots.txt and llms.txt point there. HTTPS enforcement is not yet turned on in Pages settings — **not yet done**
- [x] Supabase keep-alive — the free-tier project auto-pauses after ~7 days of inactivity (this happened once already, breaking the live contact form until manually restored from the Supabase dashboard). `.github/workflows/supabase-keep-alive.yml` pings the REST API every 3 days to prevent it recurring

---

## Tech stack

Same as restore-relax: React 19 + TypeScript, Vite for dev, Parcel for the production build (single HTML + hashed JS/CSS in `docs/`), Leaflet + OpenStreetMap for the coverage map, Supabase (Postgres, London region) for reviews and enquiries, GitHub Pages for hosting. Fonts are self-hosted **Inter** (body) and **Manrope** (headings) — swapped from restore-relax's Cormorant Garamond/Playfair Display pairing for a cleaner, more clinical look.

---

## Project structure

```
cm-earwax-removal/
├── src/
│   ├── App.tsx              # Main public site (single page)
│   ├── main.tsx             # Entry point for public site
│   ├── AdminApp.tsx         # Admin panel — Reviews tab + Enquiries tab
│   ├── admin-main.tsx       # Entry point for admin
│   ├── Reviews.tsx          # Review carousel + submission form
│   ├── ContactForm.tsx      # Enquiry form → `enquiries` table (new vs. restore-relax)
│   ├── CoverageMap.tsx      # Leaflet coverage map, centred on Bentley GU10 5LH
│   ├── PrivacyPolicy.tsx    # Privacy policy modal
│   ├── supabase.ts          # Supabase client + types — live project credentials
│   └── fonts/               # Self-hosted Inter + Manrope variable woff2 files
├── public/
│   ├── favicon.png / favicon-512.png / apple-touch-icon.png / logo-badge.png  # Cropped from the business card photo
│   ├── og-image.jpg         # Generated 1200×630 social share image
│   ├── service-microsuction.jpg, service-irrigation.jpg, service-manual-removal.jpg, home-visit-comfort.jpg  # Unsplash License photos
│   ├── robots.txt / sitemap.xml / llms.txt
├── docs/                    # ← GitHub Pages serves this folder from `main` (live)
├── .claude/
│   ├── commands/seo-sync.md   # /seo-sync skill for Claude Code
│   └── settings.json          # PreToolUse hook (reminds to run /seo-sync before push to main)
├── index.html               # Dev entry (public site)
├── admin.html                # Dev entry (admin panel)
└── auth-confirm.html         # Static Supabase magic-link redirect handler
```

---

## Local development

```bash
pnpm install
pnpm dev        # Vite dev server
```

The admin panel loads at `/admin.html`. Both are fully wired up against the live Supabase project — reviews and enquiries submitted locally will land in the real database.

---

## Setting up the Supabase backend

Already done for this project (project `volydinbgoelrtfzbeck`, live). Kept here for reference / in case of a rebuild. The admin emails below are redacted to placeholders since this is a public repo — the real values are configured directly in the live Supabase project's RLS policies, not committed anywhere in this repo.

1. Create a new Supabase project (suggest `eu-west-2`, matching restore-relax).
2. Run this schema, substituting the real admin email addresses for `<admin-email-1>` / `<admin-email-2>`:

```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now(),
  approved boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','declined'))
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

alter table reviews enable row level security;
alter table enquiries enable row level security;

create policy "Public can read approved reviews" on reviews
  for select using (status = 'approved');
create policy "Public can submit reviews" on reviews
  for insert with check (true);
create policy "Admins can read all reviews" on reviews
  for select using (auth.email() in ('<admin-email-1>', '<admin-email-2>'));
create policy "Admins can update reviews" on reviews
  for update using (auth.email() in ('<admin-email-1>', '<admin-email-2>'));
create policy "Admins can delete reviews" on reviews
  for delete using (auth.email() in ('<admin-email-1>', '<admin-email-2>'));

create policy "Public can submit enquiries" on enquiries
  for insert with check (true);
create policy "Admins can read enquiries" on enquiries
  for select using (auth.email() in ('<admin-email-1>', '<admin-email-2>'));
create policy "Admins can update enquiries" on enquiries
  for update using (auth.email() in ('<admin-email-1>', '<admin-email-2>'));
create policy "Admins can delete enquiries" on enquiries
  for delete using (auth.email() in ('<admin-email-1>', '<admin-email-2>'));
```

3. Disable public sign-ups in Supabase Auth settings (admin access is via magic link to the two allow-listed emails only, enforced by RLS as defense-in-depth). — confirmed done and verified (public signup returns `signup_disabled`).
4. Update `src/supabase.ts` with the project URL + publishable key, and the CSP `connect-src` in `index.html`. — done.
5. Deploy the `notify-new-submission` Edge Function and wire up Database Webhooks — see the next section. — **not yet done.**

---

## Email notification for the contact form and reviews

**Status: done — deployed, verified end-to-end, real emails delivering to `cristina_cristina973@yahoo.com`.**

The contact form and review form already write to `enquiries` / `reviews` correctly — this adds an email alert on top of both. One function, `supabase/functions/notify-new-submission/index.ts`, handles both tables (it branches on the `table` field it's sent) and emails `cristina_cristina973@yahoo.com` via [Resend](https://resend.com), sending from `CM Ear Wax Removal <enquiries@cmearwaxremoval.co.uk>`.

What's set up:

1. **Resend account + API key**, stored as the `RESEND_API_KEY` secret in the Supabase dashboard (Project Settings → Edge Functions → Secrets).
2. **`cmearwaxremoval.co.uk` verified as a sending domain** in Resend (Domains → the DKIM/SPF/DMARC records were added at IONOS) — this is what allows delivery to arbitrary recipients rather than just the Resend account's own signup email.
3. **The function deployed** (Edge Functions → `notify-new-submission`).
4. **The trigger wired up via SQL, not the dashboard's Database Webhooks UI** — that UI fails on this project with `ERROR: 3F000: schema "supabase_functions" does not exist` (that internal schema was never provisioned). Worked around it with a plain SQL trigger using `pg_net` directly instead (same underlying mechanism, just wired up by hand): `supabase/migrations/20260802_notify_new_submission_trigger.sql`, which needs the `pg_net` extension enabled first (Database → Extensions → pg_net). Both triggers (`on_enquiry_insert`, `on_review_insert`) are live.

To verify it's still working after any change, insert a test row and check the result:

```sql
insert into public.enquiries (name, contact, message) values ('Test', 'test@example.com', 'test message');
select id, status_code, created, (content::text) as body from net._http_response order by id desc limit 5;
-- then clean up:
delete from public.enquiries where name = 'Test';
```

A `200` with `{"ok":true}` means the email actually went out. A `502` with a Resend error in the body means the trigger→function→Resend chain works but Resend itself rejected the send (e.g. if the domain verification ever lapses).

---

## Building and deploying

Same manual process as restore-relax — no CI build step. Uses `--public-url "./"` (relative), not `"/"`, so the same build works both at the temporary GitHub Pages project subpath and at the real domain root once attached — see the CLAUDE.md gotcha about this.

```bash
rm -rf .parcel-cache bundle-out
npx parcel build index.html admin.html --dist-dir bundle-out --public-url "./"

# IMPORTANT: do not delete old hashed files first — GitHub Pages' CDN can
# serve a stale index.html referencing the previous hash for several
# minutes after a push, and deleting the file it points at causes a
# blank white page for anyone who hits that stale cache. Just add the
# new ones; prune old orphaned hashes in a separate, later deploy.
cp bundle-out/*.js bundle-out/*.css bundle-out/*.png bundle-out/*.woff2 docs/
cp bundle-out/index.html docs/index.html
cp bundle-out/admin.html docs/admin.html
cp auth-confirm.html docs/auth-confirm.html
cp public/robots.txt public/sitemap.xml public/llms.txt docs/

echo "{\"v\":\"$(date +%s)\"}" > docs/version.json
rm -rf .parcel-cache bundle-out dist

git add -A
git commit -m "Deploy"
git push origin dev
git checkout main && git merge dev && git push origin main && git checkout dev
```

## Git workflow

| Branch | Purpose |
|---|---|
| `dev` | All day-to-day work happens here |
| `main` | Production — GitHub Pages will serve `docs/` from this branch |

Always work on `dev`, then merge to `main` to deploy. Never commit directly to `main`.

---

## SEO files

| File | Purpose |
|---|---|
| `docs/robots.txt` | Allows all crawlers; blocks `/admin.html` and `/auth-confirm.html` |
| `docs/sitemap.xml` | Single URL sitemap for the homepage |
| `docs/llms.txt` | AI search discovery — describes the business for LLM crawlers |

The `/seo-sync` Claude Code skill (`.claude/commands/seo-sync.md`) checks these files stay consistent with the content in `src/App.tsx`.

---

## Going live

Done — DNS is cut over and the custom domain is live at [cmearwaxremoval.co.uk](https://cmearwaxremoval.co.uk):

1. `docs/CNAME` contains `cmearwaxremoval.co.uk` (the apex domain — canonical, no `www`)
2. IONOS DNS points the domain at GitHub Pages
3. Custom domain is enabled in the repo's [Pages settings](https://github.com/mobile-massage/cm-earwax-removal/settings/pages), with an approved HTTPS certificate covering both the apex and `www`

One step remaining: **HTTPS enforcement** is not yet turned on in Pages settings (`https_enforced: false`) — turn it on once you're confident nothing is still linking to the plain `http://` version.
