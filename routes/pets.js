const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Sandy',
  password: 'process.env.DB_PASSWORD',
  port: 5432,
});

// POST /pets - Add a new pet
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      owner_id,
      name,
      age,
      breed,
      personality,
      favorite_activities_and_needs,
      energy_level,
      comfort_with_strangers,
      vaccinations,
      sterilized,
    } = req.body;

    const insertPet = await client.query(
      `INSERT INTO pets 
        (owner_id, name, age, breed, personality, favorite_activities_and_needs, energy_level, comfort_with_strangers, vaccinations, sterilized)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        owner_id,
        name,
        age,
        breed,
        personality,
        favorite_activities_and_needs,
        energy_level,
        comfort_with_strangers,
        vaccinations,
        sterilized,
      ]
    );

    res.status(201).json({
      message: 'Pet added successfully.',
      pet: insertPet.rows[0],
    });
  } catch (err) {
    console.error('Error adding pet:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});


router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const petId = req.params.id;

    await client.query('BEGIN');

    // 1. Delete pet_photos
    await client.query('DELETE FROM pet_photos WHERE pet_id = $1', [petId]);

    // 2. Delete pet_reviews
    await client.query('DELETE FROM pet_reviews WHERE pet_id = $1', [petId]);

    // 3. Delete from booking_pets
    await client.query('DELETE FROM booking_pets WHERE pet_id = $1', [petId]);

    // 4. Finally, delete the pet itself
    const result = await client.query('DELETE FROM pets WHERE id = $1 RETURNING *', [petId]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pet not found' });
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Pet deleted successfully', pet: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting pet:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});


module.exports = router;
