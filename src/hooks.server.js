import * as auth from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';

const STAFF_ROLES = ['admin', 'store_manager', 'content_editor'];

const handleAuth = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(auth.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const { session, user } = await auth.validateSession(sessionId);
		if (session && session.fresh) {
			const sessionCookie = auth.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, { path: '.', ...sessionCookie.attributes });
		}
		if (!session) {
			const sessionCookie = auth.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, { path: '.', ...sessionCookie.attributes });
		}
		event.locals.user = user;
		event.locals.session = session;
	}

    // --- ADMIN ROUTE PROTECTION ---
    if (event.url.pathname.startsWith('/_/admin')) {
        // 1. Redirect unauthenticated users to the unified /login page
        if (!event.locals.user) {
            // Pass the target URL so we can redirect back after login
            throw redirect(303, `/login?redirectTo=${event.url.pathname}`);
        }

        // 2. Check Permissions
        // If role is missing (undefined), this will now correctly fail instead of crashing
        if (!event.locals.user.role || !STAFF_ROLES.includes(event.locals.user.role)) {
            // Logged in but not staff -> Go Home
            throw redirect(303, '/');
        }
    }

	return resolve(event);
};

export const handle = sequence(handleAuth);