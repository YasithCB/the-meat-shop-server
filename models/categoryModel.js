import { pool } from "../db.js";

export const getAll = async () => {
    const [rows] = await pool.execute(`
            SELECT *
            FROM categories
            ORDER BY id 
        `);

    return rows;
};