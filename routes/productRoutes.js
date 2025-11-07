import * as ProductController from "../controllers/productController.js";
import express from "express";

const router = express.Router();

router.get("/", ProductController.getAllProducts);

export default router;
