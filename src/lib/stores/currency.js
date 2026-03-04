import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { cart } from './cart.svelte.js'; // Updated import

const CURRENCY_STORAGE_KEY = 'vision_currency';
const supportedCurrencies = ['USD', 'ZAR'];

function createCurrencyStore() {
    let initialCurrency = 'USD';

    if (browser) {
        const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (saved && supportedCurrencies.includes(saved)) {
            initialCurrency = saved;
        }
    }

    const { subscribe, set } = writable(initialCurrency);

    return {
        subscribe,
        setCurrency: (newCurrency) => {
            if (supportedCurrencies.includes(newCurrency)) {
                // Clear the cart to prevent mixed-currency orders
                cart.clear();

                set(newCurrency);
                if (browser) {
                    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
                    window.location.reload();
                }
            }
        }
    };
}

export const currency = createCurrencyStore();

export const currencyRates = writable({
    USD_TO_ZAR: 18.5,
    ZAR_TO_USD: 0.054,
    USD: 1,
    ZAR: 1
});

if (browser) {
    fetch('/api/v1/currency-rates')
        .then(res => res.json())
        .then(data => {
            if (data.rates) {
                currencyRates.set(data.rates);
            }
        })
        .catch(console.error);
}