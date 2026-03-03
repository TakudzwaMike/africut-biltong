import { ProductService } from '$lib/server/services/ProductService';
import { escapeCsvField } from '$lib/server/csv';

export async function GET({ locals }) {
    // Security check
    if (!locals.user || !['admin', 'store_manager'].includes(locals.user.role)) {
        return new Response('Unauthorized', { status: 403 });
    }

    const productService = new ProductService();
    const products = await productService.getAllProducts();

    const headers = [
        'Product ID',
        'Product Name',
        'Slug',
        'Type',
        'Short Description',
        'Variant ID',
        'Variant Name',
        'SKU',
        'Stock',
        'Price USD (Cents)',
        'Price ZAR (Cents)'
    ];

    const csvRows = [headers.join(',')];

    for (const p of products) {
        if (p.variants.length > 0) {
            for (const v of p.variants) {
                csvRows.push([
                    escapeCsvField(p.id),
                    escapeCsvField(p.name),
                    escapeCsvField(p.slug),
                    escapeCsvField(p.type),
                    escapeCsvField(p.shortDescription),
                    escapeCsvField(v.id),
                    escapeCsvField(v.name),
                    escapeCsvField(v.sku),
                    v.stock ?? '',
                    v.priceUsd ?? '',
                    v.priceZar ?? ''
                ].join(','));
            }
        } else {
            // Product with no variants (rare, but handled)
            csvRows.push([
                escapeCsvField(p.id),
                escapeCsvField(p.name),
                escapeCsvField(p.slug),
                escapeCsvField(p.type),
                escapeCsvField(p.shortDescription),
                '', '', '', '', '', ''
            ].join(','));
        }
    }

    return new Response(csvRows.join('\n'), {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="products_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
    });
}
