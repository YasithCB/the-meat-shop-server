import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthModel } from "../models/authModel.js";
import {error, success} from "../helpers/response.js";
import nodemailer from "nodemailer";
import {capitalizeFirstLetter} from "../utils/util.js";

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

// Generate 6-digit OTP
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Step 1: Send reset code
export const sendResetCode = async (req, res) => {
    const role = req.params.role;
    const { email } = req.body;

    try {
        let user;
        if (role === "customer") {
            user = await AuthModel.findCustomerByEmail(email);
        }else if (role === "supplier") {
            user = await AuthModel.findSupplierByEmail(email);
        }else if (role === "rider") {
            user = await AuthModel.findRiderByEmail(email);
        }

        if (!user) return res.status(404).json({ message: `${capitalizeFirstLetter(role)} not found` });

        const code = generateCode();
        await AuthModel.saveResetCode(email, code, role);

        // send mail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAILJS_MY_EMAIL, pass: process.env.EMAILJS_MY_EMAIL_PW },
        });

        await transporter.sendMail({
            from: `"Support Team" <${process.env.EMAILJS_MY_EMAIL}>`,
            to: email,
            subject: "🔐 Reset Your Password – Code Inside",
            html: `
                <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f7f8fa; padding: 40px 0;">
                  <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.05);">
                    
                    <div style="background-color: #EB0029; padding: 24px; text-align: center;">
                      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Password Reset Request</h1>
                    </div>
            
                    <div style="padding: 32px; color: #333333;">
                      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                        Hello,
                      </p>
                      <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        We received a request to reset your password. Use the following verification code to continue:
                      </p>
            
                      <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background-color: #f4f5f7; color: #111; font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 18px 28px; border-radius: 8px; border: 1px solid #ddd;">
                          ${code}
                        </div>
                      </div>
            
                      <p style="font-size: 15px; line-height: 1.6; color: #555;">
                        This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email — your account is safe.
                      </p>
            
                      <div style="margin-top: 30px; text-align: center;">
                        <a href="#" style="display: inline-block; background-color: #EB0029; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                          Reset Password
                        </a>
                      </div>
                    </div>
            
                    <div style="background-color: #f4f5f7; padding: 16px; text-align: center; font-size: 13px; color: #777;">
                      <p style="margin: 0;">If you have any questions, contact us at 
                        <a href="mailto:${process.env.EMAILJS_MY_EMAIL}" style="color: #EB0029; text-decoration: none;">${process.env.EMAILJS_MY_EMAIL}</a>.
                      </p>
                      <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} The Meat Shop. All rights reserved.</p>
                    </div>
            
                  </div>
                </div>
              `,
        });


        res.json({ message: "Reset code sent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Step 2: Reset password
export const resetPassword = async (req, res) => {
    const role = req.params.role;
    const { email, code, newPassword } = req.body;

    try {
        const validUser = await AuthModel.verifyResetCode(email, code, role);
        if (!validUser)
            return res.status(400).json({ message: "Invalid or expired code" });

        await AuthModel.updatePassword(email, newPassword, role);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};