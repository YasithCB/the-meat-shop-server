import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// Then JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Serve uploads
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRoutes);

// Serve Routes
app.use("/products", productRoutes);
app.use("/suppliers", supplierRoutes);

app.get("/", (req, res) => {
    res.send("The Meat Shop Server is online 🚀");
});

// Start server
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
});
