import { browser } from '$app/environment';

const CART_KEY = 'vision_cart';

class CartStore {
	items = $state([]);
	currency = $state('USD');

	constructor() {
		if (browser) {
			const saved = localStorage.getItem(CART_KEY);
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					this.items = parsed.items || [];
					this.currency = parsed.currency || 'USD';
				} catch (e) {
					console.error('Cart load error:', e);
				}
			}

			// Auto-persist whenever state changes
			$effect.root(() => {
				$effect(() => {
					localStorage.setItem(CART_KEY, JSON.stringify({
						items: this.items,
						currency: this.currency
					}));
				});
			});
		}
	}

	// In Svelte 5, getters on $state fields are auto-reactive
	get count() {
		return this.items.reduce((acc, i) => acc + i.quantity, 0);
	}

	get total() {
		return this.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
	}

	addItem(product) {
		// 1. Currency Check
		if (this.items.length > 0 && this.currency !== product.currency) {
			if (!confirm(`Your cart contains ${this.currency} items. Clear cart to add ${product.currency} items?`)) {
				return;
			}
			this.clear();
			this.currency = product.currency;
		} else if (this.items.length === 0) {
			this.currency = product.currency;
		}

		// 2. Add or Update
		const existing = this.items.find(i => i.variantId === product.variantId);
		
		if (existing) {
			// Update existing item quantity
			existing.quantity += product.quantity;
		} else {
			// Add new item (Clone it to ensure it's a plain object)
			this.items.push({
				id: product.id,
				name: product.name,
				variantId: product.variantId,
				variantName: product.variantName,
				image: product.image,
				price: product.price,
				currency: product.currency,
				quantity: product.quantity
			});
		}
	}

	updateQuantity(variantId, delta) {
		const item = this.items.find(i => i.variantId === variantId);
		if (item) {
			item.quantity += delta;
			if (item.quantity <= 0) {
				this.removeItem(variantId);
			}
		}
	}

	removeItem(variantId) {
		this.items = this.items.filter(i => i.variantId !== variantId);
	}

	clear() {
		this.items = [];
		this.currency = 'USD';
	}
}

// Export a global singleton
export const cart = new CartStore();