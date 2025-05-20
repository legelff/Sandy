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

// Geocode helper
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

// Haversine formula
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

router.get('/sitter', async (req, res) => {
  const sitterId = req.query.sitter_id;
  const { street_address, city, postcode } = req.query;

  if (!sitterId || !street_address || !city || !postcode) {
    return res.status(400).json({ error: 'sitter_id and full address (street_address, city, postcode) are required' });
  }

  try {
    const sitterQuery = `
      SELECT ps.id AS sitter_id, u.name AS sitter_name, ps.experience_years, ps.personality_and_motivation,
             ss.name AS sitter_subscription, u.latitude, u.longitude,
             EXISTS (SELECT 1 FROM employees e WHERE e.sitter_id = ps.id) AS is_employee
      FROM pet_sitters ps
      JOIN users u ON ps.user_id = u.id
      JOIN sitter_subscriptions ss ON ss.id = ps.subscription_id
      WHERE ps.id = $1
    `;
    const sitterResult = await pool.query(sitterQuery, [sitterId]);
    if (sitterResult.rows.length === 0) return res.status(404).json({ error: 'Sitter not found' });
    const sitter = sitterResult.rows[0];

    // Distance calculation
    const sitterCoords = { lat: sitter.latitude, lng: sitter.longitude };
    const ownerCoords = await geocode(`${street_address}, ${city}, ${postcode}`);
    const distance = getDistanceKm(ownerCoords.lat, ownerCoords.lng, sitterCoords.lat, sitterCoords.lng);

    const imagesRes = await pool.query(`SELECT url FROM sitter_photos WHERE sitter_id = $1 LIMIT 3`, [sitterId]);
    const sitterImages = imagesRes.rows.map(img => img.url);
    const mainImg = sitterImages[0] || null;

    const ratingRes = await pool.query(
      `SELECT ROUND(AVG(rating))::int AS avg_rating FROM user_reviews WHERE user_id = (
        SELECT user_id FROM pet_sitters WHERE id = $1
      )`, [sitterId]);
    const averageRating = ratingRes.rows[0]?.avg_rating || 0;

    const bookingRes = await pool.query(`
      SELECT b.start_datetime, b.end_datetime, p.name AS pet_name
      FROM bookings b
      JOIN booking_pets bp ON b.id = bp.booking_id
      JOIN pets p ON p.id = bp.pet_id
      WHERE b.sitter_id = $1
      ORDER BY b.start_datetime DESC LIMIT 5
    `, [sitterId]);
    const selectedPets = bookingRes.rows.map(b => b.pet_name);
    const startDate = bookingRes.rows[0]?.start_datetime || null;
    const endDate = bookingRes.rows[0]?.end_datetime || null;

    let supportedPets = ['dog', 'cat'];
    let certifications = [];
    if (sitter.is_employee) {
      const speciesRes = await pool.query(`
        SELECT s.name FROM employee_species es
        JOIN species s ON s.id = es.species_id
        JOIN employees e ON e.id = es.employee_id
        WHERE e.sitter_id = $1
      `, [sitterId]);
      supportedPets = speciesRes.rows.map(s => s.name);

      const certRes = await pool.query(`SELECT certifications FROM employees WHERE sitter_id = $1`, [sitterId]);
      certifications = certRes.rows[0]?.certifications?.split(',') || [];
    }

    const reviewsRes = await pool.query(`
      SELECT ur.id AS review_id, u.name, ur.rating, ur.comment AS review, NULL AS profile_picture
      FROM user_reviews ur
      JOIN users u ON u.id = ur.user_id
      WHERE ur.booking_id IN (SELECT id FROM bookings WHERE sitter_id = $1)
      LIMIT 5
    `, [sitterId]);
    const sitterReviews = reviewsRes.rows;

    res.status(200).json({
      sitter_id: sitter.sitter_id,
      sitter_name: sitter.sitter_name,
      main_img: mainImg,
      average_rating: averageRating,
      start_date: startDate,
      end_date: endDate,
      selected_pets: selectedPets,
      distance: parseFloat(distance.toFixed(2)),
      service_tier: sitter.is_employee ? 'Premium' : 'Basic',
      relevancy_score: parseFloat((Math.random() * 2 + 8).toFixed(1)),
      sitter_subscription: sitter.is_employee ? 'Employee' : sitter.sitter_subscription,
      sitter_experience: sitter.experience_years,
      sitter_images: sitterImages,
      sitter_personality: sitter.personality_and_motivation,
      sitter_certifications: certifications,
      sitter_reviews: sitterReviews,
      supported_pets: supportedPets,
      rate_negotiable: false
    });

  } catch (err) {
    console.error('Error in /sitter:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
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
