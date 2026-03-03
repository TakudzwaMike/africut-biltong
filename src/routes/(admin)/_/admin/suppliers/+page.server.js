import { SupplierService } from '$lib/server/services/SupplierService';

const supplierService = new SupplierService();

export const load = async () => {
    const suppliers = await supplierService.listSuppliers();
    return { suppliers };
};
