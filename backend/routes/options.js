const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Sandy',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'SandyApp/1.0 (support@example.com)' }
  });
  if (!res.data[0]) throw new Error('Address not found');
  return {
    lat: parseFloat(res.data[0].lat),
    lng: parseFloat(res.data[0].lon)
  };
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// POST /options/confirm
router.post('/confirm', async (req, res) => {
  const {
    user_id,
    sitter_id,
    selected_pets,
    start_date,
    end_date,
    street_address,
    city,
    postcode,
    service_tier
  } = req.body;

  if (!user_id || !sitter_id || !selected_pets?.length || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const bookingRes = await pool.query(
      `SELECT id FROM bookings 
       WHERE owner_id = $1 AND sitter_id = $2 AND status = 'saved' 
       ORDER BY start_datetime DESC LIMIT 1`,
      [user_id, sitter_id]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Saved booking not found' });
    }

    const bookingId = bookingRes.rows[0].id;

    await pool.query(
      `UPDATE bookings SET 
         start_datetime = $1, 
         end_datetime = $2, 
         street = COALESCE($3, street),
         city = COALESCE($4, city),
         postcode = COALESCE($5, postcode),
         service_tier = COALESCE($6, service_tier),
         status = 'requested'
       WHERE id = $7`,
      [start_date, end_date, street_address, city, postcode, service_tier, bookingId]
    );

    await pool.query(`DELETE FROM booking_pets WHERE booking_id = $1`, [bookingId]);

    const insertPets = selected_pets.map(pet_id =>
      pool.query(`INSERT INTO booking_pets (booking_id, pet_id) VALUES ($1, $2)`, [bookingId, pet_id])
    );
    await Promise.all(insertPets);

    res.status(200).json({ message: 'Booking confirmed and updated', booking_id: bookingId });
  } catch (err) {
    console.error('Error in /options/confirm:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /options
router.get('/', async (req, res) => {
  const ownerId = req.query.user_id;
  if (!ownerId) return res.status(400).json({ error: 'user_id is required' });

  try {
    const ownerResult = await pool.query('SELECT latitude, longitude FROM users WHERE id = $1', [ownerId]);
    const owner = ownerResult.rows[0];

    const bookingsQuery = `
      SELECT b.id AS booking_id, b.start_datetime, b.end_datetime, b.street AS street_address, b.city, b.postcode,
             b.service_tier, u.name AS sitter_name, u.id AS sitter_user_id, ps.id AS sitter_id
      FROM bookings b
      JOIN pet_sitters ps ON ps.id = b.sitter_id
      JOIN users u ON u.id = ps.user_id
      WHERE b.owner_id = $1 AND b.status = 'saved'
    `;

    const result = await pool.query(bookingsQuery, [ownerId]);
    const bookings = result.rows;
    const response = [];

    for (const b of bookings) {
      const sitterCoords = await geocode(`${b.street_address}, ${b.city}, ${b.postcode}`);
      const distance = getDistanceKm(owner.latitude, owner.longitude, sitterCoords.lat, sitterCoords.lng);

      const petsQuery = `
        SELECT p.name, s.name AS species
        FROM booking_pets bp
        JOIN pets p ON p.id = bp.pet_id
        JOIN species s ON s.id = p.species_id
        WHERE bp.booking_id = $1
      `;
      const petsRes = await pool.query(petsQuery, [b.booking_id]);

      const mainImgQuery = `
        SELECT url FROM sitter_photos WHERE sitter_id = $1 LIMIT 1
      `;
      const mainImgRes = await pool.query(mainImgQuery, [b.sitter_id]);

      const ratingQuery = `
        SELECT ROUND(AVG(rating))::int AS avg_rating FROM user_reviews WHERE user_id = $1
      `;
      const ratingRes = await pool.query(ratingQuery, [b.sitter_user_id]);

      response.push({
        booking_id: b.booking_id,
        save_id: b.booking_id,
        sitter_id: b.sitter_id,
        sitter_name: b.sitter_name,
        main_img: mainImgRes.rows[0]?.url || null,
        average_rating: ratingRes.rows[0]?.avg_rating || 0,
        start_date: b.start_datetime,
        end_date: b.end_datetime,
        selected_pets: petsRes.rows.map(p => p.name),
        distance: parseFloat(distance.toFixed(2)),
        street_address: b.street_address,
        city: b.city,
        postcode: b.postcode,
        service_tier: b.service_tier || 'Basic',
        relevancy_score: parseFloat((Math.random() * 2 + 8).toFixed(1))
      });
    }

    res.status(200).json({ saved: response });
  } catch (err) {
    console.error('Error in /search/options:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
