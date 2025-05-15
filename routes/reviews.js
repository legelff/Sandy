const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Sandy',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Create a review for a user
router.post('/user', async (req, res) => {
  const client = await pool.connect();
  try {
    const { booking_id, rating, comment, user_id } = req.body;

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
router.get('/user/:userId', async (req, res) => {
    const client = await pool.connect();
    try {
      const userId = parseInt(req.params.userId);
  
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

  
  router.post('/pet', async (req, res) => {
    const client = await pool.connect();
    try {
      const { pet_id, rating, comment, booking_id } = req.body;
  
      if (!pet_id || !rating || !booking_id) {
        return res.status(400).json({ error: 'pet_id, rating, and booking_id are required.' });
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

  
  router.post('/pet', async (req, res) => {
    const client = await pool.connect();
    try {
      const { pet_id, rating, comment, booking_id } = req.body;
  
      if (!pet_id || !rating || !booking_id) {
        return res.status(400).json({ error: 'pet_id, rating, and booking_id are required.' });
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
