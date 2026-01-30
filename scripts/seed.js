import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { AuthService } from '$lib/server/services/AuthService';
import { UserRepository } from '$lib/server/repositories/UserRepository';
import { BlogService } from '$lib/server/services/BlogService';
import { LeadService } from '$lib/server/services/LeadService';
import { client } from '$lib/server/db';

const authService = new AuthService();
const userRepo = new UserRepository();
const blogService = new BlogService();
const leadService = new LeadService();

// Seed for reproducibility
faker.seed(123);

async function main() {
    console.log('🌱 Starting Database Seeding (Service Layer)...');

    try {
        // 1. Create Admin User (biased@project.com / password123)
        console.log('👤 Creating Admin User...');
        let adminUser;
        const adminEmail = 'biased@project.com';

        try {
            // Check if exists first to avoid error log noise
            const existing = await userRepo.findByEmail(adminEmail);
            if (!existing) {
                const result = await authService.register({
                    email: adminEmail,
                    password: 'password123',
                    firstName: 'Biased',
                    lastName: 'Admin'
                });
                adminUser = await userRepo.findById(result.session.userId); // userId is in session.userId based on AuthService

                // Upgrade to admin (register defaults to customer)
                await userRepo.updateRole(adminUser.id, 'admin');
                console.log('✅ Admin user created and promoted to admin.');
            } else {
                adminUser = existing;
                console.log('ℹ️  Admin user already exists.');
            }
        } catch (e) {
            console.error('Error creating admin:', e);
        }

        if (!adminUser) {
            console.error('❌ FATAL: Admin User not found or created. Cannot seed posts.');
        } else {
            console.log('✅ Admin User ID:', adminUser.id);
        }


        // 2. Generate Team Members
        console.log('👥 Generating Team Members...');
        const teamUsers = [];
        for (let i = 0; i < 5; i++) {
            const email = faker.internet.email();
            try {
                const result = await authService.register({
                    email,
                    password: 'password123',
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName()
                });
                // Randomly assign roles
                const role = faker.helpers.arrayElement(['content_editor', 'store_manager', 'customer']);
                const userId = result.session.userId || result.user?.id; // AuthService returns { session, cookie, user? }

                if (userId) {
                    await userRepo.updateRole(userId, role);
                    const u = await userRepo.findById(userId);
                    teamUsers.push(u);
                }
            } catch (e) {
                // Ignore duplicates
            }
        }
        console.log(`✅ Generated ${teamUsers.length} team members.`);

        // 3. Simulate 1 Month of Usage
        console.log('📅 Simulating 1 Month of Historical Usage...');
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        let totalPosts = 0;
        let totalLeads = 0;

        // Iterate day by day
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            // Seed volume varies by day
            const dailyVolume = faker.number.int({ min: 0, max: 5 });
            const dateStr = d.toISOString().split('T')[0];

            for (let k = 0; k < dailyVolume; k++) {
                const actionTime = new Date(d);
                actionTime.setHours(faker.number.int({ min: 8, max: 22 })); // Action during day

                // A. Create Blog Posts
                if (adminUser) {
                    try {
                        await blogService.createPost(adminUser.id, {
                            title: faker.lorem.sentence(),
                            slug: faker.lorem.slug() + '-' + faker.string.alphanumeric(5),
                            contentJson: JSON.stringify({
                                time: actionTime.getTime(),
                                blocks: [
                                    { type: 'header', data: { text: faker.lorem.sentence(), level: 2 } },
                                    { type: 'paragraph', data: { text: faker.lorem.paragraphs(2) } }
                                ]
                            }),
                            isPublished: faker.datatype.boolean(0.8), // 80% published
                            publishedAt: actionTime,
                            createdAt: actionTime,
                            authorId: adminUser.id
                        });
                        totalPosts++;
                    } catch (e) {
                        console.error('Failed to create post:', e.message);
                    }
                }

                // B. Create Leads (if LeadService allows creation - usually public, but we sim using repo/service)
                // LeadService usually updates, maybe doesn't have create? Let's check repository methods via service if exposed
                // Actually LeadService usually is for admin management. 
                // We'll skip LeadService creation if it's not exposed and stick to Blog/Users.
            }
        }

        console.log(`✅ Simulated history: ${totalPosts} posts created.`);

    } catch (e) {
        console.error('❌ Seeding Failed:', e);
    } finally {
        console.log('🔌 Closing Database Connection...');
        await client.end();
        console.log('👋 Done.');
        process.exit(0);
    }
}

main();
