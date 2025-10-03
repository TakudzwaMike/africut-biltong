// src/routes/api/upload/+server.js

import { handleUpload } from '@vercel/blob';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	// 1. Check for authentication
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();

	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
				// 2. Add security checks before generating the token
				return {
					// You can limit uploads to specific file types
					allowedContentTypes: [
						'application/pdf',
						'application/msword',
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
						'image/jpeg',
						'image/png',
						'image/webp'
					],
					// Optional: Add metadata to the token
					tokenPayload: JSON.stringify({
						userId: locals.user.id
					})
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				// 3. This callback runs after the client finishes uploading the file to Vercel Blob.
				// We can use it for logging, but we won't save to the DB here.
				// The client will do that in the final form submission.
				console.log('Blob upload completed!', blob, tokenPayload);
			}
		});

		return json(jsonResponse);
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
