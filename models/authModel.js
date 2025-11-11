import bcrypt from "bcrypt";
import {pool} from "../db.js";

export const AuthModel = {
    async findCustomerByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM users
             WHERE email = ?`,
            [email]
        );
        return rows[0];
    },

    async findSupplierByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM suppliers
             WHERE email = ?`,
            [email]
        );
        return rows[0];
    },

    async findRiderByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT *
             FROM riders
             WHERE email = ?`,
            [email]
        );
        return rows[0];
    },

    async createCustomer(reqData) {
        // Generate custom ID if needed (optional, MySQL auto_increment handles it)
        const query = `
            INSERT INTO users (name,
                               email,
                               phone,
                               password,
                               created_at,
                               updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // Hash the password before saving (recommended)
        const hashedPassword = await bcrypt.hash(reqData.password, 10);

        const params = [
            reqData.name ?? null,
            reqData.email ?? null,
            reqData.phone ?? null,
            hashedPassword,
            new Date(), // created_at
            new Date()  // updated_at
        ];

        const [result] = await pool.execute(query, params);
        return result;

    },

    async createSupplier(reqData) {
        const query = `
        INSERT INTO suppliers (
            name,
            logo,
            email,
            password,
            phone,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        // Hash the password
        const hashedPassword = await bcrypt.hash(reqData.password, 10);

        const params = [
            reqData.name ?? null,
            reqData.logo ?? null,       // required field
            reqData.email ?? null,
            hashedPassword,
            reqData.phone ?? null,
            new Date(), // created_at
            new Date()  // updated_at
        ];

        const [result] = await pool.execute(query, params);
        return result;
    },

    async createRider(reqData) {
        const query = `
        INSERT INTO riders (
            email,
            password,
            name,
            phone,
            vehicle_info,
            status,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // Hash the password
        const hashedPassword = await bcrypt.hash(reqData.password, 10);

        const params = [
            reqData.email ?? null,
            hashedPassword,
            reqData.name ?? null,
            reqData.phone ?? null,
            reqData.vehicle_info ?? null,
            reqData.status ?? "available",
            new Date(), // created_at
            new Date()  // updated_at
        ];

        const [result] = await pool.execute(query, params);
        return result;
    },

    // PW RESET -----------------------------------------------

    // Save reset code and expiry time
    async saveResetCode(email, code, role) {
        const tables = {
            customer: "users",
            supplier: "suppliers",
            rider: "riders",
        };

        const table = tables[role];
        if (!table) throw new Error("Invalid role");

        await pool.execute(
            `UPDATE ${table} 
             SET reset_code = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE) 
             WHERE email = ?`,
            [code, email]
        );
    },

    // Verify if reset code is valid
    async verifyResetCode(email, code, role) {
        const tables = {
            customer: "users",
            supplier: "suppliers",
            rider: "riders",
        };

        const table = tables[role];
        if (!table) throw new Error("Invalid role");

        const [rows] = await pool.execute(
            `SELECT * FROM ${table} WHERE email = ? AND reset_code = ? AND reset_expires > NOW()`,
            [email, code]
        );

        return rows[0] || null;
    },


    // Update password after verifying code
    async updatePassword(email, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute(
            `UPDATE users 
       SET password = ?, reset_code = NULL, reset_expires = NULL 
       WHERE email = ?`,
            [hashedPassword, email]
        );
    },

};
