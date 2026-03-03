import 'dotenv/config';
import { AuthService } from '../../src/lib/server/services/AuthService.js';
import { UserRepository } from '../../src/lib/server/repositories/UserRepository.js';
import { client } from '../../src/lib/server/db/index.js';

const authService = new AuthService();
const userRepo = new UserRepository();

async function main() {
    console.log('🌱 Seeding specific test roles...');
    try {
        const roles = [
            { email: 'manager@vision-ai.tech', role: 'store_manager', firstName: 'Store', lastName: 'Manager' },
            { email: 'editor@vision-ai.tech', role: 'content_editor', firstName: 'Content', lastName: 'Editor' }
        ];

        for (const r of roles) {
            const existing = await userRepo.findByEmail(r.email);
            if (!existing) {
                const result = await authService.register({
                    email: r.email,
                    password: 'password123',
                    firstName: r.firstName,
                    lastName: r.lastName
                });
                const userId = result.session?.userId || result.user?.id;
                await userRepo.updateRole(userId, r.role);
                console.log(`✅ Created ${r.role} at ${r.email}`);
            } else {
                // Ensure role is correct even if user existed
                await userRepo.updateRole(existing.id, r.role);
                console.log(`ℹ️  Updated existing ${r.email} to ${r.role}`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
        process.exit(0);
    }
}

main();
