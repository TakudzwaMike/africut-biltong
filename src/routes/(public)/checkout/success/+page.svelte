import { browser } from '$app/environment';

const CART_KEY = 'vision_cart';

class CartStore {
	// Core state
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

	// Derived values (Getters in classes act like $derived)
	get count() {
		return this.items.reduce((acc, i) => acc + i.quantity, 0);
	}

	get total() {
		return this.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
	}

	addItem(product) {
		// product: { id, variantId, price, currency, quantity, ... }
		
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
			existing.quantity += product.quantity; // Fix: Add the actual quantity passed
		} else {
			// We must push a plain object or a proxied state object. 
			// Cloning ensures we don't keep references to external state.
			this.items.push({ ...product });
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

export const cart = new CartStore();