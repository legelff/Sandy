const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Sandy',
    password: process.env.DB_PASSWORD,
    port: 5432,
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
    } = req.body;

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
  
// Add a photo for a specific pet
router.post('/photos/:petId', upload.single('photo'), async (req, res) => {
    const petId = parseInt(req.params.petId);
    const photoPath = `/uploads/${req.file.filename}`; // Public URL path
  
    const client = await pool.connect();
    try {
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
router.get('/owner/:ownerId', async (req, res) => {
    const client = await pool.connect();
    try {
      const ownerId = parseInt(req.params.ownerId);
  
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
