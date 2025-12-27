const express = require("express");
const db = require("../config/db");
const adminMiddleware = require("../middleware/adminMiddleware"); // Import our new middleware
const router = express.Router();

// --- PRODUCT MANAGEMENT (CRUD) ---

// CREATE a new product
// Endpoint: POST /api/admin/products
router.post("/products", adminMiddleware, async (req, res) => {
  try {
    const { name, category, price, description, image_url, stock } = req.body;
    const sql =
      "INSERT INTO Products (name, category, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)";
    await db.query(sql, [name, category, price, description, image_url, stock]);
    res.status(201).json({ message: "Product created successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error creating product." });
  }
});

// UPDATE an existing product
// Endpoint: PUT /api/admin/products/:id
router.put("/products/:id", adminMiddleware, async (req, res) => {
  try {
    const { name, category, price, description, image_url, stock } = req.body;
    const productId = req.params.id;
    const sql =
      "UPDATE Products SET name=?, category=?, price=?, description=?, image_url=?, stock=? WHERE id=?";
    await db.query(sql, [
      name,
      category,
      price,
      description,
      image_url,
      stock,
      productId,
    ]);
    res.json({ message: "Product updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error updating product." });
  }
});

// DELETE a product
// Endpoint: DELETE /api/admin/products/:id
router.delete("/products/:id", adminMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    await db.query("DELETE FROM Products WHERE id = ?", [productId]);
    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting product." });
  }
});

// --- ORDER MANAGEMENT ---

// GET all orders from all users
// Endpoint: GET /api/admin/orders
router.get("/orders", adminMiddleware, async (req, res) => {
  try {
    // Join Orders with Users and Shipping_Addresses to get all relevant info
    const sql = `
            SELECT 
                o.id AS order_id, o.order_status, o.total_price, o.created_at,
                u.name AS user_name, u.email AS user_email,
                sa.full_name AS shipping_name, sa.street_address, sa.city, sa.zip_code
            FROM Orders o
            JOIN Users u ON o.user_id = u.id
            JOIN Shipping_Addresses sa ON o.shipping_address_id = sa.id
            ORDER BY o.created_at DESC;
        `;
    const [orders] = await db.query(sql);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching orders." });
  }
});

// ADD THESE TWO NEW ROUTES to adminRoutes.js

// --- MESSAGE MANAGEMENT ---

// GET all messages from the contact form
// Endpoint: GET /api/admin/messages
router.get("/messages", adminMiddleware, async (req, res) => {
  try {
    const sql = "SELECT * FROM Messages ORDER BY submitted_at DESC";
    const [messages] = await db.query(sql);
    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: "Server error fetching messages." });
  }
});

// --- REVIEW MANAGEMENT ---

// GET all reviews for all products
// Endpoint: GET /api/admin/reviews
router.get("/reviews", adminMiddleware, async (req, res) => {
  try {
    // Join with Products and Users tables to get full context
    const sql = `
    SELECT 
        r.id, r.rating, r.review_text, r.created_at,
        p.name AS product_name,
        u.name AS user_name,
        u.email AS user_email  -- <-- ADD THIS LINE
    FROM Reviews r
    JOIN Products p ON r.product_id = p.id
    JOIN Users u ON r.user_id = u.id
    ORDER BY r.created_at DESC;
`;
    const [reviews] = await db.query(sql);
    res.json(reviews);
  } catch (err) {
    console.error("Fetch all reviews error:", err);
    res.status(500).json({ message: "Server error fetching reviews." });
  }
});

// UPDATE an order's status
// Endpoint: PUT /api/admin/orders/:id/status
router.put("/orders/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    // Validate the new status to ensure it's one of the allowed values
    const allowedStatuses = ["Processing", "Shipped", "Cancelled"];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const sql = "UPDATE Orders SET order_status = ? WHERE id = ?";
    await db.query(sql, [newStatus, orderId]);

    res.json({ message: `Order #${orderId} status updated to ${newStatus}.` });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error updating order status." });
  }
});

module.exports = router;
