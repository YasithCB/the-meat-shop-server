import { pool } from "../db.js";

/**
 * Save multiple order details at once
 * @param {string|number} payment_id
 * @param {string|number} user_id
 * @param {Array} items - [{ product_id, category_title, quantity, price }]
 */
export const saveMultipleOrderDetails = async (payment_id, user_id, items) => {
    const values = items.map((item) => [
        payment_id,
        user_id,
        item.id,
        item.category_title,
        item.quantity || 1,
        JSON.stringify(item) // <-- store the entire list as JSON string
    ]);

    const [result] = await pool.query(
        `INSERT INTO order_details (payment_id, user_id, product_id, category_title, quantity, product)
         VALUES ?`,
        [values]
    );

    return result.affectedRows;
};


/**
 * Get all order details for a specific user (joined with payment info)
 * @param {string|number} user_id
 */
export const getOrdersByUserId = async (user_id) => {
    const [rows] = await pool.execute(
        `SELECT
             p.id AS payment_id,
             p.tap_id,
             p.order_id,
             p.amount,
             p.status,
             p.currency,
             p.customer_name,
             p.customer_email,
             p.created_at,
             od.id AS order_detail_id,
             od.product_id,
             od.category_title,
             od.quantity,
             od.product
         FROM payments p
                  JOIN order_details od ON od.payment_id = p.id
         WHERE od.user_id = ?
         ORDER BY p.created_at DESC`,
        [user_id]
    );

    // Parse JSON column
    return rows;
};

