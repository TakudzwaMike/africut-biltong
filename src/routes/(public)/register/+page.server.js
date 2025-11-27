import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

        const { email, password, firstName, lastName } = parseResult.data;

		const existingUser = await db.query.userTable.findFirst({
            where: eq(userTable.email, email)
        });

		if (existingUser) {
			return fail(400, { error: 'Account already exists.', data: formData });
		}

		try {
			const userId = generateId(15);
			const hashedPassword = await auth.hashPassword(password);

			await db.insert(userTable).values({
				id: userId,
				email,
                firstName,
                lastName,
				passwordHash: hashedPassword,
				role: 'customer',
                status: 'active'
			});

			const session = await auth.createSession(userId);
			const sessionCookie = auth.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

		} catch (e) {
			console.error('Registration error:', e);
			return fail(500, { error: 'Server error during registration.' });
		}

		throw redirect(303, '/account');
	}
};