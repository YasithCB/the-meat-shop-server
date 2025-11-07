import {pool} from "../db.js";

// Get all reviews with product info
export const getAll = async () => {
    const [rows] = await pool.execute(`
        SELECT r.*, p.name AS product_name
        FROM reviews r
                 LEFT JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
    `);
    return rows;
};

// Get review by ID
export const getById = async (id) => {
    const [rows] = await pool.execute(`SELECT * FROM reviews WHERE id = ?`, [id]);
    return rows[0] || null;
};

export const getByProductId = async (product_id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC`,
        [product_id]
    );
    return rows;
};

// Add a review
export const create = async ({ product_id, user_name, rating, comment }) => {
    const [result] = await pool.execute(
        `INSERT INTO reviews (product_id, user_name, rating, comment)
         VALUES (?, ?, ?, ?)`,
        [product_id, user_name, rating, comment]
    );
    return result.insertId;
};

// Update a review
export const update = async (id, { rating, comment }) => {
    const [result] = await pool.execute(
        `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?`,
        [rating, comment, id]
    );
    return result.affectedRows;
};

// Delete a review
export const remove = async (id) => {
    const [result] = await pool.execute(`DELETE FROM reviews WHERE id = ?`, [id]);
    return result.affectedRows;
};
