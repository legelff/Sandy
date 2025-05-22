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

router.get('/', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id is required' });

  try {
    // Get owner's name and subscription
    const ownerQuery = `
      SELECT u.name, os.name AS subscription
      FROM users u
      JOIN pet_owners po ON po.user_id = u.id
      JOIN owner_subscriptions os ON po.subscription_id = os.id
      WHERE u.id = $1
    `;
    const ownerRes = await pool.query(ownerQuery, [userId]);
    if (ownerRes.rows.length === 0) return res.status(404).json({ error: 'Owner not found' });
    const { name, subscription } = ownerRes.rows[0];

    // Get all pets for this owner
    const petsQuery = `
      SELECT p.id, p.name, s.name AS species
      FROM pets p
      JOIN species s ON s.id = p.species_id
      WHERE p.owner_id = $1
    `;
    const petsRes = await pool.query(petsQuery, [userId]);
    const allPets = petsRes.rows;

    // Get bookings for these pets
    const bookingsQuery = `
      SELECT bp.pet_id, b.status, b.start_datetime, b.end_datetime, b.sitter_id
      FROM booking_pets bp
      JOIN bookings b ON b.id = bp.booking_id
      WHERE b.owner_id = $1
    `;
    const bookingsRes = await pool.query(bookingsQuery, [userId]);
    const now = new Date();

    const pets = {
      active: [],
      requested: [],
      inactive: []
    };

    for (const pet of allPets) {
      const bookings = bookingsRes.rows.filter(b => b.pet_id === pet.id);
      let placed = false;

      for (const b of bookings) {
        const start = new Date(b.start_datetime);
        const end = new Date(b.end_datetime);

        if (b.status === 'confirmed' || b.status === 'accepted') {
          if (start <= now && end >= now) {
            pets.active.push({ ...pet, sitter_id: b.sitter_id, last_bpm: null });
            placed = true;
            break;
          } else {
            pets.requested.push(pet);
            placed = true;
            break;
          }
        } else if (b.status === 'requested') {
          pets.requested.push(pet);
          placed = true;
          break;
        }
      }

      if (!placed) pets.inactive.push(pet);
    }

    res.status(200).json({ name, subscription, pets });
  } catch (err) {
    console.error('Error in /home:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.get('/sitter', async (req, res) => {
  const userId = Number(req.query.user_id);

  if (!userId) {
    return res.status(400).json({ error: 'Valid user_id is required' });
  }

  try {
    // 1. Get sitter name and subscription
    const sitterQuery = `
      SELECT u.name, ss.name AS subscription
      FROM users u
      JOIN pet_sitters ps ON ps.user_id = u.id
      JOIN sitter_subscriptions ss ON ps.subscription_id = ss.id
      WHERE u.id = $1
    `;
    const sitterResult = await pool.query(sitterQuery, [userId]);
    if (sitterResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sitter not found' });
    }

    const sitter = sitterResult.rows[0];

    // 2. Get active pets (from active bookings)
    const activePetsQuery = `
      SELECT p.name, s.name AS species, p.owner_id, b.id AS booking_id
      FROM bookings b
      JOIN booking_pets bp ON b.id = bp.booking_id
      JOIN pets p ON p.id = bp.pet_id
      JOIN species s ON s.id = p.species_id
      WHERE b.sitter_id = (
        SELECT id FROM pet_sitters WHERE user_id = $1
      )
      AND b.status IN ('accepted', 'confirmed')
    `;
    const activePetsResult = await pool.query(activePetsQuery, [userId]);

    // 3. Get historical pets (from completed bookings + ratings)
    const historyQuery = `
      SELECT p.name, s.name AS species, pr.rating
      FROM bookings b
      JOIN booking_pets bp ON b.id = bp.booking_id
      JOIN pets p ON p.id = bp.pet_id
      JOIN species s ON s.id = p.species_id
      JOIN pet_reviews pr ON pr.booking_id = b.id AND pr.pet_id = p.id
      WHERE b.sitter_id = (
        SELECT id FROM pet_sitters WHERE user_id = $1
      )
      AND b.status = 'completed'
    `;
    const historyResult = await pool.query(historyQuery, [userId]);

    res.status(200).json({
      name: sitter.name,
      subscription: sitter.subscription,
      pets: {
        active: activePetsResult.rows.map(pet => ({
          name: pet.name,
          species: pet.species,
          last_bpm: null, // placeholder (not available in schema),
          owner_id: pet.owner_id
        })),
        history: historyResult.rows.map(pet => ({
          name: pet.name,
          species: pet.species,
          rating: pet.rating
        }))
      }
    });

  } catch (err) {
    console.error('Error in /home/sitter:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
