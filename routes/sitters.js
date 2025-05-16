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

// Set sitter availability
router.post('/availability', async (req, res) => {
  const client = await pool.connect();
  try {
    const { sitter_id, availability } = req.body;

    if (!sitter_id || !Array.isArray(availability)) {
      return res.status(400).json({ error: 'sitter_id and availability array are required.' });
    }

    await client.query('BEGIN');

    // Optionally: delete previous availability
    await client.query('DELETE FROM sitter_availability WHERE sitter_id = $1', [sitter_id]);

    // Insert new availability slots
    for (const slot of availability) {
      const { day_of_week, start_time, end_time } = slot;

      if (!day_of_week || !start_time || !end_time) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Each availability entry must include day_of_week, start_time, and end_time.' });
      }

      await client.query(
        `INSERT INTO sitter_availability (sitter_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [sitter_id, day_of_week, start_time, end_time]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Availability set successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error setting availability:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
