<?php
/**
 * Whole-page starter metadata and guarded one-click importer.
 *
 * The page designs themselves live in patterns/page-*.php so WordPress can
 * offer them in the new-page pattern modal. The importer creates draft pages
 * from those patterns without overwriting existing content.
 *
 * @package cc-modern
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pages delivered with the theme.
 *
 * @return array<string, array<string, string>>
 */
function cc_modern_starter_pages() {
	return array(
		'home'         => array(
			'title'   => __( 'Home', 'cc-modern' ),
			'slug'    => 'home',
			'pattern' => 'cc-modern/page-home',
		),
		'about'        => array(
			'title'   => __( 'About Us', 'cc-modern' ),
			'slug'    => 'us',
			'pattern' => 'cc-modern/page-about',
		),
		'about-story'  => array(
			'title'   => __( 'About Us ? Founder Story', 'cc-modern' ),
			'slug'    => 'about',
			'pattern' => 'cc-modern/page-about-story',
		),
		'services'     => array(
			'title'   => __( 'Services', 'cc-modern' ),
			'slug'    => 'services',
			'pattern' => 'cc-modern/page-services',
		),
		'pricing'      => array(
			'title'   => __( 'Pricing', 'cc-modern' ),
			'slug'    => 'pricing-sheet',
			'pattern' => 'cc-modern/page-pricing',
		),
		'testimonials' => array(
			'title'   => __( 'Testimonials', 'cc-modern' ),
			'slug'    => 'testimonials',
			'pattern' => 'cc-modern/page-testimonials',
		),
		'blog'         => array(
			'title'   => __( 'Blog', 'cc-modern' ),
			'slug'    => 'blog',
			'pattern' => 'cc-modern/page-blog',
		),
		'contact'      => array(
			'title'   => __( 'Contact', 'cc-modern' ),
			'slug'    => 'contact-us',
			'pattern' => 'cc-modern/page-contact',
		),
		'cpa-partners-new' => array(
			'title' => __( 'CPA Partners ? New', 'cc-modern' ),
			'slug' => 'cpa-partners-new',
			'pattern' => 'cc-modern/page-cpa-partners-new',
		),
		'cpa-partners' => array(
			'title' => __( 'CPA Partners', 'cc-modern' ),
			'slug' => 'cpa-partners',
			'pattern' => 'cc-modern/page-cpa-partners',
		),
		'construction' => array(
			'title'   => __( 'Construction', 'cc-modern' ),
			'slug'    => 'construction',
			'pattern' => 'cc-modern/page-industry-construction',
		),
		'healthcare'   => array(
			'title'   => __( 'Healthcare', 'cc-modern' ),
			'slug'    => 'healthcare',
			'pattern' => 'cc-modern/page-industry-healthcare',
		),
		'property'     => array(
			'title'   => __( 'Property Management & Real Estate', 'cc-modern' ),
			'slug'    => 'property-management',
			'pattern' => 'cc-modern/page-industry-property-management',
		),
	);
}

/**
 * Add the starter-page importer to Tools.
 */
function cc_modern_register_starter_pages_screen() {
	add_management_page(
		__( 'Complete Controller Starter Pages', 'cc-modern' ),
		__( 'CC Starter Pages', 'cc-modern' ),
		'edit_theme_options',
		'cc-modern-starter-pages',
		'cc_modern_render_starter_pages_screen'
	);
}
add_action( 'admin_menu', 'cc_modern_register_starter_pages_screen' );

/**
 * Render the guarded importer.
 */
function cc_modern_render_starter_pages_screen() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}

	$created = isset( $_GET['cc-created'] ) ? absint( $_GET['cc-created'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$skipped = isset( $_GET['cc-skipped'] ) ? absint( $_GET['cc-skipped'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Complete Controller Starter Pages', 'cc-modern' ); ?></h1>
		<?php if ( $created || $skipped ) : ?>
			<div class="notice notice-success is-dismissible"><p>
				<?php
				echo esc_html(
					sprintf(
						/* translators: 1: created count, 2: skipped count. */
						__( 'Created %1$d draft page(s). Skipped %2$d existing page(s).', 'cc-modern' ),
						$created,
						$skipped
					)
				);
				?>
			</p></div>
		<?php endif; ?>
		<p><?php esc_html_e( 'This creates the bundled designs as draft pages using the editable Gutenberg starters included with the theme.', 'cc-modern' ); ?></p>
		<p><strong><?php esc_html_e( 'Existing pages are never overwritten.', 'cc-modern' ); ?></strong> <?php esc_html_e( 'If a matching URL already exists, the importer leaves it unchanged.', 'cc-modern' ); ?></p>
		<ul>
		<?php foreach ( cc_modern_starter_pages() as $cc_page ) : ?>
			<li><code>/<?php echo esc_html( $cc_page['slug'] ); ?>/</code> — <?php echo esc_html( $cc_page['title'] ); ?></li>
		<?php endforeach; ?>
		</ul>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="cc_modern_create_starter_pages">
			<?php wp_nonce_field( 'cc_modern_create_starter_pages' ); ?>
			<?php submit_button( __( 'Create Missing Pages as Drafts', 'cc-modern' ), 'primary' ); ?>
		</form>
		<p><?php esc_html_e( 'After review, publish the drafts and select Home under Settings → Reading. The Blog starter contains a native Query Loop, so it automatically displays WordPress posts.', 'cc-modern' ); ?></p>
	</div>
	<?php
}

/**
 * Create missing starter pages from the registered pattern content.
 */
function cc_modern_create_starter_pages() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to create starter pages.', 'cc-modern' ) );
	}

	check_admin_referer( 'cc_modern_create_starter_pages' );

	$registry = WP_Block_Patterns_Registry::get_instance();
	$created  = 0;
	$skipped  = 0;

	foreach ( cc_modern_starter_pages() as $page ) {
		$existing = get_page_by_path( $page['slug'], OBJECT, 'page' );

		if ( $existing ) {
			++$skipped;
			continue;
		}

		$pattern = $registry->get_registered( $page['pattern'] );

		if ( ! $pattern || empty( $pattern['content'] ) ) {
			++$skipped;
			continue;
		}

		$result = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'draft',
				'post_title'   => $page['title'],
				'post_name'    => $page['slug'],
				'post_content' => $pattern['content'],
				'meta_input'   => array(
					'_wp_page_template'       => 'page-full',
					'_cc_modern_starter_page' => $page['pattern'],
				),
			),
			true
		);

		if ( is_wp_error( $result ) ) {
			++$skipped;
			continue;
		}

		++$created;
	}

	$redirect = add_query_arg(
		array(
			'page'       => 'cc-modern-starter-pages',
			'cc-created' => $created,
			'cc-skipped' => $skipped,
		),
		admin_url( 'tools.php' )
	);

	wp_safe_redirect( $redirect );
	exit;
}
add_action( 'admin_post_cc_modern_create_starter_pages', 'cc_modern_create_starter_pages' );
