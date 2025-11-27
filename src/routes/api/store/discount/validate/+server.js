import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { discountCode } from '$lib/server/db/schema';
import { eq, and, lte, gte, or, isNull } from 'drizzle-orm';

export async function POST({ request }) {
	const { code, subtotalCents } = await request.json();

	if (!code || typeof code !== 'string') {
		return json({ valid: false, message: 'Code is required.' }, { status: 400 });
	}

	const normalizedCode = code.trim().toUpperCase();
	const now = new Date();

	try {
		// Find code that matches:
		// 1. Code string
		// 2. Is Active
		// 3. Date range (startsAt <= now <= endsAt) OR dates are null
		const validCode = await db.query.discountCode.findFirst({
			where: and(
				eq(discountCode.code, normalizedCode),
				eq(discountCode.isActive, true),
				or(isNull(discountCode.startsAt), lte(discountCode.startsAt, now)),
				or(isNull(discountCode.endsAt), gte(discountCode.endsAt, now))
			)
		});

		if (!validCode) {
			return json({ valid: false, message: 'Invalid or expired code.' });
		}

		// Check Usage Limit
		if (validCode.usageLimit !== null && validCode.usageCount >= validCode.usageLimit) {
			return json({ valid: false, message: 'This code has reached its usage limit.' });
		}

		// Check Minimum Order Amount
		if (validCode.minOrderAmount !== null && subtotalCents < validCode.minOrderAmount) {
			const shortBy = ((validCode.minOrderAmount - subtotalCents) / 100).toFixed(2);
			return json({ 
				valid: false, 
				message: `Order must be at least $${(validCode.minOrderAmount / 100).toFixed(2)}. Add $${shortBy} more.` 
			});
		}

		// Calculate Discount Amount
		let discountAmount = 0;
		if (validCode.type === 'percentage') {
			discountAmount = Math.round(subtotalCents * (validCode.value / 100));
		} else {
			// Fixed amount is stored in cents
			discountAmount = validCode.value;
		}

		// Cap discount at subtotal (cannot be negative)
		if (discountAmount > subtotalCents) {
			discountAmount = subtotalCents;
		}

		return json({
			valid: true,
			code: validCode.code,
			type: validCode.type,
			value: validCode.value,
			discountAmount,
			message: 'Discount applied!'
		});

	} catch (error) {
		console.error('Discount validation error:', error);
		return json({ valid: false, message: 'Server error validating code.' }, { status: 500 });
	}
}
