# Product Requirements: "Sandy" - Pet Sitting Mobile App

**Project:** Sandy - A React Native (Expo) TypeScript mobile application called "Sandy", connecting pet owners and pet sitters.

## 1. Core Setup & Configuration Details

### 1.1. Dependencies Installation
Execute the following command to install necessary packages:
```bash
npx expo install @react-navigation/native @react-navigation/native-stack lucide-react-native react-native-screens react-native-safe-area-context
```

### 1.2. Design System & Theme (`src/theme/theme.ts`)
Create `src/theme/theme.ts` exporting the following objects. These are derived from the conceptual CSS variables and should be used for all styling.

**Conceptual CSS Variables (for reference):**
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

**`src/theme/theme.ts` Implementation:**
```typescript
// src/theme/theme.ts
export const colors = {
  background: '#f6f6e9',
  primary: '#17724c',
  textLight: '#ffffff',
  textDark: '#000000',
  // Consider adding: accent, error, success, various grey tones (e.g., grey100, grey500)
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
};

export const typography = {
  // Define font families, standard font sizes (e.g., body, caption, h1, h2), and weights.
  // Example:
  // regular: 'YourAppFont-Regular', // if custom fonts are added to src/assets/fonts
  // bold: 'YourAppFont-Bold',
  // fontSizeH1: 28,
  // fontSizeBody: 16,
};

export const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

// Potentially add other theme aspects like button variants, input styles, etc.
```

## 2. Key Reusable Components (Examples)

The following common components should be created in `src/components/common/` or `src/components/layout/` as needed.

*   **`Logo.tsx`**: Displays the "Sandy" app logo. Can be an SVG or a styled text placeholder initially. Use in footers and headers where specified.
*   **`StyledText.tsx`**: A custom Text component that can easily apply typography styles from the theme.
*   **`Input.tsx`**: A reusable text input component with consistent styling, label, error message handling, and theme integration.
*   **`Button.tsx`**: A versatile button component supporting different variants (e.g., `solid`, `outline`, `destructive`), sizes, and `onPress` handlers.
*   **`Checkbox.tsx`**: A custom checkbox component.
*   **`ScreenContainer.tsx`**: A layout component to wrap screens, providing consistent padding and background color from the theme.
*   **`HeaderComponent.tsx`**: A reusable header, potentially with back button, title, and right-side actions.
*   **`FooterLayout.tsx`**: Used for consistent footer structure on screens like Login/Register.
*   **`BottomNavigationBar.tsx`**: The main navigation bar for logged-in users. It will handle navigation to Home, Search, Messages, Profile, and Options (for owners). Icon usage should be from `lucide-react-native`.

## 3. Screen Specifications (`src/screens/`)

Implement the following screens. All UI elements should be functional (navigation, form inputs) and styled using `src/theme/theme.ts`.

---

### 3.1. Authentication & Profile Creation Screens

#### 3.1.1. `LoginScreen.tsx`
*   **Purpose:** User login.
*   **Structure:**
    *   `<Logo />` (prominently displayed)
    *   Header Text: "Welcome Back to Sandy!"
    *   Subheader Text: "A platform for your pets and certified caretakers."
    *   Form:
        *   `<Input type="email" placeholder="Email" name="email" />`
        *   `<Input type="password" placeholder="Password" name="password" />`
        *   `<Checkbox label="Remember me" name="rememberMe" />`
    *   Footer (`FooterLayout.tsx` - row, space-between, items-center):
        *   `<Button variant="outline" title="Register" onPress={() => navigate('RegisterScreen')} />`
        *   `<Button variant="solid" title="Login" onPress={handleLogin} />`

#### 3.1.2. `RegisterScreen.tsx`
*   **Purpose:** New user registration.
*   **Structure:**
    *   `<Logo />`
    *   Header Text: "Welcome to Sandy!"
    *   Subheader Text: "A platform for your pets and certified caretakers."
    *   Form (within `<ScrollView>`):
        *   `<Input placeholder="Full Name" name="fullName" />`
        *   `<Input type="email" placeholder="Email" name="email" />`
        *   `<Input type="password" placeholder="Password" name="password" />`
        *   `<Input type="password" placeholder="Confirm Password" name="confirmPassword" />`
        *   `<Input placeholder="Street Address" name="streetAddress" />`
        *   Input Group (row, styled for layout):
            *   `<Input placeholder="City" name="city" style={{flex: 1, marginRight: spacing.sm}} />`
            *   `<Input placeholder="Postcode" name="postcode" style={{flex: 1}} />`
        *   `<Checkbox label="I agree to the terms and conditions" name="agreeToTerms" />`
    *   Footer (`FooterLayout.tsx` - row, space-between, items-center):
        *   `<Button variant="outline" title="Login" onPress={() => navigate('LoginScreen')} />`
        *   `<Button variant="solid" title="Register" onPress={handleRegister} />`

#### 3.1.3. `CreateProfileFlowScreen.tsx`
*   **Purpose:** Multi-step profile creation after registration. Manages internal state for steps.
*   **State:** `currentStep` (e.g., 1, '2A', '2B', '3A', '3B'), `profileType` ('owner' or 'sitter'), form data for each step.
*   **Common Footer for all steps (`FooterLayout.tsx` - row, space-between, items-center):**
    *   `<Button variant="outline" title="Back" onPress={handleBackStep} disabled={isFirstStep} />`
    *   `<Logo />` (smaller version)
    *   `<Button variant="solid" title={isLastStep ? "Finish" : "Next"} onPress={handleNextOrFinishStep} />`

*   **Step 1: Choose Profile Type**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Who are you?"
    *   Selection Group (Vertical, use styled `Pressable` or `Card` components):
        *   Option 1 (Selectable): "I am a pet owner", Description: "I am looking for someone to take care of my pet." (onPress updates `profileType` to 'owner' and highlights selection)
        *   Option 2 (Selectable): "I am a pet sitter", Description: "I am looking to take care of other people's pets." (onPress updates `profileType` to 'sitter' and highlights selection)

*   **Step 2A: Pet Owner - Plan Selection (Render if `profileType === 'owner'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Choose a plan which fits your needs"
    *   Selection Group (Vertical, selectable option cards):
        *   Option 1: "Basic plan (0$ / month) - 1 pet, cats & dogs, 5 requests/day, basic service package, 5% booking fee, with ads"
        *   Option 2: "Upgraded basic plan (5$ / month) - all basic features, no ads"
        *   Option 3: "Premium plan (9$ / month) - unlimited pets, all pet species, unlimited requests, extended service package, 2% booking fee, no ads"

*   **Step 2B: Pet Sitter - Plan Selection (Render if `profileType === 'sitter'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Choose a plan which fits your needs"
    *   Selection Group (Vertical, selectable option cards):
        *   Option 1: "Basic plan (0$ / month) - cats & dogs, sit 2 pets/week, 5% booking fee, no insurance, no pet sitting training, with ads"
        *   Option 2: "Part-time job - all perks included, get paid to sit pets"

*   **Step 3A: Pet Owner - Add Pets (Render if `profileType === 'owner'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Add your pets"
    *   Pets List (`FlatList` or mapped array):
        *   Item: Row with Pet Name, Pet Species, `<Button variant="icon" icon="Trash2" onPress={() => removePet(pet.id)} />`.
        *   Each item onPress navigates to `AddEditPetScreen({ petId: pet.id })` for editing.
    *   `<Button title="Add Pet" icon="Plus" onPress={() => navigate('AddEditPetScreen', { isNew: true })} />`

*   **Step 3B: Pet Sitter - Profile Details (Render if `profileType === 'sitter'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Add your profile details"
    *   Form (within `<ScrollView>`):
        *   `<Input placeholder="Years of Experience" name="yearsExperience" keyboardType="numeric" />`
        *   Availability Section: For each day (Monday-Sunday), create a row:
            *   `<Checkbox label="DayName" name="availability.dayName.active" />`
            *   `<Input placeholder="Start Time" name="availability.dayName.startTime" disabled={!availability.dayName.active} />`
            *   `<Input placeholder="End Time" name="availability.dayName.endTime" disabled={!availability.dayName.active} />`
        *   `<Input placeholder="Tell us about your personality & motivation (max 500 chars)" name="bio" multiline={true} numberOfLines={4} />`
        *   Pet Preference Selection (Multiple choice `Checkbox` group or similar):
            *   Option: "Cats" (name="petPreferenceCats")
            *   Option: "Dogs" (name="petPreferenceDogs")
            *   (Potentially more species)
        *   Image Upload Grid (for profile pictures, use a placeholder component for now):
            *   Layout: 1 large main image placeholder on left/top, 2 smaller placeholders on right/bottom.
            *   Each placeholder should indicate "Click to upload", show image preview if uploaded, and have a "Remove" button.

#### 3.1.4. `AddEditPetScreen.tsx`
*   **Purpose:** Add a new pet or edit an existing one.
*   **Navigation Params:** `petId?: string` (for editing), `isNew?: boolean`.
*   **Structure:**
    *   `<HeaderComponent title={isEditing ? "Edit Pet Details" : "Add Pet Details"} showBackButton={true} />`
    *   Subheader Text: "Provide your pet's information."
    *   Form (within `<ScrollView>`):
        *   `<Input placeholder="Pet Name" name="petName" />`
        *   `<Input placeholder="Pet Species (e.g., Dog, Cat)" name="petSpecies" />`
        *   `<Input placeholder="Pet Breed" name="petBreed" />`
        *   `<Input placeholder="Pet Age (years)" name="petAge" keyboardType="numeric" />`
        *   `<Input placeholder="Pet Personality (e.g., playful, shy)" name="petPersonality" multiline={true} />`
        *   `<Input placeholder="Pet Activities & Needs (e.g., daily walks, medication)" name="petNeeds" multiline={true} />`
        *   Slider Component: "Energy Level" (Labels: Passive - Active) (name="energyLevel")
        *   Slider Component: "Comfort Level with Strangers" (Labels: Shy - Comfortable) (name="comfortLevel")
        *   Image Upload Grid (similar to Sitter Profile, for pet photos).
    *   Footer (`FooterLayout.tsx` - row, space-between, items-center):
        *   `<Button variant="outline" title="Cancel" onPress={() => navigation.goBack()} />`
        *   `<Logo />`
        *   `<Button variant="solid" title={isEditing ? "Save Changes" : "Add Pet"} onPress={handleSavePet} />`

---
### 3.2. Main Application Screens (Post-Login & Profile Setup)
*(Structure for these screens will follow the detailed breakdown provided in the initial prompt, e.g., `HomeOwnerScreen.tsx`, `HomeSitterScreen.tsx`, `SearchOwnerFiltersScreen.tsx`, etc. Ensure each screen uses the `BottomNavigationBar.tsx` where specified and components like `PetCard.tsx`, `SitterProfileCard.tsx`, etc., are created as needed within `src/components/features/`.)*

**Key components to be created for these sections (in `src/components/features/` or `src/components/common/`):**

*   `PetInCareCard.tsx`
*   `PetAvailableCard.tsx`
*   `PetRequestCard.tsx`
*   `PastSittingCard.tsx`
*   `SittingRequestCard.tsx`
*   `DatePicker.tsx` (reusable date picker component)
*   `SitterProfileSwipeCard.tsx` (for `SearchOwnerResultsScreen`)
*   `OwnerRequestSwipeCard.tsx` (for `SearchSitterScreen`)
*   `MatchedSitterItem.tsx`
*   `ReviewItem.tsx`
*   `ChatListItem.tsx`
*   `MessageBubble.tsx`
*   `BookingConfirmationComponent.tsx` (for chat)
*   `PetSummaryCard.tsx`

**Screen structure details for each of the following should be implemented as per the original detailed prompt:**

#### 3.2.1. `HomeOwnerScreen.tsx`
#### 3.2.2. `HomeSitterScreen.tsx`
#### 3.2.3. `SearchOwnerFiltersScreen.tsx` (Step 1 for Owner Search)
#### 3.2.4. `SearchOwnerResultsScreen.tsx` (Step 2 for Owner Search - Swiping)
#### 3.2.5. `SearchSitterScreen.tsx` (Sitter views requests - Swiping)
#### 3.2.6. `ManageMatchesScreen.tsx` (Owner's "liked" sitters)
#### 3.2.7. `SitterRequestScreen.tsx` (Owner finalizes request to a matched sitter)
#### 3.2.8. `ViewSitterProfileScreen.tsx` (Public Sitter Profile)
#### 3.2.9. `ViewPetProfileScreen.tsx` (Public Pet Profile)

---
### 3.3. Messaging & Booking Screens

#### 3.3.1. `MessageListScreen.tsx`
#### 3.3.2. `ChatScreen.tsx`
#### 3.3.3. `BookingDetailsScreen.tsx`
*(Note: `BookingConfirmationComponent.tsx` is a component rendered within `ChatScreen.tsx`, not a standalone screen).*

---
### 3.4. User Profile Management Screens

#### 3.4.1. `ProfileOwnerScreen.tsx`
#### 3.4.2. `ProfileSitterScreen.tsx`

---
**General Implementation Notes:**
*   Use `ScrollView` for screens with content that might exceed screen height.
*   Implement navigation between screens as described.
*   Placeholder data or mock API functions in `src/services/` can be used initially for dynamic content.
*   Focus on layout and functionality. Detailed styling can be iterative but must use the theme.
*   Interactive elements like swipe cards will require libraries (e.g., `react-native-deck-swiper`) or custom implementation.
*   "Image Upload Grid" can be placeholder UI initially, with core logic for selecting/removing images. Actual upload functionality can be deferred.
```