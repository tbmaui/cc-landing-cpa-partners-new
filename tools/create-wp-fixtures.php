<?php
/** Create isolated local WordPress editor fixtures for this conversion. */
$cc_new_registry = WP_Block_Patterns_Registry::get_instance();
$cc_new_page = $cc_new_registry->get_registered( 'cc-modern/page-cpa-partners-new' );
if ( ! $cc_new_page ) { throw new Exception( 'New CPA pattern is not registered.' ); }
$cc_new_sections = '';
foreach ( array( 'hero', 'trust', 'problem', 'benefits', 'process', 'services', 'testimonials', 'technology', 'getting-started', 'faq', 'closing', 'contact' ) as $cc_new_key ) {
	$cc_new_section = $cc_new_registry->get_registered( 'cc-modern/cpa-new-' . $cc_new_key );
	if ( ! $cc_new_section ) { throw new Exception( 'Section missing: ' . $cc_new_key ); }
	$cc_new_sections .= $cc_new_section['content'];
}
$cc_new_fixtures = array();
foreach ( array( 'page' => $cc_new_page['content'], 'sections' => $cc_new_sections ) as $cc_new_name => $cc_new_content ) {
	$cc_new_id = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Local new CPA verification — ' . $cc_new_name, 'post_content' => $cc_new_content, 'meta_input' => array( '_wp_page_template' => 'page-full', '_cc_new_cpa_test_fixture' => '1' ) ), true );
	if ( is_wp_error( $cc_new_id ) ) { throw new Exception( $cc_new_id->get_error_message() ); }
	$cc_new_fixtures[ $cc_new_name ] = array( 'id' => $cc_new_id, 'url' => get_permalink( $cc_new_id ) );
}
file_put_contents( dirname( __DIR__ ) . '/build/wp-fixtures.json', wp_json_encode( $cc_new_fixtures ) );
echo 'Created two local fixtures for the page and twelve section patterns.';
