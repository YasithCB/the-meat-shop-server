import * as Supplier from "../models/supplierModel.js";
import express from "express";

const router = express.Router();

router.get("/", Supplier.getAll);

export default router;
