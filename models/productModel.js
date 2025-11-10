import { pool } from "../db.js";

/**
 * Get all products
 */
export const getAll = async () => {
    const [rows] = await pool.execute(`
        SELECT *
        FROM products
        ORDER BY id
    `);
    return rows;
};

/**
 * Get product by ID
 * @param {number} id
 */
export const getById = async (id) => {
    const [rows] = await pool.execute(`
    SELECT *
    FROM products
    WHERE id = ?
  `, [id]);
    return rows[0] || null;
};

/**
 * Add a new product
 * @param {object} product
 */
export const add = async (product) => {
    const { category_id, category_name, name, subtitle, description, price, stock, supplier_id, img, iconImg } = product;

    const [result] = await pool.execute(`
    INSERT INTO products 
      (category_id, category_name, name, subtitle, description, price, stock, supplier_id, img)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [category_id, category_name, name, subtitle, description, price, stock, supplier_id || null, img]);

    return result.insertId;
};

/**
 * Update a product
 * @param {number} id
 * @param {object} product
 */
export const update = async (id, product) => {
    const { category_id, category_name, name, subtitle, description, price, stock, supplier_id, img } = product;

    const [result] = await pool.execute(`
    UPDATE products
    SET category_id = ?, category_name = ?, name = ?, subtitle = ?, description = ?, price = ?, stock = ?, supplier_id = ?, img = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [category_id, category_name, name, subtitle, description, price, stock, supplier_id || null, img, id]);

    return result.affectedRows > 0;
};

/**
 * Delete a product
 * @param {number} id
 */
export const deleteById = async (id) => {
    const [result] = await pool.execute(`
    DELETE FROM products
    WHERE id = ?
  `, [id]);
    return result.affectedRows > 0;
};
