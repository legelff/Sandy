UPDATE owner_subscriptions SET 
    name = 'basic', 
    price = 0, 
    one_pet = true, 
    all_species = false, 
    requests_per_day = 5, 
    booking_fee = null, 
    is_ad_free = false, 
    extended = false
WHERE id = 1;

UPDATE owner_subscriptions SET 
    name = 'upgraded_basic', 
    price = 5, 
    one_pet = true, 
    all_species = false, 
    requests_per_day = -1, 
    booking_fee = null, 
    is_ad_free = true, 
    extended = false
WHERE id = 2;

UPDATE owner_subscriptions SET 
    name = 'premium', 
    price = 9, 
    one_pet = false, 
    all_species = true, 
    requests_per_day = -1, 
    booking_fee = null, 
    is_ad_free = true, 
    extended = true
WHERE id = 3;

UPDATE sitter_subscriptions SET
name = 'basic',
is_ad_free = false,
pets_per_week = 5,
booking_fee = null,
has_insurance = false,
has_training = false
WHERE id = 1;

UPDATE sitter_subscriptions SET
name = 'premium',
is_ad_free = true,
pets_per_week = -1,
booking_fee = null,
has_insurance = true,
has_training = true
WHERE id = 2;

INSERT INTO sitter_subscriptions (id, name, is_ad_free, pets_per_week, booking_fee, has_insurance, has_training) VALUES 
(1, 'basic', false, 5, null, false, false),
(2, 'premium', true, -1, null, true, true);

-- on user delete, cascade delete all references
-- pet owners
ALTER TABLE pet_owners
DROP CONSTRAINT pet_owners_user_id_fkey; -- Drop the existing constraint

ALTER TABLE pet_owners
ADD CONSTRAINT pet_owners_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- pets
ALTER TABLE pets
DROP CONSTRAINT pets_owner_id_fkey; -- Drop the existing constraint

ALTER TABLE pets
ADD CONSTRAINT pets_owner_id_fkey
FOREIGN KEY (owner_id) -- Assuming the foreign key column in 'pets' is named 'owner_id'
REFERENCES users(id)
ON DELETE CASCADE;

-- pet sitters
ALTER TABLE pet_sitters
DROP CONSTRAINT pet_sitters_user_id_fkey; -- Drop the existing constraint

ALTER TABLE pet_sitters
ADD CONSTRAINT pet_sitters_user_id_fkey
FOREIGN KEY (user_id) -- Assuming the foreign key column in 'pet_sitters' is named 'user_id'
REFERENCES users(id)
ON DELETE CASCADE;

-- sitter availability
ALTER TABLE sitter_availability
DROP CONSTRAINT sitter_availability_sitter_id_fkey; -- Drop the existing constraint

ALTER TABLE sitter_availability
ADD CONSTRAINT sitter_availability_sitter_id_fkey
FOREIGN KEY (sitter_id) -- Assuming the foreign key column in 'sitter_availability' is named 'sitter_id'
REFERENCES pet_sitters(id)
ON DELETE CASCADE;

-- sitter photos
ALTER TABLE sitter_photos
DROP CONSTRAINT sitter_photos_sitter_id_fkey; -- Drop the existing constraint

ALTER TABLE sitter_photos
ADD CONSTRAINT sitter_photos_sitter_id_fkey
FOREIGN KEY (sitter_id) -- Assuming the foreign key column in 'sitter_photos' is named 'sitter_id'
REFERENCES pet_sitters(id)
ON DELETE CASCADE;

-- pet photos
ALTER TABLE pet_photos
DROP CONSTRAINT pet_photos_pet_id_fkey; -- Drop the existing constraint

ALTER TABLE pet_photos
ADD CONSTRAINT pet_photos_pet_id_fkey
FOREIGN KEY (pet_id) -- Assuming the foreign key column in 'pet_photos' is named 'pet_id'
REFERENCES pets(id)
ON DELETE CASCADE;