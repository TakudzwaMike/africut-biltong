/**
 * @interface
 */
export class PaymentStrategy {
    /**
     * Initiate a redirect transaction.
     * @param {string} orderPublicId 
     * @param {number} amountInCents 
     * @param {string} customerEmail 
     * @returns {Promise<any>}
     */
    async initiateRedirectTransaction(orderPublicId, amountInCents, customerEmail) {
        throw new Error('Method not implemented.');
    }

    /**
     * Check if the service is healthy.
     * @returns {Promise<boolean>}
     */
    async isHealthy() {
        throw new Error('Method not implemented.');
    }
}
