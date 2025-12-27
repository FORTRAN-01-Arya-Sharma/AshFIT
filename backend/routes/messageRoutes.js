// This is the complete code for backend/routes/messageRoutes.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Endpoint: POST /api/messages/contact
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Insert the message into the new 'Messages' table
        const sql = 'INSERT INTO Messages (name, email, message) VALUES (?, ?, ?)';
        await db.query(sql, [name, email, message]);

        res.status(201).json({ message: 'Thank you for your message! We will get back to you shortly.' });

    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;