import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { userTable } from '../src/lib/server/db/schema.js';
import { Argon2id } from 'oslo/password';

function parseArgs() {
	const args = process.argv.slice(2);
	let username = null;
	let newPassword = null;

	// This logic handles cases where `npm run` might add extra arguments
	// It looks for the first two arguments that are not npm flags.
	const relevantArgs = args.filter(arg => !arg.startsWith('--'));
	
	if (relevantArgs.length >= 2) {
		username = relevantArgs[0];
		newPassword = relevantArgs[1];
	}

	return { username, newPassword };
}


async function main() {
	const { username, newPassword } = parseArgs();

	if (!username || !newPassword) {
		console.error('Usage: npm run user:set-password -- <username> <new_password>');
		console.error(`Received arguments: ${process.argv.slice(2).join(' ')}`);
		process.exit(1);
	}

	if (newPassword.length < 6) {
		console.error('Error: Password must be at least 6 characters long.');
		process.exit(1);
	}

	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL is not set in your .env file.');
	}

	const client = postgres(connectionString);
	const db = drizzle(client, { schema: { userTable } });

	try {
		console.log(`Finding user: ${username}...`);
		const user = await db.query.userTable.findFirst({
			where: eq(userTable.username, username)
		});

		if (!user) {
			console.error(`Error: User "${username}" not found.`);
			process.exit(1);
		}

		console.log('Hashing new password...');
		const passwordHash = await new Argon2id().hash(newPassword);

		await db.update(userTable).set({ passwordHash }).where(eq(userTable.id, user.id));

		console.log(`✅ Successfully updated password for user "${username}".`);
	} catch (e) {
		console.error('Failed to update password:', e);
		process.exit(1);
	} finally {
		await client.end();
		console.log('Database connection closed.');
	}
}

main();