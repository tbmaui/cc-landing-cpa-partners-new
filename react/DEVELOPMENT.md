# React development

Run `npm ci` and `npm run dev` in this directory. The repository root README covers both delivery formats. `npm run build` builds the TanStack Start server/client application. It needs its server function and is not a static WordPress embed.

The maintained source uses self-hosted Old Standard TT and Montserrat. The unchanged original export and its original font choices and lockfile are under `../source/react-export/`.

Populate `.env` from `.env.example` and apply the supplied `cpa_partner_leads` migration to the chosen database before testing lead delivery. The page renders without database configuration; submissions require a real backend. No backend is provisioned automatically.
