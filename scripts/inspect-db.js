import 'dotenv/config';
import postgres from 'postgres';

// Helper to print schema
async function printSchema(name, connectionString) {
    console.log(`\n🔍 INSPECTING: ${name} DATABASE...`);
    console.log('='.repeat(50));

    if (!connectionString) {
        console.error(`❌ Missing connection string for ${name}`);
        return;
    }

    const sql = postgres(connectionString);

    try {
        // Get all tables
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;

        if (tables.length === 0) {
            console.log("No tables found in 'public' schema.");
        }

        for (const t of tables) {
            console.log(`\n📋 TABLE: ${t.table_name}`);
            
            // Get columns for this table
            const columns = await sql`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = ${t.table_name}
                ORDER BY ordinal_position;
            `;

            console.table(columns.map(c => ({
                Column: c.column_name,
                Type: c.data_type,
                Nullable: c.is_nullable
            })));
        }

    } catch (err) {
        console.error(`Error inspecting ${name}:`, err.message);
    } finally {
        await sql.end();
    }
}

async function main() {
    // 1. Inspect Website/CMS DB
    await printSchema('LIVE (CMS)', process.env.LIVE_DATABASE_URL);

    // 2. Inspect Store DB
    await printSchema('STORE (Commerce)', process.env.STORE_DATABASE_URL);
}

main();
