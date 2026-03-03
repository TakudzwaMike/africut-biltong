import { AuthService } from '$lib/server/services/AuthService';
import { redirect } from '@sveltejs/kit';

export const POST = async (event) => {
    const authService = new AuthService();

    // We assume the cookie contains the session ID, which the auth module usually extracts.
    // However, the `AuthService.logout` takes a sessionId. 
    // Usually `lucia` validates the session middleware before this.
    // Let's assume we can get it from locals if implemented, or just invalidate cookies.
    // Ideally we want to invalidate the validation server-side too.
    const session = event.locals.session;

    const { blankCookie } = await authService.logout(session ? session.id : null);

    event.cookies.set(blankCookie.name, blankCookie.value, {
        path: '.',
        ...blankCookie.attributes
    });

    throw redirect(303, '/login');
};
