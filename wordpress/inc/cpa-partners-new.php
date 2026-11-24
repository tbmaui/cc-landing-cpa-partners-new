<?php
/**
 * New CPA Partners page assets and server-side lead form.
 *
 * @package cc-modern
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Whether this page's lead destination has been configured by the administrator. */
function cc_modern_cpa_new_configured() {
	return defined( 'CC_MODERN_CPA_NEW_SUPABASE_URL' ) && defined( 'CC_MODERN_CPA_NEW_SUPABASE_PUBLISHABLE_KEY' )
		&& 0 === strpos( CC_MODERN_CPA_NEW_SUPABASE_URL, 'https://' ) && '' !== CC_MODERN_CPA_NEW_SUPABASE_PUBLISHABLE_KEY;
}

/** Enqueue the page assets only where the new page or one of its sections is used. */
function cc_modern_cpa_new_assets() {
	$content = is_singular() ? get_post_field( 'post_content', get_queried_object_id() ) : '';
	if ( false === strpos( $content, 'cc-cpa-new-page' ) && false === strpos( $content, 'cc-modern/cpa-new-' ) ) {
		return;
	}
	wp_enqueue_style( 'cc-modern-cpa-new', CC_MODERN_URI . '/assets/css/cpa-partners-new.css', array( 'cc-modern-theme' ), CC_MODERN_VERSION );
	wp_enqueue_script( 'cc-modern-cpa-new', CC_MODERN_URI . '/assets/js/cpa-partners-new.js', array(), CC_MODERN_VERSION, array( 'strategy' => 'defer', 'in_footer' => true ) );
}
add_action( 'wp_enqueue_scripts', 'cc_modern_cpa_new_assets' );

/** Load the same scoped component stylesheet in the block editor. */
function cc_modern_cpa_new_editor_style() {
	add_editor_style( 'assets/css/cpa-partners-new.css' );
}
add_action( 'after_setup_theme', 'cc_modern_cpa_new_editor_style' );

/** Successful submission message, shared by the normal POST and AJAX flows. */
function cc_modern_cpa_new_success() {
	return '<div class="rounded-2xl border bg-card p-10 text-center shadow-card" role="status"><h3 class="mt-4 text-2xl">' . esc_html__( "Thank you. We'll be in touch.", 'cc-modern' ) . '</h3><p class="mt-2 text-muted-foreground">' . esc_html__( 'A member of our CPA partnership team will reach out to schedule your conversation.', 'cc-modern' ) . '</p></div>';
}

/** Render the form; credentials and the remote destination never enter browser markup. */
function cc_modern_cpa_new_form() {
	$receipt = isset( $_GET['cc-cpa-receipt'] ) && is_string( $_GET['cc-cpa-receipt'] ) ? sanitize_key( wp_unslash( $_GET['cc-cpa-receipt'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( $receipt && get_transient( 'cc_cpa_new_' . $receipt ) ) {
		delete_transient( 'cc_cpa_new_' . $receipt );
		return cc_modern_cpa_new_success();
	}
	ob_start();
	require CC_MODERN_DIR . '/parts/cpa-partners-new-form.php';
	return ob_get_clean();
}
add_shortcode( 'cc_cpa_partners_new_form', 'cc_modern_cpa_new_form' );

/** Return an error without displaying backend details or claiming a successful delivery. */
function cc_modern_cpa_new_error( $message, $status = 400 ) {
	if ( isset( $_POST['cc_ajax'] ) && '1' === $_POST['cc_ajax'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		wp_send_json_error( array( 'message' => $message ), $status );
	}
	wp_die( esc_html( $message ), esc_html__( 'Request could not be sent', 'cc-modern' ), array( 'response' => $status, 'back_link' => true ) );
}

/** Validate the public form, then send the same payload used by the supplied React app. */
function cc_modern_cpa_new_submit() {
	$nonce = isset( $_POST['_cc_cpa_new_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['_cc_cpa_new_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'cc_cpa_new_lead' ) ) {
		cc_modern_cpa_new_error( __( 'Please refresh the page and try again.', 'cc-modern' ), 403 );
	}
	if ( ! cc_modern_cpa_new_configured() ) {
		cc_modern_cpa_new_error( __( "We couldn't send your request. Please contact our team.", 'cc-modern' ), 503 );
	}
	$data   = array();
	$limits = array( 'full_name' => 120, 'email' => 255, 'phone' => 40, 'firm_name' => 160, 'clients_to_refer' => 40, 'message' => 2000 );
	foreach ( $limits as $field => $limit ) {
		$value = isset( $_POST[ $field ] ) && is_string( $_POST[ $field ] ) ? trim( wp_unslash( $_POST[ $field ] ) ) : '';
		$value = 'message' === $field ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
		$length = function_exists( 'mb_strlen' ) ? mb_strlen( $value, 'UTF-8' ) : strlen( $value );
		if ( $length > $limit ) {
			cc_modern_cpa_new_error( __( 'Please shorten the highlighted information and try again.', 'cc-modern' ), 422 );
		}
		$data[ $field ] = '' === $value && ! in_array( $field, array( 'full_name', 'email', 'firm_name' ), true ) ? null : $value;
	}
	if ( '' === $data['full_name'] || '' === $data['firm_name'] || ! is_email( $data['email'] ) ) {
		cc_modern_cpa_new_error( __( 'Please enter your name, a valid email, and your firm name.', 'cc-modern' ), 422 );
	}
	$data['email']       = sanitize_email( $data['email'] );
	$data['wants_guide'] = isset( $_POST['wants_guide'] ) && '1' === $_POST['wants_guide'];
	$key                 = CC_MODERN_CPA_NEW_SUPABASE_PUBLISHABLE_KEY;
	$headers             = array( 'Content-Type' => 'application/json', 'apikey' => $key, 'Prefer' => 'return=minimal' );
	if ( 0 !== strpos( $key, 'sb_' ) ) {
		$headers['Authorization'] = 'Bearer ' . $key;
	}
	$response = wp_remote_post(
		rtrim( CC_MODERN_CPA_NEW_SUPABASE_URL, '/' ) . '/rest/v1/cpa_partner_leads',
		array( 'headers' => $headers, 'body' => wp_json_encode( $data ), 'timeout' => 15 )
	);
	if ( is_wp_error( $response ) || 201 !== wp_remote_retrieve_response_code( $response ) ) {
		cc_modern_cpa_new_error( __( "We couldn't send your request. Please try again.", 'cc-modern' ), 502 );
	}
	if ( isset( $_POST['cc_ajax'] ) && '1' === $_POST['cc_ajax'] ) {
		wp_send_json_success( array( 'html' => cc_modern_cpa_new_success() ) );
	}
	$receipt = strtolower( wp_generate_password( 32, false, false ) );
	set_transient( 'cc_cpa_new_' . $receipt, true, 5 * MINUTE_IN_SECONDS );
	$referer = wp_get_referer() ? wp_get_referer() : home_url( '/cpa-partners-new/' );
	$referer = strtok( $referer, '#' );
	wp_safe_redirect( add_query_arg( 'cc-cpa-receipt', $receipt, $referer ) . '#talk', 303 );
	exit;
}
add_action( 'admin_post_cc_cpa_new_lead', 'cc_modern_cpa_new_submit' );
add_action( 'admin_post_nopriv_cc_cpa_new_lead', 'cc_modern_cpa_new_submit' );
