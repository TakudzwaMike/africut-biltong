import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('MediaRepository');

const MAX_DISPLAY_WIDTH = 1920;
const MAX_THUMBNAIL_WIDTH = 400;

export class MediaRepository {

    async findAll() {
        return db.query.media.findMany({
            orderBy: desc(media.uploadedAt)
        });
    }

    async findById(id) {
        return db.query.media.findFirst({ where: eq(media.id, id) });
    }

    async uploadFiles(files, locals) {
        if (!files || files.length === 0) return { success: false, message: 'No files provided.' };

        const uploadPromises = files.map(async (file) => {
            if (!(file instanceof File) || file.size === 0) {
                return { status: 'skipped', name: 'empty file' };
            }

            try {
                const buffer = Buffer.from(await file.arrayBuffer());

                // 1. Upload Original
                const originalBlob = await put(file.name, buffer, { access: 'public' });

                // 2. Process Images with Sharp
                const sharpInstance = sharp(buffer);
                const metadata = await sharpInstance.metadata();

                // Generate Display Version (Optimized WebP)
                const displayBuffer = await sharpInstance
                    .clone()
                    .resize({ width: MAX_DISPLAY_WIDTH, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

                // Generate Thumbnail (Small WebP)
                const thumbnailBuffer = await sharpInstance
                    .clone()
                    .resize({ width: MAX_THUMBNAIL_WIDTH, withoutEnlargement: true })
                    .webp({ quality: 60 })
                    .toBuffer();

                // Generate Blurhash / Placeholder (Tiny Base64)
                const blurBuffer = await sharpInstance
                    .clone()
                    .resize(20)
                    .blur(1.5)
                    .webp({ quality: 50 })
                    .toBuffer();
                const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

                // 3. Upload Processed Versions
                const [displayBlob, thumbnailBlob] = await Promise.all([
                    put(`display/${file.name}.webp`, displayBuffer, { access: 'public', contentType: 'image/webp' }),
                    put(`thumb/${file.name}.webp`, thumbnailBuffer, { access: 'public', contentType: 'image/webp' })
                ]);

                // 4. Save to Database
                const altText = file.name.split('.').slice(0, -1).join(' ');
                const [newMedia] = await db
                    .insert(media)
                    .values({
                        altText,
                        originalUrl: originalBlob.url,
                        width: metadata.width || 0,
                        height: metadata.height || 0,
                        displayUrl: displayBlob.url,
                        thumbnailUrl: thumbnailBlob.url,
                        blurDataUrl
                    })
                    .returning();

                // Note: Audit logging is usually a service concern, but for repositories wrapping specific business actions 
                // it is sometimes included. Alternatively, the route or a "MediaService" should handle it.
                // Given the directive to "Decouple Business Logic", data access + processing usually fits in Repo/Service.
                // We'll keep it simple: Repos return data, Caller logs? 
                // The original code logged inside the route. 
                // We will return the new media object so the caller can log if they want, 
                // OR we accept `log` helper dependency. 
                // Let's return the created item.

                logger.info(`Uploaded file: ${file.name}`);

                return { status: 'fulfilled', name: file.name, media: newMedia };

            } catch (error) {
                logger.error(`Upload failed for file: ${file.name}`, error);
                return { status: 'rejected', name: file.name, reason: error.message };
            }
        });

        const results = await Promise.allSettled(uploadPromises);
        return results;
    }

    async delete(id) {
        const mediaToDelete = await this.findById(id);
        if (!mediaToDelete) return false;

        try {
            const deletions = [];
            if (mediaToDelete.originalUrl) deletions.push(del(mediaToDelete.originalUrl));
            if (mediaToDelete.displayUrl && mediaToDelete.displayUrl !== mediaToDelete.originalUrl) deletions.push(del(mediaToDelete.displayUrl));
            if (mediaToDelete.thumbnailUrl && mediaToDelete.thumbnailUrl !== mediaToDelete.originalUrl) deletions.push(del(mediaToDelete.thumbnailUrl));

            await Promise.allSettled(deletions);
            await db.delete(media).where(eq(media.id, id));

            logger.info(`Deleted media: ${id}`);
            return { success: true, media: mediaToDelete };
        } catch (error) {
            logger.error(`Delete failed for media: ${id}`, error);
            throw error;
        }
    }
}
