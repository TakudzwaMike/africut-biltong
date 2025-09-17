import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * @typedef {Object} CartItem
 * @property {number} id - The product ID
 * @property {string} name - The product name
 * @property {string} slug - The product slug
 * @property {string} [thumbnailUrl] - The product thumbnail URL
 * @property {number} quantity - The quantity of the product in the cart
 * @property {number} price - The price of a single item (in cents)
 * @property {string} currency - The currency code (e.g., 'USD')
 */

/**
 * Creates a persistent cart store.
 */
function createCart() {
	/** @type {import('svelte/store').Writable<CartItem[]>} */
	const { subscribe, set, update } = writable([]);

	// Load from localStorage on initialization if in browser
	if (browser) {
		const storedCart = localStorage.getItem('cart');
		if (storedCart) {
			set(JSON.parse(storedCart));
		}
	}
	
	/** @param {CartItem[]} updatedCart */
	function persist(updatedCart) {
		if (browser) {
			localStorage.setItem('cart', JSON.stringify(updatedCart));
		}
	}

	return {
		subscribe,
		/** @param {import('$lib/server/db/schema').product} product - The product to add */
		/** @param {number} price - The selected price in cents */
		/** @param {string} currency - The selected currency */
		addItem: (product, price, currency) =>
			update((items) => {
				const existingItem = items.find((i) => i.id === product.id);

				if (existingItem) {
					existingItem.quantity += 1;
				} else {
					items.push({
						id: product.id,
						name: product.name,
						slug: product.slug,
						thumbnailUrl: product.featuredImage?.thumbnailUrl,
						price: price,
						currency: currency,
						quantity: 1
					});
				}

				persist(items);
				return items;
			}),

		/** @param {number} productId - The ID of the product to remove */
		removeItem: (productId) =>
			update((items) => {
				const updatedItems = items.filter((i) => i.id !== productId);
				persist(updatedItems);
				return updatedItems;
			}),

		/** @param {number} productId - The ID of the product to update */
		/** @param {number} quantity - The new quantity */
		updateQuantity: (productId, quantity) =>
			update((items) => {
				const item = items.find((i) => i.id === productId);
				if (item) {
					if (quantity > 0) {
						item.quantity = quantity;
					} else {
						// Remove if quantity is 0 or less
						items = items.filter((i) => i.id !== productId);
					}
				}
				persist(items);
				return items;
			}),
		
		clearCart: () => {
			set([]);
			persist([]);
		}
	};
}

export const cart = createCart();