import { db } from '$lib/server/db';
import { supplier, productSupplier } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('SupplierService');

export class SupplierService {

    async listSuppliers() {
        return db.select().from(supplier);
    }

    async getSupplier(id) {
        return db.query.supplier.findFirst({
            where: eq(supplier.id, id)
        });
    }

    async createSupplier(data) {
        const [newSupplier] = await db.insert(supplier).values(data).returning();
        logger.info(`Created supplier ${newSupplier.id}: ${newSupplier.name}`);
        return newSupplier;
    }

    async updateSupplier(id, data) {
        const [updated] = await db.update(supplier)
            .set(data)
            .where(eq(supplier.id, id))
            .returning();
        return updated;
    }

    async deleteSupplier(id) {
        await db.delete(supplier).where(eq(supplier.id, id));
        logger.info(`Deleted supplier ${id}`);
    }

    /**
     * Link a product variant to a supplier with a raw price
     */
    async setProductSupplier(variantId, supplierId, rawPrice, supplierSku) {
        // Upsert logic for product_supplier
        // Since we don't have a unique constraint on (variantId, supplierId) explicitly in schema generic definition above (drizzle quirks),
        // we'll check existence first or assume new. Ideally schema should have unique index.
        // For now, let's just do a find first.

        const existing = await db.query.productSupplier.findFirst({
            where: (fields, { and, eq }) => and(
                eq(fields.variantId, variantId),
                eq(fields.supplierId, supplierId)
            )
        });

        if (existing) {
            await db.update(productSupplier)
                .set({ rawPrice, supplierSku, updatedAt: new Date() })
                .where(eq(productSupplier.id, existing.id));
        } else {
            await db.insert(productSupplier).values({
                variantId,
                supplierId,
                rawPrice,
                supplierSku
            });
        }
        logger.info(`Updated supplier info for variant ${variantId}`);
    }

    async getSupplierForVariant(variantId) {
        return db.query.productSupplier.findFirst({
            where: eq(productSupplier.variantId, variantId),
            with: {
                supplier: true
            }
        });
    }
}
