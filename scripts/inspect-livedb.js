import 'dotenv/config';
import postgres from 'postgres';

const LIVE_DB_URL = process.env.LIVE_DATABASE_URL;

if (!LIVE_DB_URL) {
    console.error('❌ Error: Missing LIVE_DATABASE_URL in .env');
    process.exit(1);
}

const sql = postgres(LIVE_DB_URL);

async function main() {
    console.log('🔍 Connecting to LIVE database to inspect schema...\n');

    try {
        // 1. Get all table names in the public schema
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;

        if (tables.length === 0) {
            console.log('⚠️  No tables found in the public schema.');
            return;
        }

        console.log(`found ${tables.length} tables.\n`);

        for (const table of tables) {
            const tableName = table.table_name;
            
            // 2. Get columns for this table
            const columns = await sql`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = ${tableName}
                ORDER BY ordinal_position;
            `;

            // 3. Get row count (safe way)
            // Note: We have to inject the table name safely or use a raw query for dynamic identifiers
            const [countResult] = await sql`SELECT count(*) as count FROM ${sql(tableName)}`;
            const rowCount = countResult.count;

            console.log(`📦 Table: [${tableName}] (${rowCount} rows)`);
            console.table(columns.map(c => ({
                Column: c.column_name,
                Type: c.data_type,
                Nullable: c.is_nullable
            })));
            console.log('\n---------------------------------------------------\n');
        }

    } catch (e) {
        console.error('❌ Inspection Failed:', e);
    } finally {
        await sql.end();
    }
}

main();