import * as CategoryModel from "../models/categoryModel.js";
import {error, success} from "../helpers/response.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.getAll();

        return success(res, categories, "Categories fetched successfully!");
    } catch (err) {
        console.error("Error fetching categories:", err);
        return error(res, err.message);
    }
};
