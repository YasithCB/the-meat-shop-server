import { pool } from "../db.js";

export const getAll = async () => {
    const [rows] = await pool.execute(`
            SELECT *
            FROM products
            ORDER BY id DESC
        `);

    return rows;
};