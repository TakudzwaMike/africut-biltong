import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const POST = async (event) => {
	if (!event.locals.session) {
		return fail(401);
	}
	await auth.invalidateSession(event.locals.session.id);
	const sessionCookie = auth.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	throw redirect(302, '/login');
};