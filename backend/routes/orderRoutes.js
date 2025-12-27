const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const setupEmailTransporter = require('../config/email');
const nodemailer = require('nodemailer'); // This is the required import

const router = express.Router();

// --- CREATE ORDER ROUTE ---
// REPLACE the '/create' route in orderRoutes.js with this final version

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { cart, shippingAddress, totalPrice } = req.body;
        const userId = req.user.id;
        const userEmail = req.user.email; 

        if (!cart || !shippingAddress || !totalPrice || !shippingAddress.phoneNumber) {
            return res.status(400).json({ message: 'Missing order information.' });
        }
        
        const { fullName, address, city, zip, phoneNumber } = shippingAddress;

        // 1. Save shipping address
        const addressSql = 'INSERT INTO Shipping_Addresses (user_id, full_name, street_address, city, zip_code, phone_number) VALUES (?, ?, ?, ?, ?, ?)';
        const [addressResult] = await db.query(addressSql, [userId, fullName, address, city, zip, phoneNumber]);
        const newAddressId = addressResult.insertId;

        // 2. Create the order
        const orderSql = 'INSERT INTO Orders (user_id, total_price, shipping_address_id) VALUES (?, ?, ?)';
        const [orderResult] = await db.query(orderSql, [userId, totalPrice, newAddressId]);
        const newOrderId = orderResult.insertId;

        // --- REAL EMAIL LOGIC ---
        // 3. Create a string of order items for the email
        let orderItemsHtml = '';
        for (const item of cart) {
            const [products] = await db.query('SELECT name, price FROM Products WHERE id = ?', [item.id]);
            const product = products[0];
            orderItemsHtml += `<li>${product.name} (Size: ${item.size}, Qty: ${item.quantity}) - $${(product.price * item.quantity).toFixed(2)}</li>`;
        }

        // 4. Setup and send the REAL confirmation email
        const transporter = await setupEmailTransporter();
        const mailOptions = {
            from: `"Ashgrtz Fitness" <${process.env.EMAIL_USER}>`, // Send from your own email address
            to: userEmail, // Send to the user who placed the order
            subject: `Your Ashgrtz Order Confirmation #${newOrderId}`,
            html: `
                <h1>Thank You For Your Order!</h1>
                <p>Hi ${fullName}, your order has been placed successfully.</p>
                <hr>
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #${newOrderId}</p>
                <ul>${orderItemsHtml}</ul>
                <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
                <hr>
                <h3>Shipping To</h3>
                <p>${fullName}<br>${address}<br>${city}, ${zip}</p>
                <hr>
                <p>We'll notify you again once your order has shipped. Thanks for shopping with us!</p>
            `,
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent successfully to ${userEmail}`);

        res.status(201).json({ message: 'Order placed successfully!', orderId: newOrderId });

    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ message: 'Server error during order creation.' });
    }
});

router.get('/myorders', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all orders where the user_id matches the logged-in user
        const sql = `
            SELECT id, total_price, order_status, created_at 
            FROM Orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC;
        `;
        const [orders] = await db.query(sql, [userId]);

        res.json(orders);
    } catch (err) {
        console.error('Fetch my orders error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// --- GET ORDER DETAILS ROUTE ---
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const sql = `
            SELECT o.id AS order_id, o.total_price, o.order_status, o.created_at, sa.full_name, sa.street_address, sa.city, sa.zip_code
            FROM Orders o JOIN Shipping_Addresses sa ON o.shipping_address_id = sa.id
            WHERE o.id = ? AND o.user_id = ?;
        `;
        const [orders] = await db.query(sql, [orderId, userId]);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
        }
        res.json(orders[0]);
    } catch (err) {
        console.error('Fetch order details error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;