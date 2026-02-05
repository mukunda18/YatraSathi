import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default pool;
