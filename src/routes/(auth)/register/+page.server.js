import { AuthService } from '$lib/server/services/AuthService';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export const actions = {
    default: async (event) => {
        const formData = Object.fromEntries(await event.request.formData());
        const parseResult = registerSchema.safeParse(formData);

        if (!parseResult.success) {
            return fail(400, {
                error: parseResult.error.errors[0].message,
                data: formData
            });
        }

        const authService = new AuthService();

        try {
            const { cookie } = await authService.register(parseResult.data);

            event.cookies.set(cookie.name, cookie.value, {
                path: '.',
                ...cookie.attributes
            });

        } catch (e) {
            if (e.status === 303) throw e;
            console.error('Registration error:', e);
            return fail(400, { error: e.message, data: formData });
        }

        throw redirect(303, '/account');
    }
};
