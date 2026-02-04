require('dotenv').config(); // Make sure this is at the very top
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- 1. IMPORT new routes
const messageRoutes = require('./routes/messageRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const reviewRoutes = require('./routes/reviewRoutes');
const cors = require('cors'); 
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); 
app.use('/api/orders', orderRoutes);

app.use('/uploads', express.static('uploads'));
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the Ashgrtz Fitness API!');
});

// --- API ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // <-- 3. USE the new routes
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
