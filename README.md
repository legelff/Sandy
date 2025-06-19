# Sandy - Your Pet Care Companion

## Overview

Sandy is a mobile application designed to connect pet owners with trusted pet sitters, providing a seamless solution for managing pet care needs. In a world where pet abandonment is a significant issue and busy schedules make pet care challenging, Sandy offers a reliable and convenient platform. Our goal is to provide stress-free and reliable pet care for owners, while empowering pet sitters to earn money doing what they love.

Preview of the application can be found in [Sandy PPT](https://github.com/l145dev/Sandy/blob/main/sandy_ppt.pdf)

## The Business Case

### The Problem
* High percentage of households own pets (58%) in Belgium, yet abandonment rates are alarming (165 pets/day). 
* Pet owners struggle with busy schedules and unexpected situations, leading to limited pet care options. 
* A general lack of responsibility contributes to pet welfare issues. 

### Our Solution
Sandy aims to address these issues by offering a mobile application that:
* Connects pet owners to pet sitters through a two-sided matching system. 
* Provides various pet care services including day-care, walking, feeding, and more. 
* Operates on a freemium model to be accessible to a wide audience. 

### Goals
* **For Pet Owners:** Provide a stress-free, reliable, and convenient way to manage their pet care. 
* **For Pet Sitters:** Offer a platform to sit pets and earn income. 

## Tech Stack

### System Design & Whiteboarding
* Excalidraw

### Frontend
* React Native
* Expo Go

### Backend
* NodeJS (ExpressJS)
* Socket.io

### Database
* PostgreSQL

## Getting Started

To get a copy of the project up and running on your local machine for development and testing purposes, follow these steps.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn
* PostgreSQL

### Installation

1.  **Clone the repository:**
    ```bash
    git clone "https://github.com/l145dev/Sandy.git"
    cd Sandy
    ```

2.  **Database Setup:**
    * Ensure PostgreSQL is running.
    * Create a database for the project called `Sandy`.

3.  **Set up Backend Environment Variables:**
    Create a `.env` file in your `backend` directory and add the following:
    ```
    PORT=3000
    DATABASE_URL="postgresql://postgres:xxx@localhost:5432/Sandy"
    DB_PASSWORD="xxx"
    GROQ_KEY="xxx"
    ```
    *Remember to replace `xxx` with your actual database password and API keys.*
    *get GROQ key from: https://console.groq.com/keys*

2.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install # or yarn install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd ../backend
    npm install # or yarn install
    ```

5.  **Run the Backend Server:**
    ```bash
    cd backend
    npm start # or yarn start
    ```

6.  **Run the Frontend Application:**
    - **Web:**
    ```bash
    cd ../frontend
    npm run start # or yarn start
    ```
    - **Emulator:**
    ```bash
    cd ../frontend
    npm run android # must have android VM open
    ```
    This will open Expo Developer Tools in your browser. ~~You can then run the app on an emulator/simulator or scan the QR code with the Expo Go app on your physical device.~~.

7. **Set up Frontend Environment Variables**
   Create a `.env` file in your `frontend` directory and add the following:
    ```
    EXPO_PUBLIC_METRO = xxx
    ```
    *Replace `xxx` with IP given after running frontend for example `10.234.29.65`, this IP is listed under the QR code in terminal with `exp://10.234.29.65:8081`*

## Contribute

We welcome contributions! Please feel free to fork the repository, create a new branch for your features or bug fixes, and submit a pull request.

## Business case by

- Veronika Shevchenko 
- Iryna Gamova
- Fati Diop
- Ángela Caamaño Obertos

## Contact

- Aryan Shah: [Github](https://github.com/l145dev)
- Nilou Karami Shahrokhi: [Github](https://github.com/Niloufr)
- Daryna Denysenko: [Github](https://github.com/darynadenysenko)
