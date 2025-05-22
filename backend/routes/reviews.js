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

router.post('/user', async (req, res) => {
  const client = await pool.connect();
  try {
    const { booking_id, rating, comment, target_user_id } = req.body;
    const reviewer_id = req.body.reviewer_user_id; 

    // Step 1: Make sure reviewer is allowed to review this booking
    const bookingCheck = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND (owner_id = $2 OR sitter_id = $2)',
      [booking_id, reviewer_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to review this booking' });
    }

    // Step 2: Insert the review for the target user
    const result = await client.query(
      `INSERT INTO user_reviews (booking_id, rating, comment, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [booking_id, rating, comment, target_user_id]
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




// Create a review for a pet
router.post('/pet', async (req, res) => {
  const client = await pool.connect();
  try {
    const { pet_id, rating, comment, booking_id, user_id } = req.body;

    if (!pet_id || !rating || !booking_id || !user_id) {
      return res.status(400).json({ error: 'pet_id, rating, booking_id, and user_id are required.' });
    }

    const bookingCheck = await client.query(
  `SELECT b.owner_id, ps.user_id AS sitter_user_id
   FROM bookings b
   JOIN pet_sitters ps ON ps.id = b.sitter_id
   WHERE b.id = $1`,
  [booking_id]
);

const booking = bookingCheck.rows[0];
const parsedUserId = Number(user_id);

if (!booking || (booking.owner_id !== parsedUserId && booking.sitter_user_id !== parsedUserId)) {
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
