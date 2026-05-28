import 'dotenv/config';
import { db, client } from '$lib/server/db/index.js';
import { supplier, product, productVariant, productSupplier } from '$lib/server/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { SmdService } from '$lib/server/services/SmdService.js';

// Setup Mock Fetch if no real credentials are set
const token = process.env.SMD_API_TOKEN;
const clientKey = process.env.SMD_CLIENT_ACCESS_KEY;

if (!token || !clientKey) {
    console.log('ℹ️  No real SMD credentials found. Enabling mock API responses...');
    
    // Set mock env credentials so the service constructor passes checks
    process.env.SMD_API_TOKEN = 'mock-token';
    process.env.SMD_CLIENT_ACCESS_KEY = 'mock-key';

    globalThis.fetch = async (url) => {
        const u = new URL(url);
        const endpoint = u.pathname.split('/').pop();

        let data = [];
        if (endpoint === 'products') {
            data = [
                { id: 101, name: "SMD Wireless Headset", description: "High-quality sound with deep bass.", sku: "SMD-W-HEADSET", type: "physical" },
                { id: 102, name: "SMD Ergonomic Mouse", description: "Comfortable optical mouse.", sku: "SMD-ERGO-MOUSE", type: "physical" }
            ];
        } else if (endpoint === 'media') {
            data = [
                { productId: 101, url: "https://images.smdtechnologies.com/headset.jpg", altText: "SMD Wireless Headset Image" },
                { productId: 102, url: "https://images.smdtechnologies.com/mouse.jpg", altText: "SMD Mouse Image" }
            ];
        } else if (endpoint === 'prices') {
            data = [
                { productId: 101, price: 500.00 }, // ZAR cost
                { productId: 102, price: 150.00 }  // ZAR cost
            ];
        } else if (endpoint === 'stock') {
            data = [
                { productId: 101, stock: 75 },
                { productId: 102, stock: 120 }
            ];
        }

        return {
            ok: true,
            json: async () => ({
                data,
                numberOfPages: 1
            })
        };
    };
}

async function runTest() {
    console.log('🚀 Starting SMD catalog sync test run...');

    try {
        const service = new SmdService();
        const result = await service.syncCatalog();

        console.log('📊 Sync complete!', result);

        // Verification phase
        console.log('\n🔍 Verifying Database state...');
        
        // 1. Verify SMD Supplier default markup is 40%
        const smdSupplier = await db.query.supplier.findFirst({
            where: eq(supplier.name, 'SMD Technologies')
        });

        if (smdSupplier) {
            console.log(`✅ Supplier "SMD Technologies" found. Default Markup: ${smdSupplier.defaultMarkup}%`);
            if (smdSupplier.defaultMarkup !== 40) {
                console.error(`❌ Error: Supplier default markup is ${smdSupplier.defaultMarkup}%, expected 40%`);
            }
        } else {
            console.error('❌ Error: Supplier "SMD Technologies" was not created.');
        }

        // 2. Verify products and their prices/stock
        const expectedSkus = ['SMD-W-HEADSET', 'SMD-ERGO-MOUSE'];
        const variants = await db.query.productVariant.findMany({
            where: inArray(productVariant.sku, expectedSkus),
            with: {
                product: true,
                supplierLinks: {
                    with: { supplier: true }
                }
            }
        });

        console.log(`\nFound ${variants.length} synced product variants:`);
        for (const v of variants) {
            console.log(`\n📦 Product: ${v.product.name} (SKU: ${v.sku})`);
            console.log(`   Stock: ${v.stock} (expected ${v.sku === 'SMD-W-HEADSET' ? 75 : 120})`);
            console.log(`   Supplier Cost: ZAR ${(v.supplierLinks[0]?.rawPrice / 100).toFixed(2)}`);
            console.log(`   Calculated Retail Price (ZAR): ZAR ${(v.priceZar / 100).toFixed(2)}`);
            console.log(`   Calculated Retail Price (USD): USD ${(v.priceUsd / 100).toFixed(2)}`);

            // Expected calculations (40% markup)
            const expectedZar = v.sku === 'SMD-W-HEADSET' ? 70000 : 21000;
            if (v.priceZar !== expectedZar) {
                console.error(`❌ Pricing Error: Retail price ZAR is ${v.priceZar}, expected ${expectedZar}`);
            } else {
                console.log(`   ✅ Retail ZAR matches cost + 40% markup exactly.`);
            }
        }

    } catch (err) {
        console.error('❌ Test failed with error:', err);
    } finally {
        console.log('🔌 Closing db client connection...');
        await client.end();
        console.log('👋 Finished test run.');
        process.exit(0);
    }
}

runTest();
