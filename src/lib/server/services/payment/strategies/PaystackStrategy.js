import { PaymentStrategy } from './PaymentStrategy.js';
import { env } from '$env/dynamic/private';

const PAYSTACK_API_URL = 'https://api.paystack.co';

export class PaystackStrategy extends PaymentStrategy {
    constructor() {
        super();
        this.secretKey = env.PAYSTACK_SECRET_KEY;
    }

    async initiateRedirectTransaction(orderPublicId, amountInCents, customerEmail) {
        if (!amountInCents || isNaN(amountInCents)) throw new Error('Invalid amount.');

        const payload = {
            email: customerEmail,
            amount: String(amountInCents),
            currency: 'ZAR',
            reference: `order_${orderPublicId}_${Date.now()}`,
            metadata: {
                order_public_id: String(orderPublicId),
            },
        };

        const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok || responseData.status !== true) {
            throw new Error(responseData.message || 'Paystack API returned an error.');
        }

        return responseData.data;
    }

    async isHealthy() {
        if (!this.secretKey) return false;
        try {
            // Paystack has a list banks endpoint that is good for health checks 
            // or just checking if secret key works might require a lighter call.
            // We'll just check if the base API is reachable.
            // But usually we want to verify auth. 
            // Let's call /transaction/verify/fake_ref (might 404 but prove connectivity).
            // Actually, best is probably just HEAD to base or check generic endpoint.
            // Let's try GET /bank (publicly available? usually auth required).

            const response = await fetch(`${PAYSTACK_API_URL}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                }
            });
            // Paystack root usually returns 200 "Paystack API"
            return response.status === 200;
        } catch (e) {
            return false;
        }
    }
}
