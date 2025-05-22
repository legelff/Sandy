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

// Helper to check if user is owner or sitter in a booking
async function userHasBookingPermission(user, bookingId) {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const result = await pool.query(query, [bookingId]);
    if (result.rows.length === 0) return false;
    const booking = result.rows[0];
    return booking.owner_id === user.id || booking.sitter_id === user.id;
}


router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            sitter_id,
            pet_ids,
            start_datetime,
            end_datetime,
            status,
            notes
        } = req.body;

        const owner_id = req.user.id;

        if (!owner_id || !sitter_id || !Array.isArray(pet_ids) || pet_ids.length === 0 || !start_datetime || !end_datetime) {
            return res.status(400).json({ status: 400, message: 'Missing required fields or invalid pet_ids' });
        }

        const bookingQuery = `
            INSERT INTO bookings (owner_id, sitter_id, start_datetime, end_datetime, status, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const bookingValues = [owner_id, sitter_id, start_datetime, end_datetime, status || 'pending', notes || null];
        const bookingResult = await pool.query(bookingQuery, bookingValues);
        const booking = bookingResult.rows[0];

        const bookingPetsQuery = `
            INSERT INTO booking_pets (booking_id, pet_id)
            VALUES ${pet_ids.map((_, i) => `($1, $${i + 2})`).join(',')}
        `;
        await pool.query(bookingPetsQuery, [booking.id, ...pet_ids]);

        booking.pet_ids = pet_ids;
        return res.status(201).json({ status: 201, booking });
    } catch (error) {
        console.error('Create booking error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});


router.get('/user/:userId', verifyToken, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (req.user.id !== userId) {
        return res.status(403).json({ status: 403, message: 'Forbidden' });
    }

    try {
        const result = await pool.query(`
            SELECT * FROM bookings
            WHERE owner_id = $1 OR sitter_id = $1
            ORDER BY start_datetime DESC
        `, [userId]);

        const bookings = result.rows;

        for (const booking of bookings) {
            const petsResult = await pool.query('SELECT pet_id FROM booking_pets WHERE booking_id = $1', [booking.id]);
            booking.pet_ids = petsResult.rows.map(row => row.pet_id);
        }

        return res.status(200).json({ status: 200, bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});


router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, message: 'Booking not found' });
        }

        const booking = result.rows[0];
        if (booking.owner_id !== req.user.id && booking.sitter_id !== req.user.id) {
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        const petsResult = await pool.query('SELECT pet_id FROM booking_pets WHERE booking_id = $1', [id]);
        booking.pet_ids = petsResult.rows.map(row => row.pet_id);

        return res.status(200).json({ status: 200, booking });
    } catch (error) {
        console.error('Get booking error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});


router.put('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const {
        owner_id,
        sitter_id,
        pet_ids,
        start_datetime,
        end_datetime,
        status,
        notes
    } = req.body;

    try {
        const allowed = await userHasBookingPermission(req.user, id);
        if (!allowed) {
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        const updateQuery = `
            UPDATE bookings
            SET owner_id = $1,
                sitter_id = $2,
                start_datetime = $3,
                end_datetime = $4,
                status = $5,
                notes = $6
            WHERE id = $7
            RETURNING *
        `;
        const values = [owner_id, sitter_id, start_datetime, end_datetime, status, notes, id];
        const result = await pool.query(updateQuery, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, message: 'Booking not found' });
        }

        await pool.query('DELETE FROM booking_pets WHERE booking_id = $1', [id]);
        if (Array.isArray(pet_ids) && pet_ids.length > 0) {
            const insertQuery = `
                INSERT INTO booking_pets (booking_id, pet_id)
                VALUES ${pet_ids.map((_, i) => `($1, $${i + 2})`).join(',')}
            `;
            await pool.query(insertQuery, [id, ...pet_ids]);
        }

        result.rows[0].pet_ids = pet_ids;
        return res.status(200).json({ status: 200, booking: result.rows[0] });
    } catch (error) {
        console.error('Update booking error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});


router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const allowed = await userHasBookingPermission(req.user, id);
        if (!allowed) {
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        await pool.query('DELETE FROM booking_pets WHERE booking_id = $1', [id]);
        const deleteResult = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);
        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ status: 404, message: 'Booking not found' });
        }

        return res.status(200).json({ status: 200, message: 'Booking deleted' });
    } catch (error) {
        console.error('Delete booking error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});

module.exports = router;