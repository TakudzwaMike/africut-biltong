import { SupplierService } from '$lib/server/services/SupplierService';
import { fail, redirect } from '@sveltejs/kit';

const supplierService = new SupplierService();

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name');
        const contactEmail = data.get('contactEmail');
        const currency = data.get('currency');
        const defaultMarkup = parseInt(data.get('defaultMarkup') || '0');

        if (!name) {
            return fail(400, { missing: true, name });
        }

        await supplierService.createSupplier({
            name,
            contactEmail,
            currency,
            defaultMarkup
        });

        throw redirect(303, '/_/admin/suppliers');
    }
};
