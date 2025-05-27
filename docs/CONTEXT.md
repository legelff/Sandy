# Sandy App Frontend – Tinder for pets

- ONLY MODIFY FRONTEND !
- DO NOT MODIFY BACKEND !

## Tech Stack:
- Frontend: React Native with TypeScript, Expo, and Expo Router
- Styling: Nativewind
- UI Framework: React Native Paper

## Project Overview

- **Goal:** Help pet owners find trusted sitters through a swiping interface, like Tinder but for pets.
- **Frontend Directory:** All frontend app code lives in frontend directory. (USE THIS ONLY!)
- **Backend Directory:** All backend app code lives in backend directory. (DO NOT MODIFY!)

---

## Navigation
### Bottom Navbar
- Visible only after registration + onboarding is complete
- Screens in navbar:
    - Home
    - Search
    - Options
    - Messages
    - Profile

- During registration/login/onboarding:
    - No navbar
    - Show only Previous and Next buttons at the bottom

---

## Registration Flow (All Users)
- User signs up with: name, email, password, confirm password, street address, city, postcode
- User selects role: **Pet Owner** or **Pet Sitter**

## Login Flow (All Users)
- User signs in with: email, password. 
- Skips onboarding

---

## If User is a Pet Owner:

### 1. Subscription Choice (Onboarding)
- Choose from:  
  - Basic  
  - Upgraded Basic  
  - Premium

### 2. Add Pets (Onboarding)
- Add one or more pets via modal
- Each pet includes info: name, species, breed, age, personality, activities, needs, energy level, comfort level, 3 photos

### 3. Owner Dashboard
- Sections:
  - Pets currently in care
  - Inactive pets
  - Sent care requests

### 4. Search & Match
- Before search:  
  - Select pet  
  - Set date range  
  - Choose location  
  - Choose service package  
- Start swiping on pet sitters (Tinder-style)
- Swipe card shows sitter info: name, distance, rating, supported pets, personality
- Tap for expanded profile with full details (name, subs type, experience, reviews, training, etc.)

### 5. Options (Liked Sitters)
- List of all right-swiped sitters
- Each card shows: name, rating, distance, selected pets, date range, relevancy
- Tap to edit: pets, dates, location, package → then confirm request
- Tap sitter name to view full profile

### 6. Messages
- Chats with sitters who accepted
- In-chat options: book, camera, text, send
- Booking modal includes: pets, date, location, service, price → sends confirmation card in chat

### 7. Profile
- Shows: profile pic, name, email, address, city, postcode, all pets with edit/delete

---

## If User is a Pet Sitter:

### 1. Subscription Choice
- Choose from:  
  - Basic  
  - Part-Time

### 2. Onboarding
- Fill in:
  - Years of experience  
  - Availability (days & hours)  
  - Always accept toggle  
  - Personality, motivation  
  - Upload 3 photos  
  - Select supported pets (cats/dogs)

### 3. Sitter Dashboard
- Sections:
  - Pets currently in care  
  - Past pets

### 4. Swipe Screen
- View pet owner requests in Tinder-style cards
- Card shows: pet owner, pet info, distance, rating, supported pets, personality

### 5. Messages
- Chat with owners
- In-chat options: book, camera, text, send
- Booking modal same as pet owner flow

### 6. Profile
- Shows: profile pic, name, email, address, city, postcode