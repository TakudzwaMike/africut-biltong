/**
 * A Svelte Action that uses the IntersectionObserver API to trigger a callback
 * when an element enters the viewport.
 *
 * @param {HTMLElement} node - The element the action is applied to.
 * @param {{
 *   onEnter?: (entry: IntersectionObserverEntry) => void;
 *   once?: boolean;
 * } & IntersectionObserverInit} [params] - Optional parameters.
 * @returns {{destroy: () => void}}
 */
export function viewport(node, params = {}) {
	const { onEnter, once = true, ...options } = params;
	let observer;

	if (typeof IntersectionObserver === 'undefined') {
		// Fallback for older browsers or server-side rendering
		if (onEnter) onEnter(null);
		return;
	}

	const handleIntersect = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				if (onEnter) {
					onEnter(entry);
				}
				if (once && observer) {
					observer.disconnect();
				}
			}
		});
	};

	observer = new IntersectionObserver(handleIntersect, options);
	observer.observe(node);

	return {
		destroy() {
			if (observer) {
				observer.disconnect();
			}
		}
	};
}
