import { PaymentStrategy } from './PaymentStrategy.js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import crypto from 'crypto';
import querystring from 'querystring';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PaynowStrategy');
const PAYNOW_INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';

export class PaynowStrategy extends PaymentStrategy {
    constructor() {
        super();
        this.integrationId = env.PAYNOW_INTEGRATION_ID;
        this.integrationKey = env.PAYNOW_INTEGRATION_KEY;
        this.baseUrl = publicEnv.PUBLIC_BASE_URL || 'http://localhost:5173';
    }

    async initiateRedirectTransaction(orderPublicId, amountInCents, customerEmail) {
        const amount = (amountInCents / 100).toFixed(2);

        const payload = {
            id: this.integrationId,
            reference: orderPublicId,
            amount: amount,
            additionalinfo: `Order #${orderPublicId}`,
            returnurl: `${this.baseUrl}/checkout/return?order_id=${orderPublicId}`,
            resulturl: `${this.baseUrl}/api/store/payment-callback/paynow`,
            status: 'Message',
            authemail: customerEmail || 'nomail@vision-ai.tech'
        };

        logger.info(`Initiating Paynow Redirect Transaction for Order ${orderPublicId}`, { amount });

        try {
            return await this._sendRequest(payload);
        } catch (error) {
            logger.error(`Paynow Redirect Init Failed for ${orderPublicId}`, error);
            throw error;
        }
    }

    async initiateExpressTransaction(orderPublicId, amountInCents, customerEmail, mobileNumber, mobileNetwork) {
        const amount = (amountInCents / 100).toFixed(2);

        const methodMap = {
            'ecocash': 'ecocash',
            'onemoney': 'onemoney',
            'telecash': 'telecash'
        };

        const paymentMethod = methodMap[mobileNetwork.toLowerCase()];
        if (!paymentMethod) throw new Error('Unsupported mobile network for Paynow express.');

        logger.info(`Initiating Paynow Express Transaction for Order ${orderPublicId}`, {
            amount, mobileNetwork, mobileNumber
        });

        const payload = {
            id: this.integrationId,
            reference: orderPublicId,
            amount: amount,
            additionalinfo: `Order #${orderPublicId}`,
            returnurl: `${this.baseUrl}/checkout/return?order_id=${orderPublicId}`,
            resulturl: `${this.baseUrl}/api/store/payment-callback/paynow`,
            status: 'Message',
            authemail: customerEmail || 'nomail@vision-ai.tech',
            method: paymentMethod,
            phone: mobileNumber
        };

        try {
            return await this._sendRequest(payload);
        } catch (error) {
            logger.error(`Paynow Express Init Failed for ${orderPublicId}`, error);
            throw error;
        }
    }

    async _sendRequest(payload) {
        payload.hash = this._generateHash(payload);
        const body = querystring.stringify(payload);

        const response = await fetch(PAYNOW_INITIATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
        });

        const responseText = await response.text();
        const responseData = querystring.parse(responseText);

        if (responseData.status.toLowerCase() === 'error') {
            throw new Error(String(responseData.error));
        }
        if (!this._validateHash(responseData)) {
            throw new Error('Invalid hash received from Paynow.');
        }

        return responseData;
    }

    async isHealthy() {
        if (!this.integrationId || !this.integrationKey) return false;
        try {
            const res = await fetch(PAYNOW_INITIATE_URL, { method: 'HEAD' });
            return res.status >= 200 && res.status < 500;
        } catch (e) {
            return false;
        }
    }

    _generateHash(payload) {
        const orderedValues = Object.values(payload);
        let concatenatedString = orderedValues.join('') + this.integrationKey;
        return crypto.createHash('sha512').update(concatenatedString, 'utf-8').digest('hex').toUpperCase();
    }

    _validateHash(receivedData) {
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
        concatenatedString += this.integrationKey;
        const expectedHash = crypto.createHash('sha512').update(concatenatedString, 'utf-8').digest('hex').toUpperCase();

        return receivedHash === expectedHash;
    }
}
