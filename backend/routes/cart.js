// cart.js
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Use environment variable for DB URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // set this in Render dashboard
    ssl: {
        rejectUnauthorized: false // necessary for some hosted Postgres services
    }
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database successfully');
    release();
});

// Insert a row into cart
app.post('/cart', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ error: 'user_id, product_id, and quantity are required' });
    }

    try {
        const query = `
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [user_id, product_id, quantity];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Item added to cart',
            cartItem: result.rows[0]
        });
    } catch (error) {
        console.error('Error inserting into cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Optional: fetch all cart items
app.get('/cart', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cart ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
