# Pain Free Club — Move-a-thon

The Move-a-thon member app + staff dashboard, ready to deploy.

## What's here
```
index.html            → the member app (sign up, weekly check-in, badges, certificate)
dashboard/index.html  → staff read-only dashboard (who's on track / certificate-ready)
assets/pfc-logo.png   → PFC logo used on the award certificate
badges/               → theme award emblems: identity.png, clarity.png, … (transparent PNGs)
backend/              → supabase-schema.sql  +  google-sheet-webhook.gs (pick one backend)
```

## Go live (GitHub Pages — easiest)
1. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `/root`.
2. Wait ~1 min. The member app is then live at `https://<user>.github.io/moveathon/`
   and the dashboard at `.../moveathon/dashboard/`.
   (Any static host works too — Netlify, Vercel, or an embed on TagMango.)

## Configure before launch (edit the `CONFIG` block near the bottom of `index.html`)
- **THEMES** — the 6 weekly theme names + each week's motivation line. Theme 1 is
  **Identity**. Drop each emblem into `badges/` as `identity.png`, `clarity.png`, …
- **COHORTS** — each run's start date + theme order (list current + upcoming runs).
- **SANYA_WHATSAPP**, **COMMUNITY_URL** — video submission + dashboard link.
- **Backend (recommended: Supabase)** — run `backend/supabase-schema.sql`, then set
  `SUPABASE_URL` + `SUPABASE_ANON_KEY`. (Google Sheet webhook is the fallback.)
- **CHALLENGES** — the 5 weekly mini-challenges.

## Scoring (per week, out of 100)
Pain 15 · Confidence 15 · Movement 15 · Strength 15 · Consistency 20 · Weekly Challenges 20.
Emotional-anchor reflection is captured but not scored. Certificate = all 6 theme
badges earned (across whatever runs it takes); best-4-of-6 avg ≥ 75 = internal
"distinction" flag, never shown as a %.

Self-assessment for coaching & motivation — not a medical diagnosis.
