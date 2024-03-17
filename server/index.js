
// Import necessary modules
const pg = require('pg');
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Initialize Express app
const app = express();

// Connect to PostgreSQL
const client = new pg.Client("postgres://localhost/unit4CAreerSimulation_db");

// Middleware
app.use(bodyParser.json());

// Secret key for JWT
const JWT_SECRET = 'your_secret_key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
};

// Routes

// Create an account
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const client = await pool.connect();
        const queryText = 'INSERT INTO users (email, password) VALUES ($1, $2)';
        await client.query(queryText, [email, hashedPassword]);
        client.release();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// Log into an account
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            client.release();
            return res.status(404).send('User not found');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        client.release();
        if (!validPassword) {
            return res.status(401).send('Invalid password');
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

// As a user (logged in), manage cart functionalities

// Add a product to the cart
app.post('/cart/add', verifyToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        // Check if the product exists
        const productExists = await checkProductExists(productId);
        if (!productExists) {
            return res.status(404).send('Product not found');
        }
        
        // Add the product to the user's cart in the database
        await addToCart(productId, quantity);

        res.send('Product added to cart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding product to cart');
    }
});

// Edit the cart - Change the quantity of a product in the cart
app.put('/cart/:productId', verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        // Implement logic to change quantity of product in user's cart
        res.send('Cart updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating cart');
    }
});

// Edit the cart - Remove a product from the cart
app.delete('/cart/:productId', verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;
        // Implement logic to remove product from user's cart
        res.send('Product removed from cart');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error removing product from cart');
    }
});

// Checkout - "Purchase" the products in the cart
app.post('/checkout', verifyToken, async (req, res) => {
    try {
        // Implement logic for checkout process
        res.send('Checkout successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during checkout');
    }
});

// As an administrator, manage product functionalities
// View a list of all products
app.get('/admin/products', verifyToken, async (req, res) => {
    try {
        // Implement logic to retrieve all products (restricted to admin)
        res.send('List of all products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving products');
    }
});

// Add a product
app.post('/admin/products', verifyToken, async (req, res) => {
    try {
        // Implement logic to add a product (restricted to admin)
        res.send('Product added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding product');
    }
});

// Edit a product
app.put('/admin/products/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Implement logic to edit a product (restricted to admin)
        res.send('Product updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating product');
    }
});

// Remove a product
app.delete('/admin/products/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Implement logic to remove a product (restricted to admin)
        res.send('Product removed successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error removing product');
    }
});

// View a list of all users
app.get('/admin/users', verifyToken, async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users');
        const users = result.rows;
        client.release();
        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
