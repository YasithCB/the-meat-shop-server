import * as ReviewController from "../controllers/reviewController.js";
import express from "express";

const router = express.Router();

router.post("/", ReviewController.addReview);

export default router;
