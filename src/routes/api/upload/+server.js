import { handleUpload } from '@vercel/blob/client';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const body = await request.json();

	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
				// This callback is called before a token is generated.
				// It can be used to authorize the user and check if they have permission to upload.
				return {
					allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
					tokenPayload: JSON.stringify({
						// optional, sent to your server on upload completion
						// you could pass a user id from cookies or a session here
					})
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				// This callback is called after the upload is completed.
				// Use this to update your database with the new blob URL.
				console.log('Blob upload completed', blob, tokenPayload);
			}
		});

		return json(jsonResponse);
	} catch (error) {
		return json(
			{ error: (error).message },
			{ status: 400 } // The webhook will request status 400 for bad requests
		);
	}
}