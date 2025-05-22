const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');

const pool = new Pool({
  user: process.env.DB_USER ?? 'postgres',
  host: 'localhost',
  database: process.env.DB_NAME ?? 'Sandy',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ?? 5432,
});

// Create a review for a user
router.post('/user', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { booking_id, rating, comment } = req.body;
    const user_id = req.user.id; // Use authenticated user's ID

    // Verify that the user has completed the booking
    const bookingCheck = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND (owner_id = $2 OR sitter_id = $2)',
      [booking_id, user_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to review this booking' });
    }

    const result = await client.query(
      `INSERT INTO user_reviews (booking_id, rating, comment, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [booking_id, rating, comment, user_id]
    );

    res.status(201).json({
      message: 'Review added successfully.',
      review: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

// Get all reviews for a specific user
router.get('/user/:userId', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = parseInt(req.params.userId);

    // Check if user is requesting their own reviews or is an employee
    if (userId !== req.user.id && req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Not authorized to view these reviews' });
    }

    const result = await client.query(
      `SELECT r.*, u.name AS reviewer_name
         FROM user_reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.user_id = $1`,
      [userId]
    );

    res.status(200).json({
      message: 'Reviews fetched successfully.',
      reviews: result.rows
    });
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

// Create a review for a pet
router.post('/pet', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { pet_id, rating, comment, booking_id } = req.body;

    if (!pet_id || !rating || !booking_id) {
      return res.status(400).json({ error: 'pet_id, rating, and booking_id are required.' });
    }

    // Verify that the user has completed the booking
    const bookingCheck = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND (owner_id = $2 OR sitter_id = $2)',
      [booking_id, req.user.id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to review this pet' });
    }

    const result = await client.query(
      `INSERT INTO pet_reviews (pet_id, rating, comment, booking_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
      [pet_id, rating, comment, booking_id]
    );

    res.status(201).json({
      message: 'Pet review created successfully.',
      review: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding pet review:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
