var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Database configuration for Sandy database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Sandy',
  password: 'mypassword',
  port: 5432,
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// Register a new user
router.post('/register', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { name, email, password, street, city, postcode, role, latitude, longitude, subscriptionType = 'basic' } = req.body;

    // First, ensure the basic subscriptions exist
    if (role === 'owner') {
      // Check if any owner subscriptions exist
      const subCheck = await client.query('SELECT COUNT(*) FROM owner_subscriptions');

      if (parseInt(subCheck.rows[0].count) === 0) {
        // Create default subscriptions
        await client.query(`
          INSERT INTO owner_subscriptions (name, price, one_pet, all_species, requests_per_day, booking_fee, is_ad_free, extended)
          VALUES 
          ('basic', 0.00, true, false, 5, 0.00, false, false),
          ('upgraded basic', 9.99, true, false, 999, 0.00, true, false),
          ('premium', 19.99, false, true, 999, 0.00, true, true)
        `);
      }
    } else if (role === 'sitter') {
      // Check if any sitter subscriptions exist
      const subCheck = await client.query('SELECT COUNT(*) FROM sitter_subscriptions');

      if (parseInt(subCheck.rows[0].count) === 0) {
        // Create default subscriptions
        await client.query(`
          INSERT INTO sitter_subscriptions (name, is_ad_free, pets_per_week, booking_fee, has_insurance, has_training)
          VALUES 
          ('basic', false, 5, 0.00, false, false),
          ('premium', true, 999, 0.00, true, true)
        `);
      }
    }

    // Check if user already exists
    const userExists = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const newUser = await client.query(
      `INSERT INTO users (name, email, password, street, city, postcode, role, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, email, street, city, postcode, role, latitude, longitude`,
      [name, email, hashedPassword, street, city, postcode, role, latitude, longitude]
    );

    // Create corresponding role-specific record
    if (role === 'owner') {
      // Get the ID of the basic subscription
      const subResult = await client.query(
        'SELECT id FROM owner_subscriptions WHERE name = $1',
        ['basic']
      );

      if (subResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: 'Error finding subscription' });
      }

      const subscriptionId = subResult.rows[0].id;

      await client.query(
        'INSERT INTO pet_owners (user_id, subscription_id) VALUES ($1, $2)',
        [newUser.rows[0].id, subscriptionId]
      );
    } else if (role === 'sitter') {
      // Get the ID of the basic subscription
      const subResult = await client.query(
        'SELECT id FROM sitter_subscriptions WHERE name = $1',
        ['basic']
      );

      if (subResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: 'Error finding subscription' });
      }

      const subscriptionId = subResult.rows[0].id;

      await client.query(
        'INSERT INTO pet_sitters (user_id, subscription_id) VALUES ($1, $2)',
        [newUser.rows[0].id, subscriptionId]
      );
    } else if (role === 'employee') {
      await client.query(
        'INSERT INTO employees (user_id) VALUES ($1)',
        [newUser.rows[0].id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user.rows[0];
    res.json({
      message: 'Login successful',
      user: userData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query(
      'SELECT id, name, email, street, city, postcode, role, latitude, longitude FROM users WHERE id = $1',
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

