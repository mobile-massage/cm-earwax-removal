# CM Ear Wax Removal

Mobile ear wax removal website for **CM Ear Wax Removal**, run by Cristiana Mamularu, based in Bentley, Hampshire.

**Live site (planned):** [www.cmearwaxremoval.co.uk](https://www.cmearwaxremoval.co.uk) — currently hosted elsewhere (IONOS); this repo is the replacement site, not yet live.
**Admin panel:** `/admin.html`

Built as a sibling project to [restore-relax](https://github.com/Quaydale/restore-relax), reusing the same architecture with a clinical colour palette and content for ear care instead of massage therapy.

---

## Status

- [x] Site content, design, coverage map, SEO/JSON-LD written
- [x] Logo cropped from the practitioner's business card, stock photography sourced (Unsplash License, free for commercial use)
- [ ] Supabase project — **not yet provisioned**. The original Supabase org (Quaydale, "Act1") is at its 2-project free-tier limit. `src/supabase.ts` and the CSP in `index.html`/`admin.html` still contain `REPLACE_ME` placeholders until a project is created and the schema below is applied
- [ ] `notify-new-enquiry` Edge Function (Resend email) — not yet written; needs a live Supabase project first
- [ ] Real pricing — service prices are `TBC` throughout (App.tsx, index.html JSON-LD, llms.txt) — nothing was published to source from
- [ ] DNS cutover at the domain registrar (IONOS) to point `cmearwaxremoval.co.uk` at GitHub Pages — this replaces the live production site and needs to be done by the domain owner, not by Claude
- [ ] GitHub repo + first deploy

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
│   ├── supabase.ts          # Supabase client + types — placeholder credentials
│   └── fonts/               # Self-hosted Inter + Manrope variable woff2 files
├── public/
│   ├── favicon.png / apple-touch-icon.png / logo-badge.png  # Cropped from the business card photo
│   ├── og-image.jpg         # Generated 1200×630 social share image
│   ├── service-microsuction.jpg, service-irrigation.jpg, home-visit-comfort.jpg  # Unsplash License photos
│   ├── robots.txt / sitemap.xml / llms.txt
├── docs/                    # ← GitHub Pages will serve this folder (populated on first build)
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

The admin panel loads at `/admin.html`. Until a Supabase project is created, review/enquiry submission and admin login will fail — everything else (layout, map, content, modals) works against placeholder data.

---

## Setting up the Supabase backend

1. Create a new Supabase project (suggest `eu-west-2`, matching restore-relax).
2. Run this schema:

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
  for select using (auth.email() in ('redacted-admin-email-1@example.com', 'redacted-admin-email-2@example.com'));
create policy "Admins can update reviews" on reviews
  for update using (auth.email() in ('redacted-admin-email-1@example.com', 'redacted-admin-email-2@example.com'));
create policy "Admins can delete reviews" on reviews
  for delete using (auth.email() in ('redacted-admin-email-1@example.com', 'redacted-admin-email-2@example.com'));

create policy "Public can submit enquiries" on enquiries
  for insert with check (true);
create policy "Admins can read enquiries" on enquiries
  for select using (auth.email() in ('redacted-admin-email-1@example.com', 'redacted-admin-email-2@example.com'));
create policy "Admins can update enquiries" on enquiries
  for update using (auth.email() in ('redacted-admin-email-1@example.com', 'redacted-admin-email-2@example.com'));
create policy "Admins can delete enquiries" on enquiries
  for delete using (auth.email() in ('redacted-admin-email-1@example.com', 'redacted-admin-email-2@example.com'));
```

3. Disable public sign-ups in Supabase Auth settings (admin access is via magic link to the two allow-listed emails only, enforced by RLS as defense-in-depth).
4. Update `src/supabase.ts` with the project URL + publishable key, and the CSP `connect-src` in `index.html` and `admin.html`.
5. Write and deploy a `notify-new-enquiry` Edge Function (and optionally `notify-new-review`) with a Postgres trigger, following the same pattern as restore-relax's `notify-new-review` — see that project's README for the trigger shape. Needs a `RESEND_API_KEY` secret and a verified sending domain in Resend.

---

## Building and deploying

Same manual process as restore-relax — no CI build step:

```bash
rm -rf .parcel-cache bundle-out
npx parcel build index.html admin.html --dist-dir bundle-out --public-url "/"

for f in bundle-out/*.js bundle-out/*.png bundle-out/*.svg; do [ -f "$f" ] && cp "$f" docs/; done
cp bundle-out/index.html docs/index.html
cp bundle-out/admin.html docs/admin.html

echo "{\"v\":\"$(date +%s)\"}" > docs/version.json

git add docs/
git commit -m "Deploy"
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

Once the site is built and pushed to `main`, GitHub Pages will serve it from a `github.io` URL. To make `www.cmearwaxremoval.co.uk` point at it, the domain owner needs to:

1. Add a `CNAME` file to `docs/` containing `www.cmearwaxremoval.co.uk`
2. At the IONOS DNS settings for `cmearwaxremoval.co.uk`, add a `CNAME` record for `www` pointing at `<github-username>.github.io`, and either an `ALIAS`/`ANAME` or the standard GitHub Pages `A` records for the apex domain
3. Enable the custom domain + HTTPS enforcement in the GitHub repo's Pages settings

This is a change to a live production DNS record and should be done deliberately, once the new site has been reviewed.
