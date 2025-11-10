import * as ProductModel from "../models/productModel.js";
import {error, success} from "../helpers/response.js";
import * as SupplierModel from "../models/supplierModel.js";
import * as ReviewModel from "../models/reviewModel.js";

export const getAllProducts = async (req, res) => {
    try {
        // Fetch all products
        const products = await ProductModel.getAll();

        // For each product, fetch supplier and reviews
        const productsWithDetails = await Promise.all(
            products.map(async (product) => {
                // Fetch supplier
                const supplier = await SupplierModel.getById(product.supplier_id);

                // Fetch reviews for this product
                const reviews = await ReviewModel.getByProductId(product.id);

                return {
                    ...product,
                    supplier: supplier || null,
                    reviews: reviews || [],
                };
            })
        );

        return success(res, productsWithDetails, "Products fetched with supplier and reviews");
    } catch (err) {
        console.error("Error fetching products with details:", err);
        return error(res, err.message);
    }
};

/**
 * Add a new product
 * Expects FormData with fields:
 * category_id, category_name, name, subtitle, description, price, stock
 * and file: img
 */
export const addProduct = async (req, res) => {
    try {
        const {
            category_id,
            category_name,
            name,
            subtitle,
            description,
            price,
            stock,
            supplier_id
        } = req.body;

        // Validate required fields
        if (!category_id || !category_name || !name || !price || !stock) {
            return error(res, "Missing required fields");
        }

        // Image path
        const img = req.file ? `/uploads/products/${req.file.filename}` : null;

        // For now, set iconImg same as img
        const iconImg = img;

        // Create product object
        const productData = {
            category_id,
            category_name,
            name,
            subtitle: subtitle || "",
            description: description || "",
            price,
            stock,
            supplier_id: supplier_id || null,
            img,
            iconImg
        };

        // Add product to database
        const insertId = await ProductModel.add(productData);

        return success(res, { id: insertId }, "Product added successfully");
    } catch (err) {
        console.error("Error adding product:", err);
        return error(res, "Failed to add product");
    }
};

/**
 * Update an existing product
 * Expects product ID in req.params.id
 * Optional FormData fields: category_id, category_name, name, subtitle, description, price, stock
 * Optional file: img
 */
export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Fetch existing product
        const existingProduct = await ProductModel.getById(productId);
        if (!existingProduct) {
            return error(res, "Product not found");
        }

        // Prepare updated data, only overwrite if value provided
        const updatedData = {
            category_id: req.body.category_id || existingProduct.category_id,
            category_name: req.body.category_name || existingProduct.category_name,
            name: req.body.name || existingProduct.name,
            subtitle: req.body.subtitle !== undefined ? req.body.subtitle : existingProduct.subtitle,
            description: req.body.description !== undefined ? req.body.description : existingProduct.description,
            price: req.body.price || existingProduct.price,
            stock: req.body.stock || existingProduct.stock,
            supplier_id: req.body.supplier_id || existingProduct.supplier_id,
            img: req.file ? `/uploads/products/${req.file.filename}` : existingProduct.img,
            iconImg: req.file ? `/uploads/products/${req.file.filename}` : existingProduct.iconImg,
        };

        const successUpdate = await ProductModel.update(productId, updatedData);

        if (successUpdate) {
            return success(res, { id: productId }, "Product updated successfully");
        } else {
            return error(res, "Failed to update product");
        }
    } catch (err) {
        console.error("Error updating product:", err);
        return error(res, "Failed to update product");
    }
};

