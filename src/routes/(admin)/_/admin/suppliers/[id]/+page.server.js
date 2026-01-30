import { SupplierService } from '$lib/server/services/SupplierService';
import { fail, redirect } from '@sveltejs/kit';

const supplierService = new SupplierService();

export const load = async ({ params }) => {
    const supplier = await supplierService.getSupplier(parseInt(params.id));
    if (!supplier) {
        throw error(404, 'Supplier not found');
    }
    return { supplier };
};

export const actions = {
    update: async ({ request, params }) => {
        const data = await request.formData();
        const name = data.get('name');
        const contactEmail = data.get('contactEmail');
        const currency = data.get('currency');
        const defaultMarkup = parseInt(data.get('defaultMarkup') || '0');

        await supplierService.updateSupplier(parseInt(params.id), {
            name,
            contactEmail,
            currency,
            defaultMarkup
        });

        // Stay on page to show success state or redirect list? Redirect usually better UX
        throw redirect(303, '/_/admin/suppliers');
    },
    delete: async ({ params }) => {
        await supplierService.deleteSupplier(parseInt(params.id));
        throw redirect(303, '/_/admin/suppliers');
    }
};
