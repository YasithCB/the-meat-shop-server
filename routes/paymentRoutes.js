import express from "express";
import {chargePayment, createPayment, savePaymentDetails} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-charge", createPayment);
router.get("/payment-details/:charge_id", chargePayment);
router.post("/save-payment-details", savePaymentDetails);

export default router;
