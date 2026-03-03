import { redirect } from '@sveltejs/kit';
import { ADMIN_NAV, hasAccess } from '$lib/admin/permissions';

const ADMIN_EMAIL_DOMAIN = 'vision-ai.tech';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Enforce email domain restriction
	const userEmail = locals.user.email || '';
	if (!userEmail.endsWith(`@${ADMIN_EMAIL_DOMAIN}`)) {
		throw redirect(302, '/?error=domain_restricted');
	}

	const userRole = locals.user.role;
	const currentPath = url.pathname;

	// Flatten all nav items and sort by length descending to match most specific route first
	const allRoutes = ADMIN_NAV.flatMap((section) => section.items)
		.sort((a, b) => b.href.length - a.href.length);

	const matchedRoute = allRoutes.find((route) => {
		if (route.href === '/_/admin') {
			return currentPath === '/_/admin'; // Exact match for dashboard
		}
		return currentPath.startsWith(route.href);
	});

	if (matchedRoute && !hasAccess(userRole, matchedRoute.roles)) {
		// User does not have permission for this route
		throw redirect(302, '/_/admin');
	}

	return {
		user: locals.user
	};
}