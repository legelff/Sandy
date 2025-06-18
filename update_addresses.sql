-- SQL Query to Update User Addresses to Real Locations in Flanders, Belgium

UPDATE users SET 
    street = 'Rue de la Loi 175',
    city = 'Brussels',
    postcode = '1040',
    latitude = 50.8418,
    longitude = 4.3753
WHERE id = 1;

UPDATE users SET 
    street = 'Kammenstraat 81',
    city = 'Antwerpen',
    postcode = '2000',
    latitude = 51.2149,
    longitude = 4.4051
WHERE id = 2;

UPDATE users SET 
    street = 'Emile Clauslaan 43',
    city = 'Gent',
    postcode = '9000',
    latitude = 51.0446,
    longitude = 3.7281
WHERE id = 3;

UPDATE users SET 
    street = 'Tiensesteenweg 150',
    city = 'Leuven',
    postcode = '3000',
    latitude = 50.8726,
    longitude = 4.7043
WHERE id = 4;

UPDATE users SET 
    street = 'Stationstraat 12',
    city = 'Mechelen',
    postcode = '2800',
    latitude = 51.0255,
    longitude = 4.4781
WHERE id = 5;

UPDATE users SET 
    street = 'Dok Noord 7',
    city = 'Gent',
    postcode = '9000',
    latitude = 51.0652,
    longitude = 3.7378
WHERE id = 6;

UPDATE users SET 
    street = 'Sint-Katelijnevest 55',
    city = 'Antwerpen',
    postcode = '2000',
    latitude = 51.2183,
    longitude = 4.4026
WHERE id = 7;

UPDATE users SET 
    street = 'Vaartkom 17',
    city = 'Leuven',
    postcode = '3000',
    latitude = 50.8845,
    longitude = 4.7163
WHERE id = 8;

UPDATE users SET 
    street = 'Ijzerenleen 10',
    city = 'Mechelen',
    postcode = '2800',
    latitude = 51.0272,
    longitude = 4.4792
WHERE id = 9;

UPDATE users SET 
    street = 'Koningin Astridlaan 97',
    city = 'Brugge',
    postcode = '8000',
    latitude = 51.2055,
    longitude = 3.2246
WHERE id = 10;

UPDATE users SET 
    street = 'Maalse Steenweg 65',
    city = 'Brugge',
    postcode = '8310',
    latitude = 51.2152,
    longitude = 3.2410
WHERE id = 11;

UPDATE users SET 
    street = 'Jan Breydelstraat 31',
    city = 'Kortrijk',
    postcode = '8500',
    latitude = 50.8286,
    longitude = 3.2659
WHERE id = 12;

UPDATE users SET 
    street = 'Romeinselaan 18',
    city = 'Tongeren',
    postcode = '3700',
    latitude = 50.7803,
    longitude = 5.4624
WHERE id = 13;

UPDATE users SET 
    street = 'Kleinering 22',
    city = 'Sint-Niklaas',
    postcode = '9100',
    latitude = 51.1667,
    longitude = 4.1391
WHERE id = 14;

UPDATE users SET 
    street = 'Hasseltsestraat 3',
    city = 'Diest',
    postcode = '3290',
    latitude = 50.9873,
    longitude = 5.0551
WHERE id = 15;

UPDATE users SET 
    street = 'Boulevard Léopold II 44',
    city = 'Brussels',
    postcode = '1080',
    latitude = 50.8576,
    longitude = 4.3274
WHERE id = 16;

UPDATE users SET 
    street = 'Nieuwstraat 12',
    city = 'Aalst',
    postcode = '9300',
    latitude = 50.9363,
    longitude = 4.0358
WHERE id = 17;

UPDATE users SET 
    street = 'Franklin Rooseveltlaan 112',
    city = 'Gent',
    postcode = '9000',
    latitude = 51.0420,
    longitude = 3.7288
WHERE id = 18;

UPDATE users SET 
    street = 'Kuringersteenweg 46',
    city = 'Hasselt',
    postcode = '3500',
    latitude = 50.9280,
    longitude = 5.3377
WHERE id = 19;

UPDATE users SET 
    street = 'Albert I-laan 140',
    city = 'Oostende',
    postcode = '8400',
    latitude = 51.2225,
    longitude = 2.9119
WHERE id = 20;

-- Also update booking addresses to match the new user addresses
UPDATE bookings SET 
    city = 'Brussels',
    street = 'Rue de la Loi 175',
    postcode = '1040'
WHERE owner_id = 1;

UPDATE bookings SET 
    city = 'Gent',
    street = 'Emile Clauslaan 43',
    postcode = '9000'
WHERE owner_id = 3;
