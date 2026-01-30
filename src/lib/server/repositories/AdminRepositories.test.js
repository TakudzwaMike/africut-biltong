import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { UserRepository } from './UserRepository';
import { SettingsRepository } from './SettingsRepository';
import { PageContentRepository } from './PageContentRepository';
import { db, client } from '$lib/server/db';
import { userTable, siteSettings, pageContent, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

describe('Admin Repositories Integration Tests', () => {
    // Teardown to prevent hanging
    afterAll(async () => {
        await client.end();
    });

    // --- UserRepository Tests ---
    describe('UserRepository', () => {
        const userRepo = new UserRepository();
        let testUserId;

        it('should create and delete a user (via direct DB for setup)', async () => {
            // Setup: Create a user directly
            const [createdUser] = await db.insert(userTable).values({
                id: 'test-user-' + Date.now(), // specific ID
                email: 'testrepo@vision-ai.tech',
                firstName: 'Test',
                lastName: 'Repo',
                passwordHash: 'hashed',
                role: 'customer'
            }).returning();
            testUserId = createdUser.id;

            expect(testUserId).toBeDefined();

            // Test: findMany
            const result = await userRepo.findMany({ query: 'testrepo' });
            expect(result.users.length).toBeGreaterThan(0);
            expect(result.users[0].email).toBe('testrepo@vision-ai.tech');

            // Test: updateRole
            await userRepo.updateRole(testUserId, 'store_manager');
            const [updatedUser] = await db.select().from(userTable).where(eq(userTable.id, testUserId));
            expect(updatedUser.role).toBe('store_manager');

            // Test: delete
            await userRepo.delete(testUserId);
            const [deletedUser] = await db.select().from(userTable).where(eq(userTable.id, testUserId));
            expect(deletedUser).toBeUndefined();
        });
    });

    // --- SettingsRepository Tests ---
    describe('SettingsRepository', () => {
        const settingsRepo = new SettingsRepository();

        it('should update and retrieve settings', async () => {
            const key = 'test_setting_key';
            const value = 'test_value_' + Date.now();

            // Update individual
            await settingsRepo.updateSetting(key, value);

            // Get all
            const settings = await settingsRepo.getSettings();
            expect(settings[key]).toBe(value);

            // Batch update
            const batch = {
                'batch_key_1': 'val1',
                'batch_key_2': 'val2'
            };
            await settingsRepo.updateBatch(batch);

            const updatedSettings = await settingsRepo.getSettings();
            expect(updatedSettings['batch_key_1']).toBe('val1');
            expect(updatedSettings['batch_key_2']).toBe('val2');

            // Cleanup
            await db.delete(siteSettings).where(eq(siteSettings.key, key));
            await db.delete(siteSettings).where(eq(siteSettings.key, 'batch_key_1'));
            await db.delete(siteSettings).where(eq(siteSettings.key, 'batch_key_2'));
        });
    });

    // --- PageContentRepository Tests ---
    describe('PageContentRepository', () => {
        const pageRepo = new PageContentRepository();
        let sectionId;

        it('should update page content', async () => {
            // Create a dummy section manually since provisionSections is gone
            const [createdSection] = await db.insert(pageContent).values({
                page: 'home',
                section: 'test-section-' + Date.now(),
                title: 'Original Title',
                content: { text: 'foo' }
            }).returning();

            const sections = await pageRepo.findAll();
            expect(sections.length).toBeGreaterThan(0);

            sectionId = createdSection.id;

            const newTitle = 'Updated Title ' + Date.now();
            await pageRepo.update(sectionId, { title: newTitle });

            const updatedSection = await pageRepo.findById(sectionId);
            expect(updatedSection.title).toBe(newTitle);

            // Cleanup
            await db.delete(pageContent).where(eq(pageContent.id, sectionId));
        });
    });
});
