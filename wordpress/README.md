# Native WordPress version

Use the complete `cc-modern-1.3.16.zip` theme attached to the repository release. This directory is an integration overlay, not a complete standalone theme. The new starter is `cc-modern/page-cpa-partners-new`; the original `cc-modern/page-cpa-partners` remains available separately.

For an existing matching cc-modern installation, merge the page-specific assets, `patterns/cpa-new-*.php`, `patterns/page-cpa-partners-new.php`, `parts/cpa-partners-new-form.php` and `inc/cpa-partners-new.php`. Include the new module from the theme bootstrap:

```php
require_once CC_MODERN_DIR . '/inc/cpa-partners-new.php';
```

The supplied `inc/page-templates.php` snapshot registers the separate draft starter. Other shared files are dependency snapshots; compare with local changes before replacing them. The module loads scoped CSS in the editor and on pages containing the new page or section wrappers. Vanilla JavaScript handles guide buttons, native FAQs and form feedback.

## Form configuration

Apply `react/drizzle/migrations/0000_create_cpa_partner_leads.sql` from the repository root to the chosen Supabase database. It includes the insert-only RLS policy. No migration is run automatically.

Configure these server-side constants in `wp-config.php` before the stop-editing line:

```php
define( 'CC_MODERN_CPA_NEW_SUPABASE_URL', 'https://YOUR-PROJECT.supabase.co' );
define( 'CC_MODERN_CPA_NEW_SUPABASE_PUBLISHABLE_KEY', 'YOUR-PUBLISHABLE-KEY' );
```

Use the project's publishable key, not a service-role key. Credentials stay server-side. The handler validates the nonce and field limits and reports success only after an HTTP 201 from the backend. The guide preference is stored as `wants_guide`. Without JavaScript, a successful POST redirects back with a short-lived receipt. Without destination settings, submission is disabled and a contact link is provided.

Verify actual delivery on staging before enabling the live page. Local tests intercept outbound requests and do not insert real leads.
