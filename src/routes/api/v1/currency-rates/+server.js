import { json } from '@sveltejs/kit';
import { WiseService } from '$lib/server/services/WiseService';

export async function GET({ url }) {
    // Return standard conversion rates. We'll support ZAR -> USD and ZAR -> ZAR.
    const wiseService = new WiseService();

    try {
        // Since base pricing is predominantly retrieved in ZAR or USD, we get rates from a base currency.
        // Assuming base products store priceZar and priceUsd, we can fetch live conversion rates.
        // E.g. 1 USD = ? ZAR
        const usdToZar = await wiseService.getRate('USD', 'ZAR');

        // E.g. 1 ZAR = ? USD
        const zarToUsd = await wiseService.getRate('ZAR', 'USD');

        return json({
            rates: {
                USD_TO_ZAR: usdToZar,
                ZAR_TO_USD: zarToUsd,
                USD: 1, // Normalized baseline
                ZAR: 1
            },
            timestamp: Date.now()
        });
    } catch (e) {
        console.error('Wise API rate fetch failed:', e);
        // Fallback rates if API is unavailable
        return json({
            rates: {
                USD_TO_ZAR: 18.5,
                ZAR_TO_USD: 0.054,
                USD: 1,
                ZAR: 1
            },
            fallback: true,
            timestamp: Date.now()
        }, { status: 500 });
    }
}
