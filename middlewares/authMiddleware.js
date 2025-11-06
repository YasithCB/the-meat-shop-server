import jwt from "jsonwebtoken";
import {error} from "../helpers/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return error(res, "Authorization header missing", 401);

    const token = authHeader.split(" ")[1];
    if (!token) return error(res, "Token missing", 401);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return error(res, "Invalid token", 401);
    }
};
