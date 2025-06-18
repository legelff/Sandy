var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Database configuration for Sandy database
const pool = new Pool({
    user: process.env.DB_USER ?? 'postgres',
    host: 'localhost',
    database: process.env.DB_NAME ?? 'Sandy',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ?? 5432,
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: 'Details not provided',
                errType: 'All'
            });
        }

        // Check if user exists
        const userQuery = 'SELECT id, email, password, role FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                status: 400,
                message: 'Email doesn\'t exist',
                errType: 'Email'
            });
        }

        const user = userResult.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                status: 400,
                message: 'Password incorrect',
                errType: 'Password'
            });
        }

        // Generate JWT token using the imported JWT_SECRET
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Get user details based on role
        let userDetails = { ...user };
        delete userDetails.password; // Remove password from response

        if (user.role === 'owner') {
            const ownerQuery = 'SELECT * FROM pet_owners WHERE user_id = $1';
            const ownerResult = await pool.query(ownerQuery, [user.id]);

            if (ownerResult.rows.length > 0) {
                userDetails.owner_details = ownerResult.rows[0];
            }

            // Get pets
            const petsQuery = 'SELECT * FROM pets WHERE owner_id = $1';
            const petsResult = await pool.query(petsQuery, [user.id]);
            userDetails.pets = petsResult.rows;

        } else if (user.role === 'sitter') {
            const sitterQuery = `
        SELECT ps.*, 
               json_agg(DISTINCT sa.*) FILTER (WHERE sa.id IS NOT NULL) AS availability,
               json_agg(DISTINCT sp.*) FILTER (WHERE sp.id IS NOT NULL) AS photos
        FROM pet_sitters ps
        LEFT JOIN sitter_availability sa ON ps.id = sa.sitter_id
        LEFT JOIN sitter_photos sp ON ps.id = sp.sitter_id
        WHERE ps.user_id = $1
        GROUP BY ps.id
      `;
            const sitterResult = await pool.query(sitterQuery, [user.id]);

            if (sitterResult.rows.length > 0) {
                userDetails.sitter_details = sitterResult.rows[0];
            }
        }

        // Return success response
        return res.status(200).json({
            status: 200,
            token,
            user: userDetails
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong'
        });
    }
});


router.post('/register/owner', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            street,
            city,
            postcode,
            subscription_id,
            pets
        } = req.body;

        // Validate request body
        if (!name || !email || !password || !street || !city || !postcode || !subscription_id) {
            return res.status(400).json({
                status: 400,
                message: 'Details not provided',
                errType: 'All'
            });
        }

        // Check if email already exists
        const emailCheckQuery = 'SELECT email FROM users WHERE email = $1';
        const emailCheckResult = await pool.query(emailCheckQuery, [email]);

        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({
                status: 400,
                message: 'Email already exists',
                errType: 'Email'
            });
        }

        // Set latitude and longitude to null
        const latitude = null;
        const longitude = null;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Begin transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get subscription details - now required
            let subscriptionDetails = null;

            const subQuery = `
                SELECT id, name, one_pet, all_species, requests_per_day 
                FROM owner_subscriptions 
                WHERE id = $1
            `;
            const subResult = await client.query(subQuery, [subscription_id]);

            if (subResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid subscription plan',
                    errType: 'Subscription'
                });
            }

            subscriptionDetails = subResult.rows[0];

            // Validate pet limit based on subscription
            if (subscriptionDetails && pets && Array.isArray(pets)) {
                if (subscriptionDetails.one_pet && pets.length > 1) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({
                        status: 400,
                        message: 'Your subscription plan only allows 1 pet',
                        errType: 'SubscriptionLimit',
                        limit: 1,
                        subscription_name: subscriptionDetails.name
                    });
                }
            }

            // Insert user with geocoding data
            const insertUserQuery = `
                INSERT INTO users (name, email, password, street, city, postcode, role, latitude, longitude)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `;

            const userValues = [
                name,
                email,
                hashedPassword,
                street,
                city,
                postcode,
                'owner',
                latitude,
                longitude
            ];

            const userResult = await client.query(insertUserQuery, userValues);
            const userId = userResult.rows[0].id;

            // Insert pet owner
            const insertOwnerQuery = `
                INSERT INTO pet_owners (user_id, subscription_id)
                VALUES ($1, $2)
                RETURNING id
            `;

            const ownerValues = [userId, subscription_id];
            const ownerResult = await client.query(insertOwnerQuery, ownerValues);
            const ownerId = ownerResult.rows[0].id;

            // Insert pets if provided
            const insertedPets = [];

            if (pets && Array.isArray(pets)) {
                for (const pet of pets) {
                    // Validate required pet fields
                    if (!pet.name || !pet.species || pet.age === undefined || pet.age === null ||
                        !pet.breed || pet.vaccinations === undefined || pet.vaccinations === null || pet.sterilized === undefined || pet.sterilized === null) {
                        await client.query('ROLLBACK');
                        return res.status(400).json({
                            status: 400,
                            message: 'Pet details incomplete. Name, species, age, breed, vaccinations, and sterilized status are required.',
                            errType: 'PetValidation'
                        });
                    }

                    // Validate species restrictions if subscription has limitations
                    if (subscriptionDetails && !subscriptionDetails.all_species && pet.species) {
                        const allowedSpecies = ['dog', 'cat'];
                        const petSpecies = pet.species.toLowerCase();

                        if (!allowedSpecies.includes(petSpecies)) {
                            await client.query('ROLLBACK');
                            return res.status(400).json({
                                status: 400,
                                message: `Your subscription plan only allows Dogs and Cats. "${pet.species}" is not allowed.`,
                                errType: 'SpeciesRestriction',
                                allowed_species: ['Dog', 'Cat'],
                                subscription_name: subscriptionDetails.name
                            });
                        }
                    }

                    // Get or create species
                    let speciesId = null;
                    if (pet.species) {
                        const speciesQuery = 'SELECT id FROM species WHERE LOWER(name) = LOWER($1)';
                        const speciesResult = await client.query(speciesQuery, [pet.species]);

                        if (speciesResult.rows.length > 0) {
                            speciesId = speciesResult.rows[0].id;
                        } else {
                            // Insert new species
                            const insertSpeciesQuery = 'INSERT INTO species (name) VALUES ($1) RETURNING id';
                            const newSpeciesResult = await client.query(insertSpeciesQuery, [pet.species]);
                            speciesId = newSpeciesResult.rows[0].id;
                        }
                    }

                    // Map energy_level string to integer
                    let energyLevelValue = pet.energy_level;
                    if (typeof energyLevelValue === 'string') {
                        const energyLevelMap = {
                            'low': 1,
                            'medium': 2,
                            'high': 3
                        };
                        energyLevelValue = energyLevelMap[energyLevelValue.toLowerCase()] || null;
                    }

                    // Map comfort_with_strangers string to integer
                    let comfortWithStrangersValue = pet.comfort_with_strangers;
                    if (typeof comfortWithStrangersValue === 'string') {
                        const comfortLevelMap = {
                            'poor': 1,
                            'average': 2,
                            'good': 3
                        };
                        comfortWithStrangersValue = comfortLevelMap[comfortWithStrangersValue.toLowerCase()] || null;
                    }

                    const insertPetQuery = `
                        INSERT INTO pets (
                            owner_id, name, age, breed, personality, 
                            favorite_activities_and_needs, energy_level,
                            comfort_with_strangers, vaccinations, sterilized, species_id
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        RETURNING id
                    `;

                    const petValues = [
                        userId, // owner_id is the user_id according to your schema
                        pet.name,
                        pet.age,
                        pet.breed,
                        pet.personality || null,
                        pet.favorite_activities_and_needs || null,
                        energyLevelValue,
                        comfortWithStrangersValue,
                        pet.vaccinations,
                        pet.sterilized,
                        speciesId
                    ];

                    const petResult = await client.query(insertPetQuery, petValues);
                    const petId = petResult.rows[0].id;

                    // Insert pet photos if available
                    const insertedPhotos = [];
                    if (pet.photos && Array.isArray(pet.photos)) {
                        for (const photoUrl of pet.photos) {
                            const insertPhotoQuery = `
                                INSERT INTO pet_photos (pet_id, url)
                                VALUES ($1, $2)
                                RETURNING id, url
                            `;
                            const photoResult = await client.query(insertPhotoQuery, [petId, photoUrl]);
                            insertedPhotos.push(photoResult.rows[0]);
                        }
                    }

                    // Track inserted pet for response
                    insertedPets.push({
                        id: petId,
                        ...pet,
                        energy_level: energyLevelValue,
                        comfort_with_strangers: comfortWithStrangersValue,
                        species_id: speciesId,
                        photos: insertedPhotos
                    });
                }
            }

            await client.query('COMMIT');

            // Generate JWT token
            const token = jwt.sign(
                { id: userId, email, role: 'owner' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Get complete user details for response
            const userQuery = `
                SELECT u.*, po.id as owner_id, po.subscription_id,
                       os.name as subscription_name, os.one_pet, os.all_species,
                       os.requests_per_day, os.is_ad_free, os.extended
                FROM users u
                LEFT JOIN pet_owners po ON u.id = po.user_id
                LEFT JOIN owner_subscriptions os ON po.subscription_id = os.id
                WHERE u.id = $1
            `;
            const userDetailsResult = await pool.query(userQuery, [userId]);
            const userDetails = userDetailsResult.rows[0];
            delete userDetails.password; // Remove password from response

            // Get pets with all details
            const petsQuery = `
                SELECT p.*, 
                       json_agg(
                           json_build_object('id', pp.id, 'url', pp.url)
                       ) FILTER (WHERE pp.id IS NOT NULL) AS photos,
                       s.name as species_name
                FROM pets p
                LEFT JOIN pet_photos pp ON p.id = pp.pet_id
                LEFT JOIN species s ON p.species_id = s.id
                WHERE p.owner_id = $1
                GROUP BY p.id, s.name
            `;
            const petsResult = await pool.query(petsQuery, [userId]);
            userDetails.pets = petsResult.rows;

            // Return success response
            return res.status(200).json({
                status: 200,
                token,
                user: userDetails
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Register owner error:', error);
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


router.post('/register/sitter', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            street,
            city,
            postcode,
            experience_years,
            personality_and_motivation,
            subscription_id,
            availability,
            photos
        } = req.body;

        // Validate request body - now includes subscription_id and availability as required
        if (!name || !email || !password || !street || !city || !postcode || !subscription_id || !availability || !Array.isArray(availability) || availability.length === 0) {
            return res.status(400).json({
                status: 400,
                message: 'Details not provided',
                errType: 'All'
            });
        }

        // Check if email already exists
        const emailCheckQuery = 'SELECT email FROM users WHERE email = $1';
        const emailCheckResult = await pool.query(emailCheckQuery, [email]);

        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({
                status: 400,
                message: 'Email already exists',
                errType: 'Email'
            });
        }

        // Set latitude and longitude to null
        const latitude = null;
        const longitude = null;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Begin transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Validate sitter subscription_id before proceeding
            const subCheck = await client.query(
                'SELECT id FROM sitter_subscriptions WHERE id = $1',
                [subscription_id]
            );
            if (subCheck.rows.length === 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid subscription plan selected',
                    errType: 'Subscription'
                });
            }

            // Insert user with geocoded coordinates
            const insertUserQuery = `
        INSERT INTO users (name, email, password, street, city, postcode, role, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;

            const userValues = [
                name,
                email,
                hashedPassword,
                street,
                city,
                postcode,
                'sitter',
                latitude,
                longitude
            ];

            const userResult = await client.query(insertUserQuery, userValues);
            const userId = userResult.rows[0].id;

            // Insert sitter with validated subscription_id
            const insertSitterQuery = `
    INSERT INTO pet_sitters (
      user_id, 
      subscription_id, 
      experience_years, 
      personality_and_motivation,
      extended
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
`;

            const sitterValues = [
                userId,
                subscription_id, // Now guaranteed to be valid
                experience_years || 0,
                personality_and_motivation || null,
                false // default value for extended
            ];

            const sitterResult = await client.query(insertSitterQuery, sitterValues);
            const sitterId = sitterResult.rows[0].id;

            // Insert availability (now required)
            if (availability && Array.isArray(availability)) {
                for (const slot of availability) {
                    // Validate each availability slot
                    if (!slot.day_of_week) {
                        return res.status(400).json({
                            status: 400,
                            message: 'Each availability slot must include day_of_week',
                            errType: 'Availability'
                        });
                    }

                    const insertAvailabilityQuery = `
              INSERT INTO sitter_availability (sitter_id, day_of_week, start_time, end_time)
              VALUES ($1, $2, $3, $4)
            `;

                    await client.query(insertAvailabilityQuery, [
                        sitterId,
                        slot.day_of_week,
                        slot.start_time || null,
                        slot.end_time || null
                    ]);
                }
            }

            // Insert sitter photos if available
            if (photos && Array.isArray(photos)) {
                for (const photoUrl of photos) {
                    const insertPhotoQuery = `
            INSERT INTO sitter_photos (sitter_id, url)
            VALUES ($1, $2)
          `;

                    await client.query(insertPhotoQuery, [sitterId, photoUrl]);
                }
            }

            await client.query('COMMIT');

            // Generate JWT token
            const token = jwt.sign(
                { id: userId, email, role: 'sitter' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Get user details including geolocation data
            const userQuery = `
        SELECT u.id, u.name, u.email, u.role, u.street, u.city, u.postcode, 
               u.latitude, u.longitude,
               ps.id as sitter_id, ps.experience_years, ps.personality_and_motivation, ps.extended, 
               ss.name as subscription_name, ss.is_ad_free, ss.pets_per_week, 
               ss.booking_fee, ss.has_insurance, ss.has_training
        FROM users u
        LEFT JOIN pet_sitters ps ON u.id = ps.user_id
        LEFT JOIN sitter_subscriptions ss ON ps.subscription_id = ss.id
        WHERE u.id = $1
      `;
            const userDetailsResult = await pool.query(userQuery, [userId]);
            const userDetails = userDetailsResult.rows[0];
            delete userDetails.password; // Remove password from response

            // Get availability 
            const availabilityQuery = `
        SELECT * FROM sitter_availability 
        WHERE sitter_id = $1
        ORDER BY day_of_week, start_time
      `;
            const availabilityResult = await pool.query(availabilityQuery, [sitterId]);
            userDetails.availability = availabilityResult.rows;

            // Get photos
            const photosQuery = 'SELECT id, url FROM sitter_photos WHERE sitter_id = $1';
            const photosResult = await pool.query(photosQuery, [sitterId]);
            userDetails.photos = photosResult.rows;

            // Return success response
            return res.status(200).json({
                status: 200,
                token,
                user: userDetails
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Register sitter error:', error);

        // Check for specific error types and provide better error messages
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                status: 400,
                message: 'This email is already registered',
                errType: 'Email'
            });
        } else if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                status: 400,
                message: 'Invalid subscription or reference data',
                errType: 'Subscription'
            });
        } else if (error.message && error.message.includes('geocod')) {
            return res.status(400).json({
                status: 400,
                message: 'Could not verify address location. Please check your address information.',
                errType: 'Location'
            });
        }

        return res.status(500).json({
            status: 500,
            message: 'Something went wrong'
        });
    }
});


router.get('/user/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from the JWT token
        console.log(userId);

        // Get user data
        const userQuery = 'SELECT id, name, email, role, street, city, postcode FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Get role-specific data
        if (user.role === 'owner') {
            // Get owner details
            const ownerQuery = `
        SELECT po.*, os.name as subscription_name
        FROM pet_owners po
        LEFT JOIN owner_subscriptions os ON po.subscription_id = os.id
        WHERE po.user_id = $1
      `;
            const ownerResult = await pool.query(ownerQuery, [userId]);

            if (ownerResult.rows.length > 0) {
                user.owner_details = ownerResult.rows[0];
            }

            // Get pets
            const petsQuery = `
        SELECT p.*, 
               json_agg(pp.*) FILTER (WHERE pp.id IS NOT NULL) AS photos,
               s.name as species_name
        FROM pets p
        LEFT JOIN pet_photos pp ON p.id = pp.pet_id
        LEFT JOIN species s ON p.species_id = s.id
        WHERE p.owner_id = $1
        GROUP BY p.id, s.name
      `;
            const petsResult = await pool.query(petsQuery, [userId]);
            user.pets = petsResult.rows;

        } else if (user.role === 'sitter') {
            // Get sitter details
            const sitterQuery = `
        SELECT ps.*, ss.name as subscription_name
        FROM pet_sitters ps
        LEFT JOIN sitter_subscriptions ss ON ps.subscription_id = ss.id
        WHERE ps.user_id = $1
      `;
            const sitterResult = await pool.query(sitterQuery, [userId]);

            if (sitterResult.rows.length > 0) {
                user.sitter_details = sitterResult.rows[0];

                // Get availability
                const availabilityQuery = `
          SELECT * FROM sitter_availability 
          WHERE sitter_id = $1
          ORDER BY day_of_week, start_time
        `;
                const availabilityResult = await pool.query(availabilityQuery, [user.sitter_details.id]);
                user.availability = availabilityResult.rows;

                // Get photos
                const photosQuery = 'SELECT * FROM sitter_photos WHERE sitter_id = $1';
                const photosResult = await pool.query(photosQuery, [user.sitter_details.id]);
                user.photos = photosResult.rows;
            }
        }

        return res.status(200).json({
            status: 200,
            user
        });

    } catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong'
        });
    }
});

module.exports = router;