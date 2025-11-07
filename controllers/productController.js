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
