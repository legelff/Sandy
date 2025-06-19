-- Dummy Data Insertion (read it, dont blindly copy it!! just because it works for me doesn't mean it will work for you)

-- Users (already provided, assuming IDs 1-20)
INSERT INTO users (name, email, password, street, city, postcode, role, latitude, longitude)
VALUES
('Alice Smith', 'alice.smith@example.com', 'pass123', '123 Oak Avenue', 'Los Angeles', '90012', 'owner', 34.0522, -118.2437),
('Bob Johnson', 'bob.johnson@example.com', 'pass123', '456 Pine Street', 'New York', '10001', 'sitter', 40.7128, -74.0060),
('Charlie Brown', 'charlie.brown@example.com', 'pass123', '789 Elm Road', 'Philadelphia', '19102', 'owner', 39.9526, -75.1652),
('Diana Prince', 'diana.prince@example.com', 'pass123', '101 Maple Lane', 'Chicago', '60601', 'sitter', 41.8781, -87.6298),
('Ethan Hunt', 'ethan.hunt@example.com', 'pass123', '202 Cedar Boulevard', 'Houston', '77001', 'owner', 29.7604, -95.3698),
('Fiona Glenn', 'fiona.glenn@example.com', 'pass123', '303 Birch Court', 'Phoenix', '85001', 'sitter', 33.4484, -112.0740),
('George Costanza', 'george.c@example.com', 'pass123', '404 Willow Drive', 'San Antonio', '78201', 'owner', 29.4241, -98.4936),
('Hannah Montana', 'hannah.m@example.com', 'pass123', '505 Poplar Place', 'San Diego', '92101', 'sitter', 32.7157, -117.1611),
('Isaac Newton', 'isaac.n@example.com', 'pass123', '606 Apple Way', 'Dallas', '75201', 'owner', 32.7767, -96.7970),
('Jessica Rabbit', 'jessica.r@example.com', 'pass123', '707 Toon Street', 'San Jose', '95101', 'sitter', 37.3382, -121.8863),
('Kevin Hart', 'kevin.h@example.com', 'pass123', '808 Comedy Lane', 'Austin', '73301', 'owner', 30.2672, -97.7431),
('Laura Croft', 'laura.c@example.com', 'pass123', '909 Tomb Road', 'Jacksonville', '32099', 'sitter', 30.3322, -81.6557),
('Mike Tyson', 'mike.t@example.com', 'pass123', '111 Punch Boulevard', 'Fort Worth', '76101', 'owner', 32.7555, -97.3308),
('Nancy Drew', 'nancy.d@example.com', 'pass123', '222 Mystery Avenue', 'Columbus', '43201', 'sitter', 39.9612, -82.9988),
('Oliver Queen', 'oliver.q@example.com', 'pass123', '333 Arrow Street', 'Charlotte', '28201', 'owner', 35.2271, -80.8431),
('Penny Lane', 'penny.l@example.com', 'pass123', '444 Music Road', 'San Francisco', '94101', 'sitter', 37.7749, -122.4194),
('Quinn Fabray', 'quinn.f@example.com', 'pass123', '555 Glee Club Drive', 'Indianapolis', '46201', 'owner', 39.7684, -86.1581),
('Rachel Green', 'rachel.g@example.com', 'pass123', '666 Central Perk Street', 'Seattle', '98101', 'sitter', 47.6062, -122.3321),
('Steve Rogers', 'steve.r@example.com', 'pass123', '777 Shield Avenue', 'Denver', '80201', 'owner', 39.7392, -104.9903),
('Tina Belcher', 'tina.b@example.com', 'pass123', '888 Burger Street', 'Washington', '20001', 'sitter', 38.9072, -77.0369);

-- Species
INSERT INTO species (name) VALUES
('Dog'),
('Cat'),
('Bird'),
('Fish'),
('Reptile');

-- Owner_Subscriptions (uncomment is doesnt exist)
-- INSERT INTO owner_subscriptions (name, price, one_pet, all_species, requests_per_day, booking_fee, is_ad_free, extended) VALUES
-- ('Basic', 0.00, TRUE, FALSE, 1, 5.00, FALSE, FALSE),
-- ('Upgraded Basic', 5, FALSE, TRUE, 5, 2.50, TRUE, FALSE),
-- ('Premium', 9, FALSE, TRUE, 10, 0.00, TRUE, TRUE);

-- Sitter_Subscriptions (uncomment is doesnt exist)
-- INSERT INTO sitter_subscriptions (name, is_ad_free, pets_per_week, booking_fee, has_insurance, has_training) VALUES
-- ('Basic', FALSE, 0, 10.00, FALSE, FALSE),
-- ('Premium', TRUE, -1, 5.00, TRUE, TRUE),

-- Pet_Owners (linking users with role 'owner' to subscriptions)
INSERT INTO pet_owners (user_id, subscription_id) VALUES
(1, 2),  -- Alice Smith (Premium)
(3, 1),  -- Charlie Brown (Basic)
(5, 2),  -- Ethan Hunt (Premium)
(7, 1),  -- George Costanza (Basic)
(9, 3),  -- Isaac Newton (Elite)
(11, 1), -- Kevin Hart (Basic)
(13, 2), -- Mike Tyson (Premium)
(15, 1), -- Oliver Queen (Basic)
(17, 3), -- Quinn Fabray (Elite)
(19, 2); -- Steve Rogers (Premium)

-- Pet_Sitters (linking users with role 'sitter' to subscriptions)
INSERT INTO pet_sitters (user_id, subscription_id, experience_years, personality_and_motivation, extended) VALUES
(2, 2, 5, 'Loves all animals, patient and caring.', TRUE), -- Bob Johnson (Pro)
(4, 1, 2, 'Enjoys dog walking and playing.', FALSE), -- Diana Prince (Free)
(6, 2, 7, 'Experienced with exotic pets, very responsible.', TRUE), -- Fiona Glenn (Pro)
(8, 1, 3, 'Great with cats and small animals.', FALSE), -- Hannah Montana (Free)
(10, 2, 10, 'Professional pet care, certified in pet first aid.', TRUE), -- Jessica Rabbit (ProPlus)
(12, 1, 1, 'Enthusiastic and reliable.', FALSE), -- Laura Croft (Free)
(14, 2, 4, 'Dedicated to animal welfare, active and fun.', TRUE), -- Nancy Drew (Pro)
(16, 1, 2, 'Gentle and attentive to pet needs.', FALSE), -- Penny Lane (Free)
(18, 2, 8, 'Highly experienced with special needs pets.', TRUE), -- Rachel Green (ProPlus)
(20, 1, 3, 'Friendly and good with all breeds.', FALSE); -- Tina Belcher (Free)

-- Pets (for owners, especially Alice Smith)
INSERT INTO pets (owner_id, name, age, breed, personality, favorite_activities_and_needs, energy_level, comfort_with_strangers, vaccinations, sterilized, species_id) VALUES
(1, 'Buddy', 3, 'Golden Retriever', 'Friendly and playful', 'Long walks, fetch, cuddles', 5, 5, 'DHLPP, Rabies', TRUE, 1), -- Alice's Dog (Species: Dog)
(1, 'Whiskers', 2, 'Siamese', 'Independent but affectionate', 'Napping in sunbeams, chasing laser pointers', 3, 3, 'FVRCP, Rabies', TRUE, 2), -- Alice's Cat (Species: Cat)
(3, 'Max', 6, 'Labrador', 'Loyal and energetic', 'Running, swimming, training', 4, 4, 'DHLPP, Rabies', TRUE, 1), -- Charlie's Dog
(5, 'Mittens', 1, 'Domestic Shorthair', 'Curious and playful', 'Playing with toys, climbing', 4, 4, 'FVRCP, Rabies', TRUE, 2), -- Ethan's Cat
(7, 'Polly', 4, 'Cockatiel', 'Talkative and social', 'Perching on shoulders, singing', 2, 3, 'Psittacosis', FALSE, 3); -- George's Bird

-- Bookings (Alice Smith as owner, Bob Johnson as sitter)
INSERT INTO bookings (owner_id, sitter_id, start_datetime, end_datetime, total_price, status, city, street, postcode, service_tier) VALUES
(1, 1, '2025-07-01 09:00:00+02', '2025-07-05 17:00:00+02', 200.00, 'Confirmed', 'Los Angeles', '123 Oak Avenue', '90012', 'Premium'), -- Alice (owner_id 1) and Bob (sitter_id 1)
(3, 2, '2025-07-10 10:00:00+02', '2025-07-12 16:00:00+02', 120.00, 'Pending', 'Philadelphia', '789 Elm Road', '19102', 'Basic'), -- Charlie (owner_id 3) and Diana (sitter_id 2)
(1, 1, '2025-08-01 10:00:00+02', '2025-08-03 18:00:00+02', 150.00, 'Completed', 'Los Angeles', '123 Oak Avenue', '90012', 'Basic'); -- Alice (owner_id 1) and Bob (sitter_id 1)

-- Booking_Pets (linking pets to bookings)
INSERT INTO booking_pets (booking_id, pet_id) VALUES
(1, 1), -- Booking 1 (Alice/Bob) includes Buddy (Alice's Dog)
(1, 2), -- Booking 1 (Alice/Bob) includes Whiskers (Alice's Cat)
(2, 3), -- Booking 2 (Charlie/Diana) includes Max (Charlie's Dog)
(3, 1); -- Booking 3 (Alice/Bob) includes Buddy (Alice's Dog)

-- Employees (linking sitters to employees)
INSERT INTO employees (sitter_id, certifications) VALUES
(1, 'Pet First Aid, CPR Certified'), -- Bob Johnson (sitter_id 1)
(3, 'Advanced Pet Training'); -- Fiona Glenn (sitter_id 3)

-- Employee_Species (linking employees to species they can care for)
INSERT INTO employee_species (employee_id, species_id) VALUES
(1, 1), -- Bob (employee_id 1) can care for Dogs (species_id 1)
(1, 2), -- Bob (employee_id 1) can care for Cats (species_id 2)
(2, 1), -- Fiona (employee_id 2) can care for Dogs
(2, 2), -- Fiona (employee_id 2) can care for Cats
(2, 5); -- Fiona (employee_id 2) can care for Reptiles

-- Conversations (Alice and Bob, and others)
INSERT INTO conversations (user1_id, user2_id) VALUES
(1, 2),  -- Alice Smith (user_id 1) and Bob Johnson (user_id 2)
(3, 4),  -- Charlie Brown (user_id 3) and Diana Prince (user_id 4)
(1, 6);  -- Alice Smith (user_id 1) and Fiona Glenn (user_id 6)

-- Messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(1, 1, 'Hi Bob, is July 1st available for Buddy and Whiskers?'), -- Alice to Bob
(1, 2, 'Yes, Alice! I am available. Looking forward to it.'), -- Bob to Alice
(1, 1, 'Great! I will confirm the booking.'), -- Alice to Bob
(2, 3, 'Hi Diana, I need a sitter for Max next week.'), -- Charlie to Diana
(2, 4, 'Sure, Charlie. What dates are you thinking?'), -- Diana to Charlie
(3, 1, 'Hello Fiona, are you available for a last-minute booking?'), -- Alice to Fiona
(3, 6, 'Hi Alice, let me check my schedule.'); -- Fiona to Alice

-- Pet_Photos (for Alice's pets)
INSERT INTO pet_photos (url, pet_id) VALUES
('https://placehold.co/600x400/FF5733/FFFFFF?text=Buddy_Photo1', 1),
('https://placehold.co/600x400/33FF57/FFFFFF?text=Buddy_Photo2', 1),
('https://placehold.co/600x400/5733FF/FFFFFF?text=Whiskers_Photo1', 2);

-- Pet_Reviews (for Alice's pets based on Bob's bookings)
INSERT INTO pet_reviews (pet_id, rating, comment, booking_id) VALUES
(1, 5, 'Buddy was a joy to look after, very well-behaved!', 1), -- Bob reviewing Buddy from Booking 1
(2, 4, 'Whiskers was a bit shy at first but warmed up quickly.', 1), -- Bob reviewing Whiskers from Booking 1
(1, 5, 'Buddy is always a pleasure to care for.', 3); -- Bob reviewing Buddy from Booking 3

-- Sitter_Availability (for all sitters - full week availability)
INSERT INTO sitter_availability (sitter_id, day_of_week, start_time, end_time) VALUES
-- Bob Johnson (sitter_id: 1) - Full week availability
(1, 'Monday', '08:00:00', '18:00:00'),
(1, 'Tuesday', '08:00:00', '18:00:00'),
(1, 'Wednesday', '08:00:00', '18:00:00'),
(1, 'Thursday', '08:00:00', '18:00:00'),
(1, 'Friday', '08:00:00', '18:00:00'),
(1, 'Saturday', '09:00:00', '17:00:00'),
(1, 'Sunday', '09:00:00', '17:00:00'),

-- Diana Prince (sitter_id: 2) - Full week availability
(2, 'Monday', '09:00:00', '17:00:00'),
(2, 'Tuesday', '09:00:00', '17:00:00'),
(2, 'Wednesday', '09:00:00', '17:00:00'),
(2, 'Thursday', '09:00:00', '17:00:00'),
(2, 'Friday', '09:00:00', '17:00:00'),
(2, 'Saturday', '10:00:00', '16:00:00'),
(2, 'Sunday', '10:00:00', '16:00:00'),

-- Fiona Glenn (sitter_id: 3) - Full week availability
(3, 'Monday', '07:00:00', '19:00:00'),
(3, 'Tuesday', '07:00:00', '19:00:00'),
(3, 'Wednesday', '07:00:00', '19:00:00'),
(3, 'Thursday', '07:00:00', '19:00:00'),
(3, 'Friday', '07:00:00', '19:00:00'),
(3, 'Saturday', '08:00:00', '18:00:00'),
(3, 'Sunday', '08:00:00', '18:00:00'),

-- Hannah Montana (sitter_id: 4) - Full week availability
(4, 'Monday', '08:00:00', '16:00:00'),
(4, 'Tuesday', '08:00:00', '16:00:00'),
(4, 'Wednesday', '08:00:00', '16:00:00'),
(4, 'Thursday', '08:00:00', '16:00:00'),
(4, 'Friday', '08:00:00', '16:00:00'),
(4, 'Saturday', '09:00:00', '15:00:00'),
(4, 'Sunday', '09:00:00', '15:00:00'),

-- Jessica Rabbit (sitter_id: 5) - Full week availability
(5, 'Monday', '06:00:00', '20:00:00'),
(5, 'Tuesday', '06:00:00', '20:00:00'),
(5, 'Wednesday', '06:00:00', '20:00:00'),
(5, 'Thursday', '06:00:00', '20:00:00'),
(5, 'Friday', '06:00:00', '20:00:00'),
(5, 'Saturday', '07:00:00', '19:00:00'),
(5, 'Sunday', '07:00:00', '19:00:00'),

-- Laura Croft (sitter_id: 6) - Full week availability
(6, 'Monday', '09:00:00', '17:00:00'),
(6, 'Tuesday', '09:00:00', '17:00:00'),
(6, 'Wednesday', '09:00:00', '17:00:00'),
(6, 'Thursday', '09:00:00', '17:00:00'),
(6, 'Friday', '09:00:00', '17:00:00'),
(6, 'Saturday', '10:00:00', '16:00:00'),
(6, 'Sunday', '10:00:00', '16:00:00'),

-- Nancy Drew (sitter_id: 7) - Full week availability
(7, 'Monday', '08:00:00', '18:00:00'),
(7, 'Tuesday', '08:00:00', '18:00:00'),
(7, 'Wednesday', '08:00:00', '18:00:00'),
(7, 'Thursday', '08:00:00', '18:00:00'),
(7, 'Friday', '08:00:00', '18:00:00'),
(7, 'Saturday', '09:00:00', '17:00:00'),
(7, 'Sunday', '09:00:00', '17:00:00'),

-- Penny Lane (sitter_id: 8) - Full week availability
(8, 'Monday', '10:00:00', '16:00:00'),
(8, 'Tuesday', '10:00:00', '16:00:00'),
(8, 'Wednesday', '10:00:00', '16:00:00'),
(8, 'Thursday', '10:00:00', '16:00:00'),
(8, 'Friday', '10:00:00', '16:00:00'),
(8, 'Saturday', '11:00:00', '15:00:00'),
(8, 'Sunday', '11:00:00', '15:00:00'),

-- Rachel Green (sitter_id: 9) - Full week availability
(9, 'Monday', '07:00:00', '19:00:00'),
(9, 'Tuesday', '07:00:00', '19:00:00'),
(9, 'Wednesday', '07:00:00', '19:00:00'),
(9, 'Thursday', '07:00:00', '19:00:00'),
(9, 'Friday', '07:00:00', '19:00:00'),
(9, 'Saturday', '08:00:00', '18:00:00'),
(9, 'Sunday', '08:00:00', '18:00:00'),

-- Tina Belcher (sitter_id: 10) - Full week availability
(10, 'Monday', '09:00:00', '17:00:00'),
(10, 'Tuesday', '09:00:00', '17:00:00'),
(10, 'Wednesday', '09:00:00', '17:00:00'),
(10, 'Thursday', '09:00:00', '17:00:00'),
(10, 'Friday', '09:00:00', '17:00:00'),
(10, 'Saturday', '10:00:00', '16:00:00'),
(10, 'Sunday', '10:00:00', '16:00:00');

-- Sitter_Photos (for Bob Johnson)
INSERT INTO sitter_photos (url, sitter_id) VALUES
('https://placehold.co/600x400/3366FF/FFFFFF?text=Bob_Sitter_Photo1', 1),
('https://placehold.co/600x400/FF3366/FFFFFF?text=Bob_Sitter_Photo2', 1),
('https://placehold.co/600x400/66FF33/FFFFFF?text=Diana_Sitter_Photo1', 2);

-- User_Reviews (for Bob Johnson from Alice's booking)
INSERT INTO user_reviews (booking_id, rating, comment, user_id) VALUES
(1, 5, 'Bob was fantastic with Buddy and Whiskers! Highly recommend.', 1), -- Alice (user_id 1) reviewing Bob (sitter_id 1) for Booking 1
(3, 5, 'Another great experience with Bob. Very reliable and caring.', 1); -- Alice (user_id 1) reviewing Bob (sitter_id 1) for Booking 3

END;