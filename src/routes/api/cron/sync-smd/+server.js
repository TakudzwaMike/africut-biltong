import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { SmdService } from '$lib/server/services/SmdService';

export const GET = async ({ request }) => {
    // 1. Authorization header check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const smdService = new SmdService();
        const stats = await smdService.syncCatalog();

        return json({
            success: true,
            message: `Successfully synchronized catalog from SMD Technologies.`,
            stats
        }, { status: 200 });
    } catch (error) {
        console.error('[CRON SMD SYNC] Synchronization failed:', error);
        return json({
            success: false,
            message: 'SMD catalog sync failed.',
            error: error.message
        }, { status: 500 });
    }
};
