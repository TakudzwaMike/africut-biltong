import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js'; // FIX 1: Added .js extension
import { env } from '$env/dynamic/private';

// FIX 2: Use process.env as a fallback for the database URL.
// This makes the file compatible with both SvelteKit (which uses `env`)
// and standalone scripts like our seeder (which uses `process.env` via dotenv).
const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not set');
}

export const client = postgres(connectionString);

export const db = drizzle(client, { schema });