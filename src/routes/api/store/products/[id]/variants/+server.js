import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { productVariant, siteSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog';

export async function POST({ request, params, locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Forbidden');
	}

    const body = await request.json();
    let { name, sku, priceUsd, priceZar, stock, isDefault } = body;

    if (!name) throw error(400, 'Variant name is required.');

    // Exchange Rate Logic
    const [rateSetting] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'exchange_rate_usd_to_zar'));
    const exchangeRate = rateSetting ? parseFloat(rateSetting.value) : null;

    const toCents = (val) => val ? Math.round(parseFloat(val) * 100) : null;
    let usdCents = toCents(priceUsd);
    let zarCents = toCents(priceZar);

    if (exchangeRate) {
        if (usdCents != null && zarCents == null) {
            zarCents = Math.round(usdCents * exchangeRate);
        } else if (zarCents != null && usdCents == null) {
            usdCents = Math.round(zarCents / exchangeRate);
        }
    }

	const [newVariant] = await db
		.insert(productVariant)
		.values({
			productId: Number(params.id),
            name,
            sku: sku || null,
            priceUsd: usdCents,
            priceZar: zarCents,
            stock: stock ? parseInt(stock) : null,
            isDefault: Boolean(isDefault)
		})
		.returning();

	await log(locals.user.id, 'create_variant', {
		targetId: params.id,
        data: { variantId: newVariant.id, name }
	});

	return json(newVariant, { status: 201 });
}