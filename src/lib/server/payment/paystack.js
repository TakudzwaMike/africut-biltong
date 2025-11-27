import { env } from '$env/dynamic/private';
import crypto from 'crypto';

const PAYSTACK_API_URL = 'https://api.paystack.co';
const PAYSTACK_KEY = env.PAYSTACK_SECRET_KEY;

const isDev = process.env.NODE_ENV === 'development';
function logDev(...args) {
    if (isDev) {
        console.log('[PaystackProvider]', ...args);
    }
}

/**
 * Validates an incoming webhook hash from Paystack.
 * @param {string | Buffer} rawBody - The raw request body.
 * @param {string} signature - The value of the 'x-paystack-signature' header.
 * @returns {boolean} - True if the hash is valid.
 */
export function validateWebhook(rawBody, signature) {
    if (!PAYSTACK_KEY) {
        console.error('PAYSTACK_SECRET_KEY is missing.');
        return false;
    }
    
    const hash = crypto
        .createHmac('sha512', PAYSTACK_KEY)
        .update(rawBody)
        .digest('hex');

    return hash === signature;
}

/**
 * Initiates a Standard Redirect transaction for ZAR.
 * @param {string} orderPublicId - Our internal public order ID.
 * @param {number} amountInCents - The amount to charge in CENTS (Integer).
 * @param {string} customerEmail - The customer's email.
 * @returns {Promise<{ authorization_url: string, access_code: string, reference: string }>}
 */
export async function initiateRedirectTransaction(orderPublicId, amountInCents, customerEmail) {
    logDev(`Initiating REDIRECT payment for order #${orderPublicId}`);
    
    // Validate input
    if (!amountInCents || isNaN(amountInCents)) throw new Error('Invalid amount.');
    
    const payload = {
        email: customerEmail,
        amount: String(amountInCents), // Paystack expects cents (kobo)
        currency: 'ZAR',
        reference: `order_${orderPublicId}_${Date.now()}`, // Unique reference
        metadata: {
            order_public_id: String(orderPublicId),
        },
        // Optional: Paystack callback URL is usually configured in the dashboard, 
        // but can be overridden here if needed.
    };

    try {
        const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok || responseData.status !== true) {
            throw new Error(responseData.message || 'Paystack API returned an error.');
        }

        return responseData.data; 

    } catch (error) {
        console.error('[PaystackProvider] Error initiating transaction:', error.message);
        throw new Error(error.message || 'Failed to communicate with Paystack.');
    }
}