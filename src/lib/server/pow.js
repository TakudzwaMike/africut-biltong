import crypto from 'crypto';

// Adjustable difficulty.
// 4 = ~65k hashes (Instant).
// 5 = ~1m hashes (0.5s - 2s on client). Good balance for contact forms.
const DIFFICULTY = 5; 
const VALIDITY_WINDOW_MS = 1000 * 60 * 10; // Challenge valid for 10 minutes

/**
 * Generates a new challenge for the client
 * The salt includes a timestamp to prevent reusing old solutions forever
 */
export function generateChallenge() {
	const timestamp = Date.now();
	const random = crypto.randomBytes(8).toString('hex');
	// Format: "timestamp.randomString"
	const salt = `${timestamp}.${random}`;
	
	return {
		salt,
		difficulty: DIFFICULTY
	};
}

/**
 * Verifies the client's solution.
 * 1. Checks if the challenge is expired
 * 2. Checks if SHA256(salt + nonce) has enough leading zeros
 * 
 * @param {string} salt - The salt provided to the client
 * @param {number} nonce - The number the client calculated
 */
export function verifySolution(salt, nonce) {
	if (!salt || nonce === undefined || nonce === null) return false;

	const [timestampStr] = salt.split('.');
	const timestamp = parseInt(timestampStr, 10);
	
	if (isNaN(timestamp)) return false;
	
	const now = Date.now();
	if (now - timestamp > VALIDITY_WINDOW_MS) {
		return false;
	}
	if (timestamp > now + 5000) {
		return false;
	}

	const input = `${salt}${nonce}`;
	const hash = crypto.createHash('sha256').update(input).digest('hex');
	
	const prefix = '0'.repeat(DIFFICULTY);
	
	return hash.startsWith(prefix);
}