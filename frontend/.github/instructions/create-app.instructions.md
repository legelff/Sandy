---
applyTo: '**'
---

# Instructions to create a new app in react-native typescript

follow these guidelines when creating and/or editing the app:

## Design System
- Use these CSS variables for consistent styling:
    ```css
    :root {
        --color-background: #f6f6e9;
        --color-primary: #17724c;
        --color-text-light: #ffffff;
        --color-text-dark: #000000;
        --border-radius-sm: 4px;
        --border-radius-md: 8px;
        --border-radius-lg: 12px;
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 16px;
        --spacing-lg: 24px;
    }
    ```

## Dependencies
1. Install required packages:
     ```bash
     npm install @react-navigation/native lucide-react-native
     npm install @react-navigation/native-stack
     npx expo install react-native-screens react-native-safe-area-context
     ```

## Navigation Setup
1. Wrap your app with NavigationContainer
2. Use createNativeStackNavigator for screen management
3. Define routes in a separate file for better organization

## Icon Usage
- Import icons from lucide-react-native
- Maintain consistent icon sizes throughout the app
- Use primary color for interactive icons

## Best Practices
- Implement proper file structure
- Use semantic component names
- Implement proper TypeScript types
- Follow atomic design principles
- Create reusable components for common UI elements
- Implement proper error handling
- Add loading states for async operations

## App Pages Structure

1. Pages Organization and internal structure per page:
    - /screens
        - Login.tsx (login page)
            - Structure:
                - Header (Welcome Back to Sandy!)
                - Subheader (A platform for your pets and certified caretakers.)
                - Form (
                    - Input (email)
                    - Input (password)
                    - Checkbox (remember me)
                )
                - Footer (from left to right, justify space-between): (
                    - Button (Register)
                    - Logo (sandy logo)
                    - Button (Login)
                )
        - Register.tsx (registration page)
            - Structure:
                - Header (Welcome to Sandy!)
                - Subheader (A platform for your pets and certified caretakers.)
                - Form (
                    - Input (name)
                    - Input (email)
                    - Input (password)
                    - Input (confirm password)
                    - Input (street address)
                    - Input group (row):
                        - Input (city)
                        - Input (postcode)
                    - Checkbox (I agree to the terms and conditions)
                )
                - Footer (from left to right, justify space-between): (
                    - Button (Login)
                    - Logo (sandy logo)
                    - Button (Register)
                )
        - CreateProfile.tsx: step 1 (choose profile type)
            - Structure:
                - Header (Complete your profile)
                - Subheader (Who are you?)
                - Selection (click to highlight) (
                    - Option (I am a pet owner - I am looking for someone to take care of my pet.)
                    - Option (I am a pet sitter - I am looking to take care of other people's pets.)
                )
                - Footer (from left to right, justify space-between): (
                    - Button (Back)
                    - Logo (sandy logo)
                    - Button (Next)
                )
        - CreateProfile.tsx: step 2A (pet owner - plan selection)
            - Structure:
                - Header (Complete your profile)
                - Subheader (Choose a plan which fits your needs)
                - Selection (click to highlight) (
                    - Option (Basic plan (0$ / month) - 1 pet, cats & dogs, 5 requests/day, basic service package, 5% booking fee, with ads)
                    - Option (Standard plan (5$ / month) - all basic features, no ads)
                    - Option (Premium plan (9$ / month) - unlimited pets, all pet species, unlimited requests, extended service package, 2% booking fee, no ads)
                )
                - Footer (from left to right, justify space-between): (
                    - Button (Back)
                    - Logo (sandy logo)
                    - Button (Next)
                )
        - CreateProfile.tsx: step 2B (pet sitter - plan selection)
            - Structure:
                - Header (Complete your profile)
                - Subheader (Choose a plan which fits your needs)
                - Selection (click to highlight) (
                    - Option (Basic plan (0$ / month) - cats & dogs, sit 2 pets/week, 5% booking fee, no insurance, no pet sitting training, with ads)
                    - Option (Standard plan (5$ / month) - all basic features, no ads)
                    - Option (Part-time job - all perks included, get paid to sit pets)
                )
                - Footer (from left to right, justify space-between): (
                    - Button (Back)
                    - Logo (sandy logo)
                    - Button (Next)
                )
        - CreateProfile.tsx: step 3A (pet owner - add pets)
            - Structure:
                - Header (Complete your profile)
                - Subheader (Add your pets)
                - Pets list (
                    - Pets list item (click to edit) (
                        - Pet (name, species)
                        - Button (Remove pet)
                    )
                )
                - Button (Add pet)
                - Footer (from left to right, justify space-between): (
                    - Button (Back)
                    - Logo (sandy logo)
                    - Button (Next)
                )
        - AddPet.tsx (add/edit pet -> extension of step 3A)
            - Structure:
                - Header (Add/edit a pet)
                - Subheader (Add/edit your pet's details)
                - Form (
                    - Input (pet name)
                    - Input (pet species)
                    - Input (pet breed)
                    - Input (pet age)
                    - Input (pet personality)
                    - Input (pet activities and needs)
                    - Slider (pet energy level: passive - active)
                    - Slider (pet comfort level: shy - comfortable)
                    - Image upload grid (2 equal columns) (
                        - Image upload container left (click to upload) (
                            - Image (pet image)
                            - Button (Remove image)
                        )
                        - Image upload grid right (2 equal rows) (
                            - Image upload container top (click to upload) (
                                - Image (pet image)
                                - Button (Remove image)
                            )
                            - Image upload container bottom (click to upload) (
                                - Image (pet image)
                                - Button (Remove image)
                            )
                        )
                    )
                )
                - Footer (from left to right, justify space-between): (
                    - Button (Back)
                    - Logo (sandy logo)
                    - Button (Add pet)
                )
        - CreateProfile.tsx: step 3B (pet sitter - profile details)
            - Structure:
                - Header (Complete your profile)
                - Subheader (Add your profile details)
                - Form (
                    - Input (years of experience)
                    - Input (pet sitting availability) (
                        - availability group (row) (
                            - Checkbox (Monday)
                            - Input (start time)
                            - Input (end time)
                        )
                        - availability group (row) (
                            - Checkbox (Tuesday)
                            - Input (start time)
                            - Input (end time)
                        )
                        - availability group (row) (
                            - Checkbox (Wednesday)
                            - Input (start time)
                            - Input (end time)
                        )
                        - availability group (row) (
                            - Checkbox (Thursday)
                            - Input (start time)
                            - Input (end time)
                        )
                        - availability group (row) (
                            - Checkbox (Friday)
                            - Input (start time)
                            - Input (end time)
                        )
                        - availability group (row) (
                            - Checkbox (Saturday)
                            - Input (start time)
                            - Input (end time)
                        )
                        - availability group (row) (
                            - Checkbox (Sunday)
                            - Input (start time)
                            - Input (end time)
                        )
                    )
                    - input (personality & motivation)
                    - Selection (click to highlight - multiple) (
                        - Option (Cats)
                        - Option (Dogs)
                    )
                    - Image upload grid (2 equal columns) (
                        - Image upload container left (click to upload) (
                            - Image (profile image)
                            - Button (Remove image)
                        )
                        - Image upload grid right (2 equal rows) (
                            - Image upload container top (click to upload) (
                                - Image (profile image)
                                - Button (Remove image)
                            )
                            - Image upload container bottom (click to upload) (
                                - Image (profile image)
                                - Button (Remove image)
                            )
                        )
                    )
                )
                - Footer (from left to right, justify space-between): (
                    - Button (Back)
                    - Logo (sandy logo)
                    - Button (Finish)
                )
        - HomeOwner.tsx (main dashboard - pet owner)
            - Structure:
                - Header (Welcome back, [name]!)
                - Pets list in care (
                    - Pets list item (
                        - Pet (name, species)
                        - Pet BPM (pet BPM)
                        - Message Icon (message pet sitter)
                    )
                )
                - Pets list inactive (
                    - Pets list item (
                        - Pet (name, species)
                        - Search Icon (search pet sitters)
                    )
                )
                - Pets list requested (
                    - Pets list item (
                        - Pet (name, species)
                        - Cancel Icon (Cancel pet sitter request)
                    )
                )
                - Navigation bar (
                    - Home (Home icon)
                    - Search (Search icon)
                    - Options (Options icon)
                    - Messages (Messages icon)
                    - Profile (Profile icon)
                )
        - HomeSitter.tsx (main dashboard - pet sitter)
            - Structure:
                - Header (Welcome back, [name]!)
                - Pets list in care (
                    - Pets list item (
                        - Pet (name, species)
                        - Pet BPM (pet BPM)
                        - Message Icon (message pet owner)
                    )
                )
                - Pets list history (
                    - Pets list item (
                        - Pet (name, species)
                        - Rating (rating by owner: number + star icon)
                    )
                )
                - Navigation bar (
                    - Home (Home icon)
                    - Search (Search icon)
                    - Options (Options icon)
                    - Messages (Messages icon)
                    - Profile (Profile icon)
                )
        - SearchOwner.tsx: step 1 (search page - select pets and filters)
            - Structure:
                - Header (Select pets and filter results)
                - Search bar (search by name, location, or availability)
                - Pets list inactive (
                    - Pets list item (
                        - Pet (name, species)
                        - Plus Icon (add pet to selection)
                    )
                )
                - Dates (
                    - Date (start date)
                    - Date (end date)
                )
                - Location (
                    - Button (Home)
                    - Button (Current)
                    - Input (location)
                )
                - Service type (only for premium users - select only 1) (
                    - Option (Basic)
                    - Option (Extended)
                )
                - Button (Start searching)
                - Navigation bar (
                    - Home (Home icon)
                    - Search (Search icon)
                    - Options (Options icon)
                    - Messages (Messages icon)
                    - Profile (Profile icon)
                )
        - SearchOwner.tsx: step 2 (search page - swipe through results)
            - Structure:
                - Swipe left to reject, right to accept
                - Bottom layer (background, full page pet sitter images in a 2 column grid) (
                    - top column (pet sitter main image)
                    - bottom 2 row grid (
                        - left column (pet sitter image)
                        - right column (pet sitter image)
                    )
                )
                - top layer (bottom, covers 1/5th of screen on bottom above nav) (
                    - Main info row (
                        - Sitter Name
                        - Sitter Distance
                        - Rating (avg rating by owners: number + star icon)
                    )
                    - Pet support row (
                        - badges (pet species supported)
                    )
                    - Pet support row (
                        - personality and motivation
                    )
                )
                - Navigation bar (
                    - Home (Home icon)
                    - Search (Search icon)
                    - Options (Options icon)
                    - Messages (Messages icon)
                    - Profile (Profile icon)
                )
        - SearchSitter.tsx (search page - requests from pet owners)
                

2. Component Organization:
    - /components
        - /common (shared components)
        - /layout (structural components)
        - /features (feature-specific components)

3. Navigation Structure:
    - /navigation
        - AppNavigator.tsx (main navigation setup)
        - types.ts (navigation type definitions)

4. File Naming:
    - Use PascalCase for component files
    - Use kebab-case for utility files
    - Add .test.tsx suffix for test files