# React setup

See the repository root README for both delivery formats. Run `npm ci` here, then `npm run dev`. The maintained fonts are local Old Standard TT and Montserrat; the npm lockfile is authoritative.

To enable lead delivery, populate `.env` from `.env.example` and apply `drizzle/migrations/0000_create_cpa_partner_leads.sql` to the chosen database. No backend is configured automatically. Use `npm run build`, `npm test`, `npm run lint` and `npx tsc --noEmit` to check changes.
