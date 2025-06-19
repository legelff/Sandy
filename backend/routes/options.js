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

async function getPersonalityMatchScore(pet, sitterPersonality) {
  try {
    const prompt = `
A pet has the following traits:
- Personality: ${pet.personality}
- Favorite Activities: ${pet.favorite_activities_and_needs}
- Energy Level: ${pet.energy_level}
- Comfort with Strangers: ${pet.comfort_with_strangers}

A pet sitter wrote this about themselves:
"${sitterPersonality}"

From 1 to 10, how compatible is this sitter with this pet? Respond with only a number. Do not explain.
    `.trim();

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = response.data.choices[0].message.content.trim();
    const match = raw.match(/\d+/);
    const score = match ? parseInt(match[0]) : 5;
    return isNaN(score) ? 5 : score;
  } catch (err) {
    console.error('❌ AI match error:', err.message);
    return 5;
  }
}

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
    sitter_user_id,  // ✅ Expect this instead of sitter_id
    selected_pets,
    start_date,
    end_date,
    street_address,
    city,
    postcode,
    service_tier
  } = req.body;

  if (!user_id || !sitter_user_id || !selected_pets?.length || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // ✅ Get sitter_id using sitter_user_id
    const sitterRes = await pool.query(
      `SELECT id FROM pet_sitters WHERE user_id = $1`,
      [sitter_user_id]
    );

    if (sitterRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pet sitter not found for given user' });
    }

    const sitter_id = sitterRes.rows[0].id;

    // ✅ Continue with sitter_id
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



router.get('/', async (req, res) => {
  const {
    user_id: ownerId,
    street: ownerStreet,
    city: ownerCity,
    postcode: ownerPostcode
  } = req.query;

  if (!ownerId || !ownerStreet || !ownerCity || !ownerPostcode) {
    return res.status(400).json({ error: 'user_id and full address are required' });
  }

  try {
    const ownerCoords = await geocode(`${ownerStreet}, ${ownerCity}, ${ownerPostcode}`);

    const bookingsQuery = `
      SELECT b.id AS booking_id, b.start_datetime, b.end_datetime,
             b.service_tier,
             u.name AS sitter_name, u.id AS sitter_user_id,
             ps.personality_and_motivation AS sitter_personality,
             ps.id AS sitter_id,
             u.street AS sitter_street,
             u.city AS sitter_city,
             u.postcode AS sitter_postcode
      FROM bookings b
      JOIN pet_sitters ps ON ps.id = b.sitter_id
      JOIN users u ON u.id = ps.user_id
      WHERE b.owner_id = $1 AND b.status = 'saved'
    `;

    const result = await pool.query(bookingsQuery, [ownerId]);
    const bookings = result.rows;
    const response = [];

    for (const b of bookings) {
      const sitterAddress = `${b.sitter_street}, ${b.sitter_city}, ${b.sitter_postcode}`;
      const sitterCoords = await geocode(sitterAddress);
      const distance = getDistanceKm(ownerCoords.lat, ownerCoords.lng, sitterCoords.lat, sitterCoords.lng);

      const petsQuery = `
        SELECT p.name, s.name AS species,
               p.personality, p.favorite_activities_and_needs,
               p.energy_level, p.comfort_with_strangers
        FROM booking_pets bp
        JOIN pets p ON p.id = bp.pet_id
        JOIN species s ON s.id = p.species_id
        WHERE bp.booking_id = $1
      `;
      const petsRes = await pool.query(petsQuery, [b.booking_id]);
      const pets = petsRes.rows;

      const mainImgQuery = `SELECT url FROM sitter_photos WHERE sitter_id = $1 LIMIT 1`;
      const mainImgRes = await pool.query(mainImgQuery, [b.sitter_id]);

      const ratingQuery = `SELECT ROUND(AVG(rating))::int AS avg_rating FROM user_reviews WHERE user_id = $1`;
      const ratingRes = await pool.query(ratingQuery, [b.sitter_user_id]);

      // Personality matching score
      const scores = await Promise.all(
        pets.map(pet => getPersonalityMatchScore(pet, b.sitter_personality))
      );
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      response.push({
        booking_id: b.booking_id,
        save_id: b.booking_id,
        sitter_id: b.sitter_id,
        sitter_user_id: b.sitter_user_id,
        sitter_name: b.sitter_name,
        main_img: mainImgRes.rows[0]?.url || null,
        average_rating: ratingRes.rows[0]?.avg_rating || 0,
        start_date: b.start_datetime,
        end_date: b.end_datetime,
        selected_pets: pets.map(p => p.name),
        distance: parseFloat(distance.toFixed(2)),
        street_address: b.sitter_street,
        city: b.sitter_city,
        postcode: b.sitter_postcode,
        service_tier: b.service_tier || 'Basic',
        personality_match_score: avgScore
      });
    }

    res.status(200).json({ saved: response });
  } catch (err) {
    console.error('Error in /search/options:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
