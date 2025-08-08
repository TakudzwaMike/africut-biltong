/**
 * A Svelte Action that uses the IntersectionObserver API to dispatch events
 * when an element enters or exits the viewport.
 *
 * This action dispatches two custom events:
 * - `enterViewport`: When the element enters the viewport.
 * - `exitViewport`: When the element exits the viewport.
 *
 * @param {HTMLElement} node - The element the action is applied to.
 * @param {IntersectionObserverInit} [options] - Optional IntersectionObserver options.
 * @returns {{destroy: () => void}} - An object with a destroy method to clean up the observer.
 */
export function viewport(node, options) {
	let observer;

	const handleIntersect = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				node.dispatchEvent(new CustomEvent('enterViewport'));
			} else {
				node.dispatchEvent(new CustomEvent('exitViewport'));
			}
		});
	};

	const createObserver = () => {
		observer = new IntersectionObserver(handleIntersect, options);
		observer.observe(node);
	};

	createObserver();

	return {
		destroy() {
			if (observer) {
				observer.disconnect();
			}
		}
	};
}