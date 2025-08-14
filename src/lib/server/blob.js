import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import crypto from 'crypto';

/**
 * Uploads a file buffer to Vercel Blob.
 * @param {Buffer} buffer The file content as a buffer.
 * @param {string} originalName The original filename.
 * @param {string} contentType The MIME type of the file.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
export async function uploadFile(buffer, originalName, contentType) {
	const hash = crypto.createHash('md5').update(buffer).digest('hex');
	const pathname = `${hash}-${originalName}`;

	const blob = await put(pathname, buffer, {
		access: 'public',
		contentType,
		token: BLOB_READ_WRITE_TOKEN
	});

	return blob.url;
}