var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Sandy',
    password: 'process.env.DB_PASSWORD',
    port: 5432,
});

// Get sitter profile with details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sitter = await pool.query(
            `SELECT 
        ps.*,
        u.name, u.email, u.street, u.city, u.postcode, u.latitude, u.longitude,
        ss.name as subscription_name, ss.is_ad_free, ss.pets_per_week, ss.booking_fee, ss.has_insurance, ss.has_training
      FROM pet_sitters ps
      JOIN users u ON ps.user_id = u.id
      JOIN sitter_subscriptions ss ON ps.subscription_id = ss.id
      WHERE ps.id = $1`,
            [id]
        );

        if (sitter.rows.length === 0) {
            return res.status(404).json({ error: 'Sitter not found' });
        }

        // Get sitter's availability
        const availability = await pool.query(
            'SELECT * FROM sitter_availability WHERE sitter_id = $1',
            [id]
        );

        // Get sitter's photos
        const photos = await pool.query(
            'SELECT * FROM sitter_photos WHERE sitter_id = $1',
            [id]
        );

        // Get sitter's reviews
        const reviews = await pool.query(
            `SELECT ur.*, u.name as reviewer_name
       FROM user_reviews ur
       JOIN users u ON ur.user_id = u.id
       WHERE ur.booking_id IN (
         SELECT id FROM bookings WHERE sitter_id = $1
       )`,
            [id]
        );

        res.json({
            ...sitter.rows[0],
            availability: availability.rows,
            photos: photos.rows,
            reviews: reviews.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update sitter profile
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { experience_years, personality_and_motivation, extended } = req.body;

        const updatedSitter = await client.query(
            `UPDATE pet_sitters 
       SET experience_years = $1, 
           personality_and_motivation = $2,
           extended = $3
       WHERE id = $4
       RETURNING *`,
            [experience_years, personality_and_motivation, extended, id]
        );

        if (updatedSitter.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Sitter not found' });
        }

        await client.query('COMMIT');
        res.json(updatedSitter.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Update sitter availability
router.put('/:id/availability', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { availability } = req.body;

        // Delete existing availability
        await client.query('DELETE FROM sitter_availability WHERE sitter_id = $1', [id]);

        // Insert new availability
        for (const slot of availability) {
            await client.query(
                `INSERT INTO sitter_availability (sitter_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
                [id, slot.day_of_week, slot.start_time, slot.end_time]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Availability updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Add sitter photo
router.post('/:id/photos', async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body;

        const newPhoto = await pool.query(
            'INSERT INTO sitter_photos (sitter_id, url) VALUES ($1, $2) RETURNING *',
            [id, url]
        );

        res.status(201).json(newPhoto.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get sitter's bookings
router.get('/:id/bookings', async (req, res) => {
    try {
        const { id } = req.params;
        const bookings = await pool.query(
            `SELECT b.*, 
              u.name as owner_name,
              json_agg(json_build_object(
                'id', p.id,
                'name', p.name,
                'breed', p.breed
              )) as pets
       FROM bookings b
       JOIN users u ON b.owner_id = u.id
       JOIN booking_pets bp ON b.id = bp.booking_id
       JOIN pets p ON bp.pet_id = p.id
       WHERE b.sitter_id = $1
       GROUP BY b.id, u.name`,
            [id]
        );

        res.json(bookings.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Set sitter availability (duplicate, remove?)
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
