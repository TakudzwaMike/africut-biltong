import { db } from '$lib/server/db';
import { gatedDocumentLead, document } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { documentId, email } = await request.json();

	// Basic validation
	if (!documentId || !email || typeof email !== 'string') {
		return json({ message: 'Invalid request. Document ID and email are required.' }, { status: 400 });
	}

	try {
		// 1. Verify the document exists and is actually gated
		const doc = await db.query.document.findFirst({
			where: and(eq(document.id, documentId), eq(document.isGated, true)),
			columns: {
				fileUrl: true
			}
		});

		if (!doc) {
			return json({ message: 'Document not found or is not gated.' }, { status: 404 });
		}

		// 2. Save the lead to the database
		await db.insert(gatedDocumentLead).values({
			documentId,
			email
		});

		// 3. Return the file URL upon success
		return json({ fileUrl: doc.fileUrl }, { status: 200 });
	} catch (error) {
		console.error('Error processing gated document lead:', error);
		return json({ message: 'A server error occurred. Please try again later.' }, { status: 500 });
	}
}