# Complete Controller — CPA Partners Landing Page

A single conversion-focused landing page for CPA firms, built with TanStack Start
(React 19 + Vite), Tailwind CSS v4, and a Supabase-backed lead form.

## What's here

| Path | What it is |
| --- | --- |
| `src/routes/index.tsx` | The whole page — hero, problem band, benefits, process, testimonials, FAQ, contact form, footer |
| `src/routes/__root.tsx` | HTML shell, fonts (EB Garamond + Figtree), page metadata |
| `src/styles.css` | Brand tokens (green `#2a3b35` / `#466359` / `#6a9082`, orange `#f36334`), type scale, spacing utilities |
| `src/components/cpa/LeadForm.tsx` | The contact form |
| `src/lib/leads.functions.ts` | Server function that validates and saves a lead |
| `src/components/ui/` | shadcn/ui primitives |
| `drizzle/migrations/0000_create_cpa_partner_leads.sql` | Creates the `cpa_partner_leads` table with row-level security |
| `src/assets/` | Hero and section photography |

## Run it

```sh
cp .env.example .env   # fill in your backend values
bun install            # or: npm install
bun run dev            # or: npm run dev
```

Then open the URL the dev server prints.

## The lead form

Submissions are saved to a `cpa_partner_leads` table. Apply
`drizzle/migrations/0000_create_cpa_partner_leads.sql` to your database first —
it also sets up the insert-only policy, so the form can write but not read.

Without a database configured, the page renders and every section works; only
the form submit will fail.

## Other commands

```sh
bun run build   # production build
bun run test    # vitest
bun run lint    # eslint
```

## Fonts

EB Garamond (headlines) and Figtree (body) load from Google Fonts via a `<link>`
in `src/routes/__root.tsx`. No font files are bundled.
