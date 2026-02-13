import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Validate required environment variables
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Verify database connection on module load
pool.query("SELECT NOW()")
    .then(async () => {
        console.log("Database connection verified");
    })
    .catch((err) => {
        console.error("Failed to verify database connection:", err);
        process.exit(1);
    });

export default pool;
