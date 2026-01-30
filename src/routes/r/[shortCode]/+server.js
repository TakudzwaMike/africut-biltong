import { TrackedLinkService } from '$lib/server/services/TrackedLinkService';
import { redirect } from '@sveltejs/kit';

export async function GET({ params, request }) {
    const { shortCode } = params;

    if (!shortCode) throw redirect(307, '/');

    const service = new TrackedLinkService();
    // Pass headers for parsing
    const destinationUrl = await service.processRedirect(shortCode, request.headers);

    if (!destinationUrl) throw redirect(307, '/');

    throw redirect(307, destinationUrl);
}