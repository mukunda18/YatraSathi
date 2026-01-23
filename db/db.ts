import { pool } from "./index";

export interface user {
    id: string;
    name: string;
    email: string;
    passwordhash: string;
    phone: string;
    avg_rating: number;
    created_at: Date;
}

export interface driver {
    id: string;
    user_id: string;
    vehicle_number: string;
    vehicle_type: string;
    license_number: string;
    avg_rating: number;
    created_at: Date;
}

export type TableName = "users" | "drivers";

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            passwordhash TEXT NOT NULL,
            phone TEXT NOT NULL,
            avg_rating NUMERIC DEFAULT 5.0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const driversTable = `
        CREATE TABLE IF NOT EXISTS drivers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            vehicle_number TEXT NOT NULL UNIQUE,
            vehicle_type TEXT NOT NULL,
            license_number TEXT NOT NULL UNIQUE,
            avg_rating NUMERIC DEFAULT 5.0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await query(usersTable);
        console.log("Users table initialized");
        await query(driversTable);
        console.log("Drivers table initialized");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

export const addRow = async <T>(tableName: TableName, data: Partial<T>): Promise<T | undefined> => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) throw new Error("Data cannot be empty.");

    const columns = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *;`;

    try {
        const res = await query(sql, values);
        return res.rows[0];
    } catch (error) {
        console.error(`Error adding row to ${tableName}:`, error);
        return;
    }
};

export const getRow = async <T>(tableName: TableName, selectors: Partial<T>): Promise<T | undefined> => {
    const keys = Object.keys(selectors);
    const values = Object.values(selectors);

    if (keys.length === 0) throw new Error("Selectors cannot be empty.");

    const where = keys.map((key, i) => `${key} = $${i + 1}`).join(" AND ");
    const sql = `SELECT * FROM ${tableName} WHERE ${where} LIMIT 1;`;

    try {
        const res = await query(sql, values);
        return res.rows[0];
    } catch (error) {
        console.error(`Error getting row from ${tableName}:`, error);
        return;
    }
};

export const deleteRows = async <T>(tableName: TableName, selectors: Partial<T>): Promise<boolean> => {
    const keys = Object.keys(selectors);
    const values = Object.values(selectors);

    if (keys.length === 0) throw new Error("Selectors cannot be empty.");

    const where = keys.map((key, i) => `${key} = $${i + 1}`).join(" AND ");
    const sql = `DELETE FROM ${tableName} WHERE ${where};`;

    try {
        const res = await query(sql, values);
        return (res.rowCount ?? 0) > 0;
    } catch (error) {
        console.error(`Error deleting rows from ${tableName}:`, error);
        return false;
    }
};

export const addUser = (data: Partial<user>) => addRow<user>("users", data);
export const getUser = (selectors: Partial<user>) => getRow<user>("users", selectors);
export const addDriver = (data: Partial<driver>) => addRow<driver>("drivers", data);
export const getDriver = (selectors: Partial<driver>) => getRow<driver>("drivers", selectors);