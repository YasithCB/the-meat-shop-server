import * as ReviewModel from "../models/ReviewModel.js";
import { success, error } from "../helpers/response.js";

// Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.getAll();
        return success(res, reviews, "Reviews fetched successfully");
    } catch (err) {
        return error(res, err.message);
    }
};

// Add a review
export const addReview = async (req, res) => {
    try {
        const reviewId = await ReviewModel.create(req.body);
        return success(res, { id: reviewId }, "Review added successfully", 201);
    } catch (err) {
        return error(res, err.message);
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const updated = await ReviewModel.update(req.params.id, req.body);
        return success(res, { updated }, "Review updated successfully");
    } catch (err) {
        return error(res, err.message);
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const deleted = await ReviewModel.remove(req.params.id);
        return success(res, { deleted }, "Review deleted successfully");
    } catch (err) {
        return error(res, err.message);
    }
};
