import * as Product from "../models/productModel.js";
import express from "express";

const router = express.Router();

router.get("/", Product.getAll);

export default router;
