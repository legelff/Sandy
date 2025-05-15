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

// POST /messages - send a message

router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
      const { sender_id, receiver_id, text } = req.body;
  
      if (!sender_id || !receiver_id || !text) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  
      const result = await client.query(
        `INSERT INTO messages (sender_id, receiver_id, text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [sender_id, receiver_id, text]
      );
  
      const message = result.rows[0];
  
      // Format sent_at to local timezone (e.g., Europe/Brussels)
      const localTime = new Date(message.sent_at).toLocaleString('en-US', {
        timeZone: 'Europe/Brussels',
      });
  
      res.status(201).json({
        message: 'Message sent successfully.',
        data: {
          ...message,
          sent_at: localTime,
        },
      });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    } finally {
      client.release();
    }
  });
  

 // Get all messages exchanged between two users
router.get('/:user1Id/:user2Id', async (req, res) => {
    const client = await pool.connect();
    try {
      const user1Id = parseInt(req.params.user1Id);
      const user2Id = parseInt(req.params.user2Id);
  
      const result = await client.query(
        `
        SELECT * FROM messages
        WHERE (sender_id = $1 AND receiver_id = $2)
           OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY sent_at ASC
        `,
        [user1Id, user2Id]
      );
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    } finally {
      client.release();
    }
  });

module.exports = router;
