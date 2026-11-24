# Complete Controller — New CPA Partners page

[Earlier CPA page](https://github.com/tbmaui/cc-landing-cpa-partners) · [Install downloads](https://github.com/tbmaui/cc-landing-cpa-partners-new/releases/latest)

This separate repository contains the new page supplied in `complete-controller-cpa-partners-new.zip`, in both React and native WordPress formats. The earlier CPA page stays in its original repository.

| Folder | Contents |
| --- | --- |
| `react/` | Maintained TanStack Start / React application, photographs, local brand fonts, server function and supplied SQL migration. |
| `wordpress/` | Native Gutenberg full-page starter, twelve reusable sections, scoped CSS, vanilla JavaScript and WordPress form handler. |
| `source/react-export/` | Unchanged original ZIP contents, with file hashes in `source/provenance.json`. |
| `tools/` | Conversion and local verification scripts. |

Both maintained versions use Old Standard TT and Montserrat. The WordPress version keeps the React page's sections and copy; the host theme supplies its navigation and footer. React is not required to render the WordPress page. Page-specific filenames and pattern slugs keep this version separate from the earlier CPA page.

## WordPress installation

1. Download `cc-modern-1.3.16.zip` from Releases. This is the complete installable theme; `wordpress/` alone is an integration overlay.
2. Back up the existing theme and page, then upload the theme ZIP through Appearance → Themes → Add New → Upload Theme.
3. Create a review draft with the **Full Width** template and insert **Page — CPA Partners New** from **CC — Whole Page Starters**. The twelve sections are also available individually in the appropriate CC pattern categories.
4. Alternatively, Tools → CC Starter Pages can create the `/cpa-partners-new/` draft. It skips existing URLs and does not replace the earlier CPA page.
5. Configure and verify form delivery before publishing. Preserve existing site-specific edits.

See [WordPress integration details](wordpress/README.md), including form configuration. The theme archive includes both CPA starters.

## React development

Use Node.js 22.13 or newer:

```sh
cd react
npm ci
npm run dev
```

Copy `.env.example` to an ignored local `.env` and set the backend values when testing lead delivery. Apply the supplied SQL migration to the chosen database before enabling submissions. Use `npm run build`, `npm test`, `npm run lint` and `npx tsc --noEmit` to check changes. The npm lockfile is authoritative; the original Bun lockfile is retained under `source/react-export/`.

## Updating the conversion

Build React and start its local development server, then run:

```sh
python -m pip install -r tools/requirements.txt
cd react && npx playwright install chromium && cd ..
python tools/capture-react.py --url http://127.0.0.1:5187/
python tools/convert-react.py
node tools/serialize-blocks.cjs
node tools/validate-blocks.js
```

The serializer uses the actual WordPress block editor to generate canonical native markup. Set `CC_WORDPRESS_URL`, `CC_TEST_USER` and `CC_TEST_PASSWORD` for an isolated local WordPress install. `CC_CHROMIUM_PATH` can select an existing Chromium binary. The scripts also support the established local review cache. Keep credentials outside Git. Maintain the WordPress-only form handler and interactions under `wordpress/inc/` and `wordpress/assets/js/`.

The page and twelve sections passed the real WordPress 6.6.3 editor with zero invalid blocks. Responsive checks cover 390, 768, 1024, 1440 and 1920 pixels. FAQ behavior, guide preference, validation, failed submission recovery, success UI and the no-JavaScript POST flow are checked locally with intercepted backend responses. No production leads are sent by these checks.

Creating this repository does not configure production form delivery, replace a live WordPress page or connect this separate repository to the original Lovable project.
