import { pool } from "../db.js";

export const createPayment = async (data) => {
    const {
        tap_id,
        user_id,
        cus_id,
        amount,
        currency = "AED",
        customer_email = null,
        customer_name = null,
        status = "INITIATED",
        order_id = null,
        description = null,
        payment_method = null,
        response_data = null,
    } = data;

    // 1️⃣ Check if tap_id exists
    if (tap_id) {
        const [existing] = await pool.execute(
            "SELECT id FROM payments WHERE tap_id = ?",
            [tap_id]
        );
        if (existing.length > 0) {
            // tap_id exists, skip insert
            return existing[0].id;
        }
    }

    // 2️⃣ Insert new payment
    const [result] = await pool.execute(
        `INSERT INTO payments
         (tap_id, user_id, cus_id, amount, currency, customer_email, customer_name, status, order_id, description, payment_method, response_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            tap_id,
            user_id,
            cus_id,
            amount,
            currency,
            customer_email,
            customer_name,
            status,
            order_id,
            description,
            payment_method,
            response_data ? JSON.stringify(response_data) : null,
        ]
    );

    return result.insertId;
};


export const updatePaymentStatus = async (tap_id, status, responseData = null) => {
    await pool.execute(
        `UPDATE payments 
     SET status = ?, response_data = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE tap_id = ?`,
        [status, JSON.stringify(responseData), tap_id]
    );
};

export const getPaymentByTapId = async (tap_id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM payments WHERE tap_id = ? LIMIT 1`,
        [tap_id]
    );
    return rows[0] || null;
};


export const getPaymentByOrderId = async (order_id) => {
    const [rows] = await pool.execute(
        "SELECT * FROM payments WHERE order_id = ? LIMIT 1",
        [order_id]
    );
    return rows[0] || null;
};
