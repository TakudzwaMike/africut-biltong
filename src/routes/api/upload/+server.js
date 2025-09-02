import { handleUpload } from '@vercel/blob/client';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

export async function POST({ request, url }) {
	const body = await request.json();

	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname, clientPayload) => {
				return {
					allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
					tokenPayload: JSON.stringify({
						// Pass the altText from the client to the completion callback
						altText: JSON.parse(clientPayload || '{}').altText || pathname
					})
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				console.log('Blob upload completed, starting processing...', blob.url);
				const { altText } = JSON.parse(tokenPayload);

				// Don't run the processor during the build process
				if (building) return;
				
				// Trigger the processing endpoint asynchronously. We don't need to wait for it.
				// We use the full URL because this might be called from a different Vercel region.
				const processUrl = new URL('/api/process-image', url.origin);
				fetch(processUrl.toString(), {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
						authorization: `Bearer ${env.IMAGE_PROCESSING_SECRET}`
					},
					body: JSON.stringify({
						originalUrl: blob.url,
						altText: altText
					})
				}).catch((error) => {
					console.error('Failed to trigger image processing:', error);
				});
			}
		});

		return json(jsonResponse);
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}