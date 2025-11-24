import { env } from '$env/dynamic/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import crypto from 'crypto';
import querystring from 'querystring';

const PAYNOW_INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const PAYNOW_REMOTETRANSACTION_URL = 'https://www.paynow.co.zw/interface/remotetransaction';

// Ensure these are in your .env file
const PAYNOW_ID = env.PAYNOW_INTEGRATION_ID;
const PAYNOW_KEY = env.PAYNOW_INTEGRATION_KEY;

// Fallback for development
const BASE_URL = PUBLIC_BASE_URL || 'http://localhost:5173';

const isDev = process.env.NODE_ENV === 'development';
function logDev(...args) {
    if (isDev) console.log('[PaynowProvider]', ...args);
}

function generateHash(payload) {
    const orderedValues = Object.values(payload);
    let concatenatedString = orderedValues.join('') + PAYNOW_KEY;
    const hash = crypto.createHash('sha512').update(concatenatedString, 'utf-8').digest('hex').toUpperCase();
    return hash;
}

export function validateHash(receivedData) {
    const receivedHash = receivedData.hash;
    if (!receivedHash) return false;

    let concatenatedString = "";
    for (const key in receivedData) {
        if (Object.prototype.hasOwnProperty.call(receivedData, key)) {
            if (key.toLowerCase() !== 'hash') {
                concatenatedString += receivedData[key];
            }
        }
    }
    concatenatedString += PAYNOW_KEY;
    const expectedHash = crypto.createHash('sha512').update(concatenatedString, 'utf-8').digest('hex').toUpperCase();
    
    return receivedHash === expectedHash;
}

/**
 * Initiates a Web Redirect Transaction.
 * @param {string} orderPublicId - The human-readable order ID (e.g., 1024).
 * @param {number} amountInCents - Total amount in CENTS.
 * @param {string} customerEmail 
 */
export async function initiateRedirectTransaction(orderPublicId, amountInCents, customerEmail) {
    logDev(`Initiating REDIRECT payment for order #${orderPublicId}`);
    
    // Convert Cents to Dollars for Paynow
    const amount = (amountInCents / 100).toFixed(2);

    const payload = {
        id: PAYNOW_ID,
        reference: orderPublicId,
        amount: amount,
        additionalinfo: `Order #${orderPublicId}`,
        returnurl: `${BASE_URL}/checkout/return?order_id=${orderPublicId}`,
        resulturl: `${BASE_URL}/api/store/payment-callback/paynow`, // Updated callback path
        status: 'Message',
    };
    
    payload.hash = generateHash(payload);
    const body = querystring.stringify(payload);

    const response = await fetch(PAYNOW_INITIATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
    });

    const responseText = await response.text();
    const responseData = querystring.parse(responseText);

    if (responseData.status.toLowerCase() === 'error') throw new Error(responseData.error);
    if (!validateHash(responseData)) throw new Error('Invalid hash received from Paynow.');
    
    return responseData;
}

/**
 * Initiates an Express (Mobile Money) Transaction.
 * @param {string} orderPublicId 
 * @param {number} amountInCents 
 * @param {string} customerEmail 
 * @param {string} method - 'ecocash' or 'onemoney'
 * @param {string} phone 
 */
export async function initiateExpressTransaction(orderPublicId, amountInCents, customerEmail, method, phone) {
    logDev(`Initiating EXPRESS payment for order #${orderPublicId} via ${method}`);
    
    const amount = (amountInCents / 100).toFixed(2);

    const payload = {
        id: PAYNOW_ID,
        reference: orderPublicId,
        amount: amount,
        additionalinfo: `Order #${orderPublicId}`,
        returnurl: `${BASE_URL}/checkout/return?order_id=${orderPublicId}`,
        resulturl: `${BASE_URL}/api/store/payment-callback/paynow`,
        authemail: customerEmail,
        status: 'Message',
        method: method.toLowerCase(),
        phone,
    };
    
    payload.hash = generateHash(payload);
    const body = querystring.stringify(payload);

    const response = await fetch(PAYNOW_REMOTETRANSACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
    });

    const responseText = await response.text();
    const responseData = querystring.parse(responseText);

    if (responseData.status.toLowerCase() === 'error') throw new Error(responseData.error);
    if (!validateHash(responseData)) throw new Error('Invalid hash received from Paynow.');

    return responseData;
}