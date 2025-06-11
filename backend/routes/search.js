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

    console.log("🔍 Sending prompt to GROQ:", prompt); // Debug line to inspect prompt

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const raw = response.data.choices[0].message.content.trim();
    console.log("🔍 GROQ response:", raw); // Debug line to inspect result

    const match = raw.match(/\d+/); // ✅ Fixed regex: no double backslash
    const score = match ? parseInt(match[0]) : 5;

    return isNaN(score) ? 5 : score;
  } catch (err) {
    console.error('❌ AI match error:', err.message);
    return 5;
  }
}

// Geocode helper
async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  console.log('➡️ Requesting geocode for:', address);
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'SandyApp/1.0 (support@example.com)' }
    });
    if (!res.data[0]) throw new Error('Address not found');
    return {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon)
    };
  } catch (err) {
    console.error('🌐 Geocoding error:', err.response?.data || err.message);
    throw err;
  }
}


// Distance formula
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

// Get all days between two dates
function getDaysBetween(start, end) {
  const days = [];
  const current = new Date(start);
  while (current <= new Date(end)) {
    days.push(current.toLocaleDateString('en-US', { weekday: 'long' }));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

router.get('/results', async (req, res) => {

  const {
    pets = [],
    start_date,
    end_date,
    street_address,
    city,
    postcode,
    service_tier
  } = req.query;

  if (!start_date || !end_date || !pets.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const petIds = pets.split(',').map(id => parseInt(id)).filter(Boolean);

    const petDetailsRes = await pool.query(`
      SELECT 
        p.id, 
        p.personality, 
        p.favorite_activities_and_needs, 
        p.energy_level, 
        p.comfort_with_strangers,
        s.name AS species
      FROM pets p
      LEFT JOIN species s ON s.id = p.species_id
      WHERE p.id = ANY($1)
    `, [petIds]);

    const petDetails = petDetailsRes.rows;
    const speciesRequested = petDetails.map(r => r.species.toLowerCase());
  const serviceTierRequired = service_tier === 'premium';

  try {
    const address = `${street_address}, ${city}, ${postcode}`;
    const bookingCoords = await geocode(address);
    const requiredDays = getDaysBetween(start_date, end_date);

    const query = `
      SELECT u.id AS user_id, u.name, u.street, u.city, u.postcode,
             ps.id AS sitter_id, ps.extended, ps.experience_years, ps.personality_and_motivation,
             ss.name AS subscription,
             ARRAY(
               SELECT url FROM sitter_photos sp WHERE sp.sitter_id = ps.id LIMIT 3
             ) AS pictures,
             (
               SELECT ROUND(AVG(pr.rating)) FROM user_reviews pr WHERE pr.user_id = u.id
             ) AS average_rating,
             (
               SELECT ARRAY_AGG(s.name)
               FROM (
                 SELECT DISTINCT s.name
                 FROM species s
                 JOIN employee_species es ON es.species_id = s.id
                 JOIN employees e ON e.sitter_id = ps.id
               ) s
             ) AS supported_species,
             ARRAY(
               SELECT sa.day_of_week FROM sitter_availability sa WHERE sa.sitter_id = ps.id
             ) AS available_days
      FROM pet_sitters ps
      JOIN users u ON u.id = ps.user_id
      JOIN sitter_subscriptions ss ON ss.id = ps.subscription_id
      WHERE ps.extended = $1
    `;

    const result = await pool.query(query, [serviceTierRequired]);
    console.log('✅ Sitters fetched from DB:', result.rows.length);
    const matchingSitters = [];

    for (const sitter of result.rows) {
      const supported = sitter.supported_species || ['dog', 'cat'];
      const supportsAllPets = speciesRequested.every(spec => supported.includes(spec));
      const availableDays = sitter.available_days || [];
      const isAvailable = requiredDays.every(day => availableDays.includes(day));
        if (!supportsAllPets) {
    console.log(`❌ Sitter ${sitter.name} filtered out due to unsupported species`, { required: speciesRequested, supported });
        continue;
      }

      if (!isAvailable) {
        console.log(`❌ Sitter ${sitter.name} filtered out due to unavailability`, { requiredDays, availableDays });
        continue;
      }

      let totalPersonalityScore = 0;
      for (const pet of petDetails) {
        const score = await getPersonalityMatchScore(pet, sitter.personality_and_motivation);
        totalPersonalityScore += score;
      }
      const avgPersonalityScore = totalPersonalityScore / pets.length;
      const sitterAddress = `${sitter.street}, ${sitter.city}, ${sitter.postcode}`;
      const sitterCoords = await geocode(sitterAddress);

      const distance = getDistanceKm(
        bookingCoords.lat,
        bookingCoords.lng,
        sitterCoords.lat,
        sitterCoords.lng
      );

      const combinedScore = Number(((10 - distance) + avgPersonalityScore).toFixed(2));


      matchingSitters.push({
        sitter_user_id: sitter.user_id,
        sitter_id: sitter.sitter_id,
        name: sitter.name,
        distance: parseFloat(distance.toFixed(2)),
        pictures: sitter.pictures,
        average_rating: sitter.average_rating || 0,
        supported_pets: supported,
        personality: sitter.personality_and_motivation,
        personality_match_score: avgPersonalityScore,
        combined_score: combinedScore
      });
    }

    matchingSitters.sort((a, b) => b.combined_score - a.combined_score);

    res.status(200).json({ matching_sitters: matchingSitters });
  } catch (err) {
    console.error('Error in /search/results:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.get('/sitter', async (req, res) => {
  const sitterUserId = req.query.user_id;
  if (!sitterUserId) return res.status(400).json({ error: 'user_id is required' });

  try {
    const sitterUserRes = await pool.query(
      'SELECT street, city, postcode FROM users WHERE id = $1',
      [sitterUserId]
    );
    const sitterUser = sitterUserRes.rows[0];

    const sitterIdRes = await pool.query(
      'SELECT id FROM pet_sitters WHERE user_id = $1',
      [sitterUserId]
    );
    const sitterId = sitterIdRes.rows[0].id;

    const sitterAddress = `${sitterUser.street}, ${sitterUser.city}, ${sitterUser.postcode}`;
    const sitterCoords = await geocode(sitterAddress);

    const bookingQuery = `
      SELECT b.id AS request_id, b.street, b.city, b.postcode, b.owner_id, u.name AS owner_name
      FROM bookings b
      JOIN users u ON u.id = b.owner_id
      WHERE b.sitter_id = $1 AND b.status = 'requested'
    `;
    const bookings = await pool.query(bookingQuery, [sitterId]);

    const results = [];
    console.log('🔎 Raw sitterUser result:', sitterUserRes.rows);
    console.log('🧑 Final sitterUser:', sitterUser);
    console.log('📍 Final address used for geocoding:', sitterAddress);


    for (const booking of bookings.rows) {
      const bookingAddress = `${booking.street}, ${booking.city}, ${booking.postcode}`;
      const bookingCoords = await geocode(bookingAddress);
      const distance = getDistanceKm(
        sitterCoords.lat, sitterCoords.lng,
        bookingCoords.lat, bookingCoords.lng
      );


      const petsQuery = `
        SELECT p.id AS pet_id, s.name AS pet_species, p.personality
        FROM booking_pets bp
        JOIN pets p ON bp.pet_id = p.id
        JOIN species s ON p.species_id = s.id
        WHERE bp.booking_id = $1
      `;
      const pets = await pool.query(petsQuery, [booking.request_id]);

      results.push({
        request_id: booking.request_id,
        owner_name: booking.owner_name,
        distance: parseFloat(distance.toFixed(2)),
        pets: pets.rows.map(p => ({
          pet_id: p.pet_id,
          pet_species: p.pet_species
        })),
        personality: pets.rows.map(p => p.personality).join(', ')
      });
    }

    res.status(200).json({ requests: results });
  } catch (err) {
    console.error('Error in /search/sitter:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



// POST /search/save
router.post('/save', async (req, res) => {
  const {
    user_id,             // owner
    sitter_user_id,      // user.id of the sitter
    start_date,
    end_date,
    selected_pets,
    street,
    city,
    postcode
  } = req.body;

  if (!user_id || !sitter_user_id || !start_date || !end_date || !selected_pets?.length || !street || !city || !postcode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get sitter_id from pet_sitters
    const sitterRes = await pool.query(
      `SELECT id FROM pet_sitters WHERE user_id = $1`,
      [sitter_user_id]
    );
    if (sitterRes.rows.length === 0) {
      return res.status(404).json({ error: 'Sitter not found' });
    }
    const sitter_id = sitterRes.rows[0].id;

    // 2. Get sitter address from users table
    const sitterAddressRes = await pool.query(
      `SELECT street, city, postcode FROM users WHERE id = $1`,
      [sitter_user_id]
    );
    if (sitterAddressRes.rows.length === 0) {
      return res.status(404).json({ error: 'Sitter user not found' });
    }

    const sitterAddr = sitterAddressRes.rows[0];
    const sitterFullAddr = `${sitterAddr.street}, ${sitterAddr.city}, ${sitterAddr.postcode}`;
    const bookingFullAddr = `${street}, ${city}, ${postcode}`;

    // 3. Geocode both
    const sitterCoords = await geocode(sitterFullAddr);
    const bookingCoords = await geocode(bookingFullAddr);

    console.log('Sitter full address:', sitterFullAddr);
    console.log('Booking full address:', bookingFullAddr);
    console.log('Sitter coordinates:', sitterCoords);
    console.log('Booking coordinates:', bookingCoords);


    // 4. Calculate distance
    const distance = getDistanceKm(
      sitterCoords.lat,
      sitterCoords.lng,
      bookingCoords.lat,
      bookingCoords.lng
    );

    // 5. Insert booking with status "saved"
    const bookingRes = await pool.query(`
      INSERT INTO bookings (
        owner_id, sitter_id, start_datetime, end_datetime,
        total_price, status, city, street, postcode
      ) VALUES ($1, $2, $3, $4, NULL, 'saved', $5, $6, $7)
      RETURNING id
    `, [user_id, sitter_id, start_date, end_date, city, street, postcode]);

    const bookingId = bookingRes.rows[0].id;

    // 6. Insert pets
    const petInserts = selected_pets.map(pet_id =>
      pool.query(`INSERT INTO booking_pets (booking_id, pet_id) VALUES ($1, $2)`, [bookingId, pet_id])
    );
    await Promise.all(petInserts);

    res.status(200).json({
      message: 'Booking saved successfully',
      booking_id: bookingId,
      distance_km: parseFloat(distance.toFixed(2))
    });

  } catch (err) {
    console.error('Error in /search/save:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.get('/owner', async (req, res) => {
  const userId = Number(req.query.user_id);

  if (!userId) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const query = `
      SELECT p.id, p.name, s.name AS species
      FROM pets p
      LEFT JOIN species s ON p.species_id = s.id
      WHERE p.owner_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    res.status(200).json({ pets: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
