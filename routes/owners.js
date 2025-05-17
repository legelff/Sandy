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

// Get owner profile with details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const owner = await pool.query(
            `SELECT 
        po.*,
        u.name, u.email, u.street, u.city, u.postcode, u.latitude, u.longitude,
        os.name as subscription_name, os.price, os.one_pet, os.all_species, 
        os.requests_per_day, os.booking_fee, os.is_ad_free, os.extended
      FROM pet_owners po
      JOIN users u ON po.user_id = u.id
      JOIN owner_subscriptions os ON po.subscription_id = os.id
      WHERE po.id = $1`,
            [id]
        );

        if (owner.rows.length === 0) {
            return res.status(404).json({ error: 'Owner not found' });
        }

        // Get owner's pets
        const pets = await pool.query(
            `SELECT p.*, 
              json_agg(json_build_object(
                'id', pp.id,
                'url', pp.url
              )) as photos
       FROM pets p
       LEFT JOIN pet_photos pp ON p.id = pp.pet_id
       WHERE p.owner_id = $1
       GROUP BY p.id`,
            [owner.rows[0].user_id]
        );

        res.json({
            ...owner.rows[0],
            pets: pets.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update owner profile
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { subscription_id } = req.body;

        const updatedOwner = await client.query(
            `UPDATE pet_owners 
       SET subscription_id = $1
       WHERE id = $2
       RETURNING *`,
            [subscription_id, id]
        );

        if (updatedOwner.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Owner not found' });
        }

        await client.query('COMMIT');
        res.json(updatedOwner.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Get owner's bookings
router.get('/:id/bookings', async (req, res) => {
    try {
        const { id } = req.params;
        const bookings = await pool.query(
            `SELECT b.*, 
              ps.id as sitter_id,
              u.name as sitter_name,
              json_agg(json_build_object(
                'id', p.id,
                'name', p.name,
                'breed', p.breed
              )) as pets
       FROM bookings b
       JOIN pet_sitters ps ON b.sitter_id = ps.id
       JOIN users u ON ps.user_id = u.id
       JOIN booking_pets bp ON b.id = bp.booking_id
       JOIN pets p ON bp.pet_id = p.id
       WHERE b.owner_id = $1
       GROUP BY b.id, ps.id, u.name`,
            [id]
        );

        res.json(bookings.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 