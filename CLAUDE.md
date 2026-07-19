# CM Ear Wax Removal — project notes for Claude Code

See [README.md](README.md) for full architecture, tech stack, and setup details. This file covers conventions and automation specific to working in this repo with Claude Code.

## Skills

### `/seo-sync` (covers SEO **and** LLM/AI search)

Defined in `.claude/commands/seo-sync.md`. Decides whether the traditional SEO files (`index.html` JSON-LD, `docs/sitemap.xml`, `docs/robots.txt`) **and** the LLM/AI search discovery file (`public/llms.txt`) are out of sync with `src/App.tsx` (the source of truth for services, prices, and coverage areas), and fixes them if so. `llms.txt` is what AI assistants (ChatGPT, Claude, Perplexity, etc.) read to summarize the business when answering user questions — it needs the same attention as classic SEO. If nothing has drifted, it says so rather than making needless edits.

**Run this before every push to `main`.** A `PreToolUse` hook (`.claude/settings.json`) fires automatically when a `git push origin main` command is about to run and reminds to run `/seo-sync` first, so SEO fixes land in the same deploy rather than a follow-up one.

## Git workflow

- Work on `dev`. Merge to `main` only to deploy — GitHub Pages serves `docs/` from `main`.
- Never commit directly to `main`.

## Build/deploy gotchas

- Parcel hashes every asset (JS, CSS, images) on each build — `docs/` accumulates stale hashed files if you only copy `*.js`. Copy `*.js`, `*.css`, and `*.png`/`*.svg` from `bundle-out/`, and remove anything no longer referenced by `docs/index.html` / `docs/admin.html`.
- After copying, update `docs/version.json` with the new main-bundle hash so the auto-refresh polling picks up the deploy for users already on the page.
- `public/` and `docs/` versions of `robots.txt`, `sitemap.xml`, and `llms.txt` must be kept in sync manually — there's no build step that copies them. If you edit one, edit both.
- `logo-badge.png`, `favicon.png`, `apple-touch-icon.png`, and `og-image.jpg` are referenced only via plain string paths (`<img src="/...">`, `<meta content="https://www.cmearwaxremoval.co.uk/...">`), not JS imports — Parcel's asset graph never sees them, so they don't get hashed or auto-copied. Copy them from `public/` to `docs/` by hand on every deploy that touches them.

## Pricing is TBC

Service prices in `src/App.tsx`, `index.html` JSON-LD, and `public/llms.txt` are all placeholder `TBC` values — there was no published pricing to source from. Once real prices are confirmed, update all three in the same change (this is exactly what `/seo-sync` checks for).

## Review & enquiry notification email

Unlike restore-relax, this project needs a fresh Edge Function (`notify-new-enquiry`, and optionally `notify-new-review`) + Postgres trigger to email `info@cmearwaxremoval.co.uk` via Resend when a new enquiry or pending review is submitted — restore-relax's equivalent function isn't in git and can't be copied directly. See README for the Supabase schema this depends on.
