import { pool } from "../db.js";
import { success, error } from "../helpers/response.js";

export const getAll = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT *
            FROM suppliers
            ORDER BY id DESC
        `);

        // Return a well-formatted response
        return success(res, rows, "Suppliers fetched successfully");
    } catch (err) {
        console.error("Error fetching suppliers:", err);
        return error(res, err.message);
    }
};
