const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { verifyToken } = require('../middleware/auth');

// PostgreSQL connection pool setup
const pool = new Pool({
    user: process.env.DB_USER ?? 'postgres',
    host: 'localhost',
    database: process.env.DB_NAME ?? 'Sandy',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ?? 5432,
});

// Helper to check if user has permission for a booking
async function userHasBookingPermission(user, bookingId) {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const result = await pool.query(query, [bookingId]);
    if (result.rows.length === 0) return false;
    const booking = result.rows[0];
    return booking.owner_id === user.id || booking.sitter_id === user.id;
}

//  Create a new booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            sitter_id,
            pet_ids,
            start_datetime,
            end_datetime,
            status,
            service_tier
        } = req.body;

        const owner_id = req.user.id;

        // Validate required fields
        if (!owner_id || !sitter_id || !Array.isArray(pet_ids) || pet_ids.length === 0 || !start_datetime || !end_datetime) {
            return res.status(400).json({ status: 400, message: 'Missing required fields or invalid pet_ids' });
        }

        // Insert booking
        const bookingQuery = `
            INSERT INTO bookings (owner_id, sitter_id, start_datetime, end_datetime, status, service_tier)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;

        const bookingValues = [owner_id, sitter_id, start_datetime, end_datetime, status || 'requested', service_tier || null];
        const bookingResult = await pool.query(bookingQuery, bookingValues);
        const booking = bookingResult.rows[0];

        // Insert related pet_ids
        const bookingPetsQuery = `
            INSERT INTO booking_pets (booking_id, pet_id)
            VALUES ${pet_ids.map((_, i) => `($1, $${i + 2})`).join(',')}`;
        await pool.query(bookingPetsQuery, [booking.id, ...pet_ids]);

        booking.pet_ids = pet_ids;
        return res.status(201).json({ status: 201, booking });
    } catch (error) {
        console.error('Create booking error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});

//  Get all bookings where the user is either an owner or sitter
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

        // Attach pet_ids to each booking
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

//  Get a specific booking by ID if the user has access
router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, message: 'Booking not found' });
        }

        const booking = result.rows[0];

        // Permission check
        if (booking.owner_id !== req.user.id && booking.sitter_id !== req.user.id) {
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        // Attach pet_ids
        const petsResult = await pool.query('SELECT pet_id FROM booking_pets WHERE booking_id = $1', [id]);
        booking.pet_ids = petsResult.rows.map(row => row.pet_id);

        return res.status(200).json({ status: 200, booking });
    } catch (error) {
        console.error('Get booking error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});

// Update an existing booking (if user is owner or sitter)
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

        // Update booking
        const updateQuery = `
            UPDATE bookings
            SET owner_id = $1,
                sitter_id = $2,
                start_datetime = $3,
                end_datetime = $4,
                status = $5,
                notes = $6
            WHERE id = $7
            RETURNING *`;
        const values = [owner_id, sitter_id, start_datetime, end_datetime, status, notes, id];
        const result = await pool.query(updateQuery, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, message: 'Booking not found' });
        }

        // Replace pet associations
        await pool.query('DELETE FROM booking_pets WHERE booking_id = $1', [id]);
        if (Array.isArray(pet_ids) && pet_ids.length > 0) {
            const insertQuery = `
                INSERT INTO booking_pets (booking_id, pet_id)
                VALUES ${pet_ids.map((_, i) => `($1, $${i + 2})`).join(',')}`;
            await pool.query(insertQuery, [id, ...pet_ids]);
        }

        result.rows[0].pet_ids = pet_ids;
        return res.status(200).json({ status: 200, booking: result.rows[0] });
    } catch (error) {
        console.error('Update booking error:', error);
        return res.status(500).json({ status: 500, message: 'Something went wrong' });
    }
});

// Delete a booking (if user is owner or sitter)
router.delete('/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const allowed = await userHasBookingPermission(req.user, id);
        if (!allowed) {
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        // Delete related pet records
        await pool.query('DELETE FROM booking_pets WHERE booking_id = $1', [id]);

        // Delete booking
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

router.post('/respond', async (req, res) => {
    const { booking_id, action } = req.body;

    if (!booking_id || action !== 'accepted') {
        return res.status(400).json({ error: 'Invalid request. booking_id and valid action required.' });
    }

    try {
        const updateRes = await pool.query(
            `UPDATE bookings SET status = 'accepted' WHERE id = $1 RETURNING *`,
            [booking_id]
        );

        if (updateRes.rowCount === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // --- Conversation creation after booking acceptance ---
        try {
            const booking = updateRes.rows[0];
            const ownerId = booking.owner_id;
            const sitterId = booking.sitter_id;
            const userSitterIdRes = await pool.query(
                'SELECT user_id FROM pet_sitters WHERE (id = $1)',
                [sitterId]
            )
            let userSitterId
            if (userSitterIdRes.rows.length == 0) {
                console.log("couldnt find sitter, assuming user_id is sitter id!")
                userSitterId = sitterId
            } else {
                userSitterId = userSitterIdRes.rows[0].user_id
            }

            let conversationId;
            console.log('[Booking Accept] ownerId:', ownerId, 'sitterId:', sitterId);
            // Check if conversation exists
            const convRes = await pool.query(
                'SELECT id FROM conversations WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
                [ownerId, userSitterId]
            );
            if (convRes.rows.length > 0) {
                conversationId = convRes.rows[0].id;
                console.log('[Booking Accept] Conversation already exists:', conversationId);
            } else {
                const newConv = await pool.query(
                    'INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING id',
                    [ownerId, userSitterId]
                );
                conversationId = newConv.rows[0].id;
                console.log('[Booking Accept] Created new conversation:', conversationId);
            }
            // Check if a booking_accepted message for this booking already exists
            const existingMsg = await pool.query(
                'SELECT 1 FROM messages WHERE conversation_id = $1 AND content::jsonb @> $2::jsonb LIMIT 1',
                [conversationId, JSON.stringify({ type: 'booking_accepted', booking: { id: booking.id } })]
            );
            if (existingMsg.rows.length === 0) {
                // Fetch booking details for message
                const bookingDetails = await pool.query(
                    'SELECT b.*, string_agg(p.name, ", ") as pet_names, o.name as owner_name, b.city, b.postcode FROM bookings b JOIN booking_pets bp ON b.id = bp.booking_id JOIN pets p ON bp.pet_id = p.id JOIN users o ON b.owner_id = o.id WHERE b.id = $1 GROUP BY b.id, o.name',
                    [booking.id]
                );
                const b = bookingDetails.rows[0];
                await pool.query(
                    'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)',
                    [
                        conversationId,
                        userSitterId,
                        JSON.stringify({
                            type: 'booking_accepted',
                            booking: {
                                id: b.id,
                                petNames: b.pet_names,
                                startDate: b.start_datetime,
                                endDate: b.end_datetime,
                                location: `${b.city || ''} ${b.postcode || ''}`.trim(),
                                ownerName: b.owner_name
                            }
                        })
                    ]
                );
                console.log('[Booking Accept] Inserted initial booking message for conversation:', conversationId);
            } else {
                console.log('[Booking Accept] Initial booking message already exists for conversation:', conversationId);
            }
        } catch (convErr) {
            console.error('[Booking Accept] Error creating conversation or message:', convErr);
        }
        // --- End conversation creation ---

        res.status(200).json({ message: 'Booking accepted and updated', booking: updateRes.rows[0] });
    } catch (err) {
        console.error('Error in /bookings/respond:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;