/* New CPA page interactions; no React or build tool is needed in WordPress. */
(function () {
	'use strict';
	document.querySelectorAll('.cc-cpa-new-page').forEach(function (root) {
		root.addEventListener('click', function (event) {
			var link = event.target.closest('.cc-cpa-new-guide a, .cc-cpa-new-talk a');
			if (!link || link.getAttribute('href') !== '#talk') return;
			var section = document.getElementById('talk');
			if (!section) return;
			var checkbox = section.querySelector('[name="wants_guide"]');
			if (checkbox) checkbox.checked = !!link.closest('.cc-cpa-new-guide');
		});
		root.querySelectorAll('.cc-cpa-new-faq').forEach(function (item) {
			item.addEventListener('toggle', function () {
				if (!item.open) return;
				root.querySelectorAll('.cc-cpa-new-faq[open]').forEach(function (other) {
					if (other !== item) other.open = false;
				});
			});
		});
		root.querySelectorAll('form[data-cc-cpa-new-form]').forEach(function (form) {
			form.addEventListener('submit', async function (event) {
				event.preventDefault();
				if (!form.reportValidity()) return;
				var button = form.querySelector('[type="submit"]');
				if (button.disabled) return;
				var original = button.textContent;
				var feedback = form.querySelector('[role="alert"]');
				feedback.textContent = '';
				button.disabled = true;
				button.textContent = 'Sending…';
				var data = new FormData(form);
				data.set('cc_ajax', '1');
				try {
					var response = await fetch(form.getAttribute('action'), { method: 'POST', body: data, credentials: 'same-origin' });
					var result = await response.json();
					if (!response.ok || !result.success) throw new Error(result.data && result.data.message || "We couldn't send your request. Please try again.");
					// This markup is a fixed, escaped server template; no submitted data is returned.
					var success = document.createElement('div');
					success.innerHTML = result.data.html;
					form.replaceWith(success.firstElementChild);
				} catch (error) {
					feedback.textContent = error.message || "We couldn't send your request. Please try again.";
					button.disabled = false;
					button.textContent = original;
				}
			});
		});
	});
})();
