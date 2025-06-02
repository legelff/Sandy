-- Dummy Data Insertion (read it, dont blindly copy it!! just because it works for me doesn't mean it will work for you)

-- Users (already provided, assuming IDs 1-20)
INSERT INTO users (name, email, password, street, city, postcode, role, latitude, longitude)
VALUES
('Alice Smith', 'alice.smith@example.com', 'pass123', '123 Oak Ave', 'Springfield', '12345', 'owner', 34.0522, -118.2437),
('Bob Johnson', 'bob.johnson@example.com', 'pass123', '45 Pine St', 'Rivertown', '67890', 'sitter', 40.7128, -74.0060),
('Charlie Brown', 'charlie.brown@example.com', 'pass123', '789 Elm Rd', 'Metropolis', '54321', 'owner', 39.9526, -75.1652),
('Diana Prince', 'diana.prince@example.com', 'pass123', '101 Maple Ln', 'Gotham', '98765', 'sitter', 34.0522, -118.2437),
('Ethan Hunt', 'ethan.hunt@example.com', 'pass123', '202 Cedar Blvd', 'Star City', '11223', 'owner', 40.7128, -74.0060),
('Fiona Glenn', 'fiona.glenn@example.com', 'pass123', '303 Birch Ct', 'Central City', '44556', 'sitter', 39.9526, -75.1652),
('George Costanza', 'george.c@example.com', 'pass123', '404 Willow Dr', 'Seinfeld', '77889', 'owner', 34.0522, -118.2437),
('Hannah Montana', 'hannah.m@example.com', 'pass123', '505 Poplar Pl', 'Nashville', '33445', 'sitter', 40.7128, -74.0060),
('Isaac Newton', 'isaac.n@example.com', 'pass123', '606 Apple Way', 'Cambridge', '00112', 'owner', 39.9526, -75.1652),
('Jessica Rabbit', 'jessica.r@example.com', 'pass123', '707 Toon St', 'Hollywood', '90210', 'sitter', 34.0522, -118.2437),
('Kevin Hart', 'kevin.h@example.com', 'pass123', '808 Comedy Ln', 'Philadelphia', '19101', 'owner', 40.7128, -74.0060),
('Laura Croft', 'laura.c@example.com', 'pass123', '909 Tomb Rd', 'London', 'SW1A 0AA', 'sitter', 39.9526, -75.1652),
('Mike Tyson', 'mike.t@example.com', 'pass123', '111 Punch Blvd', 'Las Vegas', '89101', 'owner', 34.0522, -118.2437),
('Nancy Drew', 'nancy.d@example.com', 'pass123', '222 Mystery Ave', 'River Heights', '00001', 'sitter', 40.7128, -74.0060),
('Oliver Queen', 'oliver.q@example.com', 'pass123', '333 Arrow St', 'Star City', '11223', 'owner', 39.9526, -75.1652),
('Penny Lane', 'penny.l@example.com', 'pass123', '444 Music Rd', 'Liverpool', 'L1 8JQ', 'sitter', 34.0522, -118.2437),
('Quinn Fabray', 'quinn.f@example.com', 'pass123', '555 Glee Club', 'Lima', '45801', 'owner', 40.7128, -74.0060),
('Rachel Green', 'rachel.g@example.com', 'pass123', '666 Central Perk', 'New York', '10001', 'sitter', 39.9526, -75.1652),
('Steve Rogers', 'steve.r@example.com', 'pass123', '777 Shield Ave', 'Brooklyn', '11201', 'owner', 34.0522, -118.2437),
('Tina Belcher', 'tina.b@example.com', 'pass123', '888 Burger St', 'Seymour''s Bay', '03030', 'sitter', 40.7128, -74.0060);

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
(1, 1, '2025-07-01 09:00:00+02', '2025-07-05 17:00:00+02', 200.00, 'Confirmed', 'Springfield', '123 Oak Ave', '12345', 'Premium'), -- Alice (owner_id 1) and Bob (sitter_id 1)
(3, 2, '2025-07-10 10:00:00+02', '2025-07-12 16:00:00+02', 120.00, 'Pending', 'Metropolis', '789 Elm Rd', '54321', 'Basic'), -- Charlie (owner_id 3) and Diana (sitter_id 2)
(1, 1, '2025-08-01 10:00:00+02', '2025-08-03 18:00:00+02', 150.00, 'Completed', 'Springfield', '123 Oak Ave', '12345', 'Basic'); -- Alice (owner_id 1) and Bob (sitter_id 1)

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

-- Sitter_Availability (for Bob Johnson)
INSERT INTO sitter_availability (sitter_id, day_of_week, start_time, end_time) VALUES
(1, 'Monday', '09:00:00', '17:00:00'),
(1, 'Tuesday', '09:00:00', '17:00:00'),
(1, 'Wednesday', '09:00:00', '17:00:00'),
(2, 'Friday', '10:00:00', '18:00:00'),
(2, 'Saturday', '10:00:00', '14:00:00');

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