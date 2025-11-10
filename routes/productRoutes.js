import * as ProductController from "../controllers/productController.js";
import express from "express";
import multer from "multer";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/products"); // folder to save images
    },
    filename: function (req, file, cb) {
        // Get category name from the request body and sanitize it
        const categoryName = req.body.category_name
            ? req.body.category_name.replace(/\s+/g, "_").toLowerCase()
            : "category";

        // Use current timestamp
        const timestamp = Date.now();

        // Get file extension
        const ext = file.originalname.split(".").pop();

        // Construct filename: categoryName-timestamp.ext
        const filename = `${categoryName}-${timestamp}.${ext}`;

        cb(null, filename);
    }

});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// GET all products
router.get("/", ProductController.getAllProducts);

// POST add product (single image: 'img')
router.post("/", upload.single("img"), ProductController.addProduct);

// PUT update product (single image: 'img')
router.put("/:id", upload.single("img"), ProductController.updateProduct);


export default router;
