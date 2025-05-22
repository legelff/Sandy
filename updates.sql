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