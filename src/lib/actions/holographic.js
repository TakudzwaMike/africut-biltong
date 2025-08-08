import { browser } from '$app/environment';

/**
 * A Svelte Action that gives an element a 3D "holographic tilt" effect
 * based on the mouse position within it.
 *
 * @param {HTMLElement} node - The element the action is applied to.
 * @param {{tiltStrength?: number}} [options] - Configuration options.
 */
export function holographic(node, options = {}) {
	// --- SSR Guard ---
	if (!browser) {
		return {
			destroy() {}
		};
	}

	const { tiltStrength = 15 } = options;
	let rect;

	const onMouseMove = (e) => {
		rect = node.getBoundingClientRect();
		const mouseX = e.clientX;
		const mouseY = e.clientY;

		const normX = (mouseX - rect.left) / rect.width; // 0 to 1
		const normY = (mouseY - rect.top) / rect.height; // 0 to 1

		const rotateY = (normX - 0.5) * 2 * tiltStrength; // -tiltStrength to +tiltStrength
		const rotateX = -(normY - 0.5) * 2 * tiltStrength; // Inverted for a natural feel

		node.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
	};

	const onMouseLeave = () => {
		node.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
	};

	node.addEventListener('mouseenter', () => {
		rect = node.getBoundingClientRect(); // Get dimensions on enter
	});
	node.addEventListener('mousemove', onMouseMove);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseenter', () => (rect = node.getBoundingClientRect()));
			node.removeEventListener('mousemove', onMouseMove);
			node.removeEventListener('mouseleave', onMouseLeave);
		}
	};
}