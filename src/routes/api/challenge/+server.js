import { json } from '@sveltejs/kit';
import { generateChallenge } from '$lib/server/pow';

export function GET() {
	const challenge = generateChallenge();
	
	// Return the challenge with headers to prevent browser caching
	// It is crucial that every request gets a fresh, timestamped salt
	return json(challenge, {
		headers: {
			'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0'
		}
	});
}