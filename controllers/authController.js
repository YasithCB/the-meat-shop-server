import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthModel } from "../models/authModel.js";
import {error, success} from "../helpers/response.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "7d";

// Register
export const register = async (req, res) => {
    try {
        const role = req.params.role;

        const reqData = {
            ...req.body,
            logo: req.file ? req.file.path : null,
        };

        let result;
        if (role === "customer") {
            result = await AuthModel.createCustomer(reqData);
        }else if (role === "supplier") {
            result = await AuthModel.createSupplier(reqData);
        }else if (role === "rider") {
            result = await AuthModel.createRider(reqData);
        }

        return success(res, result, `${role} created successfully`, 201);
    } catch (err) {
        console.error(err);
        return error(res, err.message);
    }
};

// Login
export const login = async (req, res) => {
    try {
        const role = req.params.role;
        const { email, password } = req.body;

        let user;
        if (role === "customer") {
            user = await AuthModel.findCustomerByEmail(email);
        }else if (role === "supplier") {
            user = await AuthModel.findSupplierByEmail(email);
        }else if (role === "rider") {
            user = await AuthModel.findRiderByEmail(email);
        }

        if (!user) return error(res, `${role} not found`, 401);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return error(res, "Invalid password", 401);

        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        return success(res, { token, user }, "Login successful");
    } catch (err) {
        return error(res, err.message);
    }
};

const generateHash = async (password) => {
    try {
        const saltRounds = 10; // default
        return await bcrypt.hash(password, saltRounds);
    } catch (err) {
        console.error("Error hashing password:", err);
    }
};