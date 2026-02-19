const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now()
            );
        `);
        console.log("✅ Created table: password_reset_tokens");

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);
        `);
        console.log("✅ Created index: idx_prt_token");

        console.log("\n🎉 Migration complete!");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
