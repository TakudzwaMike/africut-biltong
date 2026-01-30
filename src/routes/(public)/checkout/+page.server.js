import { fail, redirect } from '@sveltejs/kit';
import { UserService } from '$lib/server/services/UserService';

const userService = new UserService();

export async function load({ locals }) {
    if (!locals.user) {
        throw redirect(302, '/login?redirectTo=/checkout');
    }

    const addresses = await userService.getAddresses(locals.user.id);

    return {
        user: locals.user,
        addresses
    };
}