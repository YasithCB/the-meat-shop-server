import express from "express";
import * as AuthController from "../controllers/authController.js";
import {upload} from "../middlewares/uploads.js";
const router = express.Router();

router.post("/login/:role", AuthController.login);
router.post("/register/:role", upload.single("logo"), AuthController.register);

export default router;
