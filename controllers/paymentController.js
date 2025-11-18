import axios from "axios";
import {error, success} from "../helpers/response.js";
import { saveMultipleOrderDetails } from "../models/orderDetailsModel.js";
import * as PaymentModel from "../models/paymentModel.js";

/**
 * Create Tap Hosted Checkout Payment
 * POST /api/payments/create
 */
export const createPayment = async (req, res) => {
    console.log('createPayment req.body');
    console.log(req.body);
    try {
        let token = req.body.token_id;
        let amount = req.body.amount;
        let currency = req.body.currency;
        let customer_name = req.body.customer_name;
        let customer_email = req.body.customer_email;
        let customer_phone = req.body.customer_phone;
        let description = req.body.description;

        if (!token) {
            return error(res, "Missing card source token");
        }

        let orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        let data = {
            amount: amount,
            currency: currency,
            customer_initiated: true,
            threeDSecure: true,
            save_card: false,
            description: description,
            auto: { type: "CAPTURE" },
            metadata: { udf1: "Metadata 1" },
            receipt: { email: false, sms: false },
            reference: { transaction: "txn_01", order: orderId },
            customer: {
                first_name: customer_name,
                middle_name: "",
                last_name: "",
                email: customer_email,
                phone: customer_phone,
            },
            merchant: { id: "67993050" },
            source: { id: token },
            post: { url: "http://localhost:5173/shop/payment-success" },
            redirect: { url: "http://localhost:5173/shop/payment-success" },
        };

        const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://api.tap.company/v2/charges/",
            headers: {
                Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            data: data,
        };

        const response = await axios.request(config);

        // Send structured response like your cart API
        return success(res, response.data, "Payment created successfully");
    } catch (err) {
        console.error(err);
        // Check if Tap returned an error
        if (err.response?.data) {
            return error(res, err.response.data);
        }
        return error(res, err.message);
    }
};

/**
 * Create Tap Hosted Checkout Payment
 * POST /api/payments/create
 */
export const chargePayment = async (req, res) => {
    try {
        const chargeId = req.params.charge_id; // <-- here you get the param
        const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://api.tap.company/v2/charges/" + chargeId,
            headers: {
                Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        };

        const response = await axios.request(config);
        console.log('response chargePayment ::');
        console.log(response);

        // Send structured response like your cart API
        return success(res, response.data, "Payment charged successfully");
    } catch (err) {
        console.error(err);
        // Check if Tap returned an error
        if (err.response?.data) {
            return error(res, err.response.data);
        }
        return error(res, err.message);
    }
};

/**
 * Create Tap Hosted Checkout Payment
 * POST /api/payments/save-payment-details
 */
export const savePaymentDetails = async (req, res) => {
    try {
        const data = req.body;

        if (!data.user_id || !data.amount) {
            return error(res, "Missing required fields: user_id or amount");
        }

        const paymentData = {
            tap_id: data.tap_id || null,
            order_id: data.order_id || null,
            user_id: data.user_id,
            cus_id: data.cus_id,
            customer_name: data.customer_name || '',
            customer_email: data.customer_email || '',
            amount: data.amount,
            currency: data.currency || 'AED',
            description: data.description || '',
            status: data.status || 'INITIATED',
            payment_method: data.payment_method || '',
            response_data: data.response_data ? JSON.stringify(data.response_data) : null
        };

        // 1️⃣ Save payment
        const paymentId = await PaymentModel.createPayment(paymentData);

        // 2️⃣ Save order details if items exist
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            await saveMultipleOrderDetails(paymentId, data.user_id, data.items);
        }

        // 3️⃣ Fetch the full saved payment
        const savedPayment = await PaymentModel.getPaymentByOrderId(paymentId);
        console.log('Payment saved:', savedPayment);

        return success(res, savedPayment, "Payment saved successfully");
    } catch (err) {
        console.error(err);
        return error(res, err.message || "Failed to save payment");
    }
};

export const fetchPaymentByOrderId = async (req, res) => {
    try {
        const { order_id } = req.params;
        const payment = await PaymentModel.getPaymentByOrderId(order_id);

        if (!payment) {
            return error(res, "Payment not found");
        }

        return success(res, payment, "Payment fetched successfully");
    } catch (err) {
        console.error(err);
        return error(res, err.message || "Failed to fetch payment");
    }
};
