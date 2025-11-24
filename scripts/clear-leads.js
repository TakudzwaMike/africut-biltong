import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
	console.log('🗑️  Clearing all leads...');
	await db.delete(schema.lead);
	console.log('✅ All leads have been permanently deleted.');
	process.exit(0);
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});