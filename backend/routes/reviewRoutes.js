// This is the complete code for backend/routes/reviewRoutes.js
const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware'); // For submitting reviews
const router = express.Router();

// --- GET ALL REVIEWS FOR A SPECIFIC PRODUCT ---
// Endpoint: GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        // Join with the Users table to get the reviewer's name
        const sql = `
            SELECT r.rating, r.review_text, r.created_at, u.name AS user_name
            FROM Reviews r
            JOIN Users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC;
        `;
        const [reviews] = await db.query(sql, [productId]);
        res.json(reviews);
    } catch (err) {
        console.error('Fetch reviews error:', err);
        res.status(500).json({ message: 'Server error fetching reviews.' });
    }
});

// --- SUBMIT A NEW REVIEW ---
// Endpoint: POST /api/reviews/:productId
// This is a protected route, only logged-in users can submit a review.
router.post('/:productId', authMiddleware, async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, review_text } = req.body;
        const userId = req.user.id; // Get user ID from the token

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'A rating between 1 and 5 is required.' });
        }

        // Optional: Check if the user has already reviewed this product
        const [existingReview] = await db.query('SELECT id FROM Reviews WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (existingReview.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }

        const sql = 'INSERT INTO Reviews (product_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)';
        await db.query(sql, [productId, userId, rating, review_text]);

        res.status(201).json({ message: 'Thank you for your review!' });

    } catch (err) {
        console.error('Submit review error:', err);
        res.status(500).json({ message: 'Server error submitting review.' });
    }
});

module.exports = router;