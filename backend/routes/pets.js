const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

const pool = new Pool({
  user: process.env.DB_USER ?? 'postgres',
  host: 'localhost',
  database: process.env.DB_NAME ?? 'Sandy',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ?? 5432,
});

// Set storage destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Add a new pet 
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      name,
      age,
      breed,
      personality,
      favorite_activities_and_needs,
      energy_level,
      comfort_with_strangers,
      vaccinations,
      sterilized,
      species_id,
      owner_id // Expect owner_id to come from the request body
    } = req.body;

    if (!owner_id) {
      return res.status(400).json({ error: 'owner_id is required' });
    }

    const insertPet = await client.query(
      `INSERT INTO pets 
        (owner_id, name, age, breed, personality, favorite_activities_and_needs, energy_level, comfort_with_strangers, vaccinations, sterilized, species_id)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        species_id
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

//DELETE a pet
router.delete('/:id', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const petId = req.params.id;

    // First check if the pet belongs to the authenticated user
    const petCheck = await client.query(
      'SELECT owner_id FROM pets WHERE id = $1',
      [petId]
    );

    if (petCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }



    await client.query('BEGIN');

    // 1. Delete pet_photos
    await client.query('DELETE FROM pet_photos WHERE pet_id = $1', [petId]);

    // 2. Delete pet_reviews
    await client.query('DELETE FROM pet_reviews WHERE pet_id = $1', [petId]);

    // 3. Delete from booking_pets
    await client.query('DELETE FROM booking_pets WHERE pet_id = $1', [petId]);

    // 4. Finally, delete the pet itself
    const result = await client.query('DELETE FROM pets WHERE id = $1 RETURNING *', [petId]);

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

// Add a photo for a specific pet
router.post('/photos/:petId', verifyToken, upload.single('photo'), async (req, res) => {
  const petId = parseInt(req.params.petId);
  const photoPath = `/uploads/${req.file.filename}`;

  const client = await pool.connect();
  try {
    // Check if the pet belongs to the authenticated user
    const petCheck = await client.query(
      'SELECT owner_id FROM pets WHERE id = $1',
      [petId]
    );

    if (petCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (petCheck.rows[0].owner_id !== req.user.id && req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Not authorized to add photos to this pet' });
    }

    const result = await client.query(
      `INSERT INTO pet_photos (url, pet_id) VALUES ($1, $2) RETURNING *`,
      [photoPath, petId]
    );

    res.status(201).json({ message: 'Photo uploaded.', photo: result.rows[0] });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

// GET all pets for a specific owner
router.get('/owner/:ownerId', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const ownerId = parseInt(req.params.ownerId);

    // Check if user is requesting their own pets or is an employee
    if (ownerId !== req.user.id && req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Not authorized to view these pets' });
    }

    const result = await client.query(
      `SELECT * FROM pets WHERE owner_id = $1 ORDER BY id ASC`,
      [ownerId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching pets:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
