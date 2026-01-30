import { PaynowStrategy } from './strategies/PaynowStrategy.js';
import { PaystackStrategy } from './strategies/PaystackStrategy.js';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PaymentService');

export class PaymentService {
    constructor() {
        this.strategies = {
            paynow: new PaynowStrategy(),
            paystack: new PaystackStrategy()
        };
        logger.info('PaymentService initialized', { strategies: Object.keys(this.strategies) });
    }

    /**
     * Get a payment strategy by name.
     * @param {string} provider - 'paynow' or 'paystack'
     * @returns {import('./strategies/PaymentStrategy').PaymentStrategy}
     */
    getStrategy(provider) {
        const strategy = this.strategies[provider];
        if (!strategy) {
            logger.warn(`Attempted to use unsupported payment provider: ${provider}`);
            throw new Error(`Payment provider '${provider}' is not supported.`);
        }
        return strategy;
    }

    /**
     * Initiate a redirect transaction using the specified provider.
     * @param {string} provider 
     * @param {string} orderPublicId 
     * @param {number} amountInCents 
     * @param {string} customerEmail 
     */
    async initiateRedirectTransaction(provider, orderPublicId, amountInCents, customerEmail) {
        logger.info(`Initiating Redirect Transaction (${provider}) for ${orderPublicId}`);
        const strategy = this.getStrategy(provider);
        return strategy.initiateRedirectTransaction(orderPublicId, amountInCents, customerEmail);
    }

    /**
     * Initiate an express transaction (mobile money).
     * @param {string} provider 
     * @param {string} orderPublicId 
     * @param {number} amountInCents 
     * @param {string} customerEmail 
     * @param {string} mobileNumber 
     * @param {string} mobileNetwork 
     */
    async initiateExpressTransaction(provider, orderPublicId, amountInCents, customerEmail, mobileNumber, mobileNetwork) {
        logger.info(`Initiating Express Transaction (${provider}) for ${orderPublicId}`, { mobileNetwork, mobileNumber });
        const strategy = this.getStrategy(provider);
        if (!strategy.initiateExpressTransaction) {
            throw new Error(`Provider ${provider} does not support express transactions.`);
        }
        return strategy.initiateExpressTransaction(orderPublicId, amountInCents, customerEmail, mobileNumber, mobileNetwork);
    }
}
