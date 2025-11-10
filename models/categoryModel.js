import {pool} from "../db.js";

export const getAll = async () => {
    const [rows] = await pool.execute(`
        SELECT *
        FROM categories
        ORDER BY id
    `);

    // Convert subcategories from JSON string → real array
    return rows.map((row) => {
        if (typeof row.subcategories === "string") {
            try {
                row.subcategories = JSON.parse(row.subcategories);
            } catch {
                row.subcategories = []; // fallback if invalid JSON
            }
        }
        return row;
    });
};
