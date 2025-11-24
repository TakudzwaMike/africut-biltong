import { db } from '$lib/server/db';
import { trackedLink, linkVisit } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function GET({ params, request }) {
	const { shortCode } = params;

	if (!shortCode) throw redirect(307, '/');

	const link = await db.query.trackedLink.findFirst({
		where: eq(trackedLink.shortCode, shortCode)
	});

	if (!link) throw redirect(307, '/');

	// Fire and forget the analytics logging so the redirect is fast
	logVisit(link.id, request);

	throw redirect(307, link.destinationUrl);
}

async function logVisit(linkId, request) {
    try {
        const uaString = request.headers.get('user-agent') || '';
        const referrer = request.headers.get('referer') || null;
        const ipCountry = request.headers.get('x-vercel-ip-country');

        // Basic Parsing
        let browser = 'Unknown';
        let os = 'Unknown';
        let deviceType = 'desktop';

        // Simple heuristic parsing
        if (/mobile/i.test(uaString)) deviceType = 'mobile';
        if (/like Mac OS X/.test(uaString)) {
            os = 'iOS';
            deviceType = 'mobile';
        } else if (/Android/.test(uaString)) {
            os = 'Android';
            deviceType = 'mobile';
        } else if (/Mac OS X/.test(uaString)) os = 'macOS';
        else if (/Windows/.test(uaString)) os = 'Windows';
        else if (/Linux/.test(uaString)) os = 'Linux';

        if (/Edg/.test(uaString)) browser = 'Edge';
        else if (/Chrome/.test(uaString)) browser = 'Chrome';
        else if (/Firefox/.test(uaString)) browser = 'Firefox';
        else if (/Safari/.test(uaString)) browser = 'Safari';
        
        // Social App Detection (Important for campaign tracking)
        if (/LinkedIn/.test(uaString)) browser = 'LinkedIn App';
        if (/FBAN|FBAV/.test(uaString)) browser = 'Facebook App';
        if (/Twitter/.test(uaString)) browser = 'Twitter App';

        await db.insert(linkVisit).values({
            linkId,
            ipCountry,
            browser,
            os,
            deviceType,
            referrer
        });
    } catch (err) {
        console.error('Failed to log link visit:', err);
    }
}