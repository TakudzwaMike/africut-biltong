import { db } from '$lib/server/db';
import { gatedDocumentLead, document } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { sendDocumentDownloadLink } from '$lib/server/email';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { documentId, email } = await request.json();

	if (!documentId || !email || typeof email !== 'string') {
		return json({ message: 'Invalid request. Document ID and email are required.' }, { status: 400 });
	}

	try {
		const doc = await db.query.document.findFirst({
			where: and(eq(document.id, documentId), eq(document.isGated, true)),
			columns: {
				title: true,
				fileUrl: true
			}
		});

		if (!doc) {
			return json({ message: 'Document not found or is not gated.' }, { status: 404 });
		}

		await db.insert(gatedDocumentLead).values({
			documentId,
			email
		});

		const emailSent = await sendDocumentDownloadLink(email, doc.title, doc.fileUrl);

		if (!emailSent) {
			return json({ message: 'Could not send email. Please verify your address.' }, { status: 500 });
		}

		// 4. Success (Do NOT return fileUrl)
		return json({ 
            success: true,
            message: 'Download link sent to your email inbox.' 
        }, { status: 200 });

	} catch (error) {
		console.error('Error processing gated document lead:', error);
		return json({ message: 'A server error occurred. Please try again later.' }, { status: 500 });
	}
}