import { pool } from "../db.js";
import { success, error } from "../helpers/response.js";

export const getAll = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT s.*,
                   COUNT(p.id) AS product_count
            FROM suppliers s
                     LEFT JOIN products p ON p.supplier_id = s.id
            GROUP BY s.id
            ORDER BY s.id DESC
        `);

        return success(res, rows, "Suppliers fetched successfully");
    } catch (err) {
        console.error("Error fetching suppliers:", err);
        return error(res, err.message);
    }
};


export const getById = async (id) => {
    const [rows] = await pool.execute(`SELECT * FROM suppliers WHERE id = ?`, [id]);
    return rows[0] || null;
};

