# New CPA Partners repository

Keep `react/` and `wordpress/` consistent when changing copy, assets or behavior. `source/react-export/` preserves the supplied ZIP contents and must remain unchanged; hashes are recorded in `source/provenance.json`.

The WordPress delivery targets cc-modern 1.3.16. Use native Gutenberg blocks and `cc_modern_` PHP helpers. Keep `cpa-new-*` pattern slugs and `cpa-partners-new-*` assets separate from the earlier CPA page. Preserve the existing starter. Follow WordPress escaping and nonce conventions.

Run the React build, TypeScript, existing tests and ESLint; validate Gutenberg markup and PHP syntax. Inspect the real editor after changing patterns and check 390, 768, 1024, 1440 and 1920 pixel widths. Keep guide preferences and FAQ behavior aligned in both implementations.

The CSS and JavaScript under `wordpress/assets/` are intentional deployment assets and must be committed. Dependencies, build captures, screenshots, archives, credentials and local environment files must not be committed. Use an isolated local WordPress fixture for verification. Do not overwrite hosted content or apply production migrations automatically. Never rewrite published Git history.
