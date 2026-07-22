# CM Ear Wax Removal

Mobile ear wax removal website for **CM Ear Wax Removal**, run by Cristiana Mamularu, based in Bentley, Hampshire.

**Live now (interim):** [quaydale.github.io/cm-earwax-removal](https://quaydale.github.io/cm-earwax-removal/)
**Live site (once DNS is cut over):** [www.cmearwaxremoval.co.uk](https://www.cmearwaxremoval.co.uk) — currently hosted elsewhere (IONOS); this repo is the replacement site.
**Admin panel:** `/admin.html`
**Repo:** [github.com/Quaydale/cm-earwax-removal](https://github.com/Quaydale/cm-earwax-removal)

Built as a sibling project to [restore-relax](https://github.com/Quaydale/restore-relax), reusing the same architecture with a clinical colour palette and content for ear care instead of massage therapy.

---

## Status

- [x] Site content, design, coverage map, SEO/JSON-LD written
- [x] Logo cropped from the practitioner's business card, stock photography sourced (Unsplash License, free for commercial use)
- [x] Supabase project live (`volydinbgoelrtfzbeck.supabase.co`, under a separate account from restore-relax's org). `reviews` + `enquiries` tables and RLS policies applied from the schema below. `src/supabase.ts` and the CSP in `index.html` point at the real project
- [x] GitHub repo created, GitHub Pages enabled, serving `docs/` from `main` at the `github.io` URL above
- [ ] `notify-new-enquiry` Edge Function (Resend email) — not yet written. Reviews and enquiries save to the database correctly, but nobody gets emailed yet — needs writing + deploying to the Supabase project (not accessible via this Claude Code session's Supabase MCP connection, so needs doing directly in the Supabase dashboard, or from a session connected to that account)
- [x] Pricing decided (£65 flat fee, £25 consultation-only) but deliberately not shown publicly — site says "Contact me" / "get in touch" instead, across App.tsx, index.html JSON-LD and llms.txt
- [ ] DNS cutover at the domain registrar (IONOS) to point `cmearwaxremoval.co.uk` at GitHub Pages — this replaces the live production site and needs to be done by the domain owner, not by Claude — see "Going live" below

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
5. Write and deploy a `notify-new-enquiry` Edge Function (and optionally `notify-new-review`) with a Postgres trigger, following the same pattern as restore-relax's `notify-new-review` — see that project's README for the trigger shape. Needs a `RESEND_API_KEY` secret and a verified sending domain in Resend. — **not yet done.**

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

GitHub Pages is already enabled (`main` branch, `/docs`), serving [quaydale.github.io/cm-earwax-removal](https://quaydale.github.io/cm-earwax-removal/). To make `www.cmearwaxremoval.co.uk` point at it instead, the domain owner needs to:

1. Add a `CNAME` file to `docs/` containing `www.cmearwaxremoval.co.uk` — **not yet done**
2. At the IONOS DNS settings for `cmearwaxremoval.co.uk`, add a `CNAME` record for `www` pointing at `quaydale.github.io`, and either an `ALIAS`/`ANAME` or the standard GitHub Pages `A` records for the apex domain — **not yet done**
3. Enable the custom domain + HTTPS enforcement in the GitHub repo's [Pages settings](https://github.com/Quaydale/cm-earwax-removal/settings/pages) — **not yet done**

This is a change to a live production DNS record and should be done deliberately, once the new site has been reviewed. Before doing this, also confirm the SEO `og-image.jpg` and canonical URLs (already written pointing at `www.cmearwaxremoval.co.uk`) match whatever the final domain choice actually is.
