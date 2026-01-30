import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { currencyRate } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('WiseService');

export class WiseService {
    constructor() {
        this.apiKey = env.WISE_API_KEY;
        this.baseUrl = 'https://api.transferwise.com/v1'; // Or sandbox if needed
        this.cacheDurationMs = 1000 * 60 * 60; // 1 Hour
    }

    /**
     * Get exchange rate from Source -> Target
     * Uses cache if available and fresh.
     * @param {string} fromCurrency
     * @param {string} toCurrency
     * @returns {Promise<number>} Rate
     */
    async getRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return 1;

        // 1. Check Cache
        const cached = await db.query.currencyRate.findFirst({
            where: and(
                eq(currencyRate.fromCurrency, fromCurrency),
                eq(currencyRate.toCurrency, toCurrency),
                gt(currencyRate.updatedAt, new Date(Date.now() - this.cacheDurationMs))
            )
        });

        if (cached) {
            return cached.rate / 1000000;
        }

        // 2. Fetch Live
        try {
            const rate = await this._fetchLiveRate(fromCurrency, toCurrency);

            // 3. Update/Insert Cache
            const storedRate = Math.round(rate * 1000000);

            // Upsert logic (delete old, insert new is simpler for this structure)
            await db.delete(currencyRate)
                .where(and(
                    eq(currencyRate.fromCurrency, fromCurrency),
                    eq(currencyRate.toCurrency, toCurrency)
                ));

            await db.insert(currencyRate).values({
                fromCurrency,
                toCurrency,
                rate: storedRate
            });

            return rate;
        } catch (error) {
            logger.error(`Failed to fetch rate for ${fromCurrency}->${toCurrency}`, error);
            // Fallback to expired cache if available? 
            // For now, re-throw or return 1 (risky)
            throw error;
        }
    }

    async _fetchLiveRate(source, target) {
        if (!this.apiKey) {
            logger.warn('WISE_API_KEY not set, using mock rate of 18.5 for USD->ZAR');
            if (source === 'USD' && target === 'ZAR') return 18.5;
            if (source === 'ZAR' && target === 'USD') return 0.054;
            return 1;
        }

        const response = await fetch(`${this.baseUrl}/rates?source=${source}&target=${target}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Wise API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const rateObj = data.find(r => r.source === source && r.target === target);

        if (!rateObj) {
            throw new Error('Rate not found in response');
        }

        return rateObj.rate;
    }
}
