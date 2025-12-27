const express = require('express');
const router = express.Router();

// 1. Import the database connection pool
const db = require('../config/db');

// 2. Modify the GET route for /api/products
// We make the function 'async' to use 'await'
router.get('/', async (req, res) => {
  try {
    // 3. Define the SQL query to get all products
    const sql = 'SELECT * FROM Products';

    // 4. Execute the query using the database pool
    // The [rows] syntax is array destructuring to get the first element (the data) from the response.
    const [rows] = await db.query(sql);

    // 5. Send the database rows as a JSON response
    res.json(rows);

  } catch (err) {
    // If there's an error, log it and send a server error response
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET a single product by its ID
// The ':id' is a URL parameter. Express will capture the value and store it in req.params.id
router.get('/:id', async (req, res) => {
  try {
    // 1. Get the product ID from the URL parameters
    const productId = req.params.id;

    // 2. Define the SQL query to get one product using a '?' placeholder
    // Using placeholders is a crucial security practice to prevent SQL injection attacks.
    const sql = 'SELECT * FROM Products WHERE id = ?';

    // 3. Execute the query, passing the productId as a value for the placeholder
    const [rows] = await db.query(sql, [productId]);

    // 4. Check if a product was actually found
    if (rows.length === 0) {
      // If no product is found, send a 404 Not Found status
      return res.status(404).json({ error: 'Product not found' });
    }

    // 5. Send the found product as a JSON response
    // Since we are looking for one ID, we expect only one result, so we send rows[0].
    res.json(rows[0]);

  } catch (err) {
    console.error('Error fetching single product:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// GET products by category name
// REPLACE the old category route with this new one

// REPLACE your current '/category/:name' route with this final, correct version

router.get('/category/:name', async (req, res) => {
  try {
    const categoryName = req.params.name;
    let sql;
    let queryParams;

    if (categoryName === 'Men') {
      // Now, this query is much simpler. It finds all products that are
      // explicitly for men OR are in shared categories like 'Compression Shirts'.
      sql = 'SELECT * FROM Products WHERE category IN (?, ?, ?, ?, ?)';
      queryParams = ['Men', 'Compression Shirts', 'Hoodies', 'Joggers', 'Gym Tees'];
    } else if (categoryName === 'Women') {
      // This query is now also very simple. It ONLY looks for products
      // with the category 'Women'.
      sql = 'SELECT * FROM Products WHERE category = ?';
      queryParams = ['Women'];
    } else {
      // Fallback for any other specific category
      sql = 'SELECT * FROM Products WHERE category = ?';
      queryParams = [categoryName];
    }

    const [rows] = await db.query(sql, queryParams);
    res.json(rows);

  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;