import * as CategoryController from "../controllers/categoryController.js";
import express from "express";

const router = express.Router();

router.get("/", CategoryController.getAllCategories);

export default router;
