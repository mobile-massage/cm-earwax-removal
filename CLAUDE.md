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

- **Never delete old hashed JS/CSS files from `docs/` in the same deploy that replaces them.** GitHub Pages' CDN caches `index.html` for up to 10 minutes (`cache-control: max-age=600`), so some visitors can still be served an HTML shell referencing the *previous* build's hashed filename after you've pushed. If that old file has been deleted, they get a blank white page (script 404s, nothing renders, no console error). This actually happened once — see commit history around "Use relative paths for hardcoded image references" for the fix (restored the deleted files from git history). Instead: copy `*.js`/`*.css` from `bundle-out/` into `docs/` **without removing anything first**, and only prune genuinely orphaned old hashed files in a *separate*, later deploy once you're confident no cached HTML still points at them (a day or more later is safe).
- After copying, update `docs/version.json` with the new main-bundle hash so the auto-refresh polling picks up the deploy for users already on the page.
- `public/` and `docs/` versions of `robots.txt`, `sitemap.xml`, and `llms.txt` must be kept in sync manually — there's no build step that copies them. If you edit one, edit both.
- The site is built with `--public-url "./"` (relative), not `"/"` — this lets the same `docs/` build work both at a GitHub Pages project subpath (`quaydale.github.io/cm-earwax-removal/`) and at the real custom domain root once attached. Don't change this back to `"/"` unless the project subpath is no longer needed.
- `logo-badge.png`, `favicon.png`, `apple-touch-icon.png`, `og-image.jpg`, and the service/about photos are referenced via plain string paths (`<img src="logo-badge.png">`, no leading slash), not JS imports — Parcel's asset graph never sees them, so they don't get hashed or auto-copied, and they must stay relative (no leading `/`) for the same subpath-compatibility reason above. Copy them from `public/` to `docs/` by hand on every deploy that touches them. The `og:image`/`twitter:image` **meta tags** are the one exception — those must stay full absolute URLs (`https://www.cmearwaxremoval.co.uk/og-image.jpg`) since they're read by external crawlers, not resolved relative to the page.

## Pricing is not displayed publicly

Real prices exist (£65 flat fee for ear wax removal regardless of method, £25 consultation-only if nothing needs removing) but the site deliberately shows "Contact me" / "get in touch" instead of the numbers in `src/App.tsx`, `index.html`, and `public/llms.txt` — this was a deliberate choice, not a placeholder. Don't reintroduce the numeric prices to the public-facing content without checking first.

## Review & enquiry notification email

Unlike restore-relax, this project needs a fresh Edge Function (`notify-new-enquiry`, and optionally `notify-new-review`) + Postgres trigger to email `info@cmearwaxremoval.co.uk` via Resend when a new enquiry or pending review is submitted — restore-relax's equivalent function isn't in git and can't be copied directly. See README for the Supabase schema this depends on.
