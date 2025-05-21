---
applyTo: '**'
---

# React Native (Expo) TypeScript App Creation Guide

**Objective:** Generate a new React Native mobile application using Expo and TypeScript, adhering to the specifications below.

**Primary Goal:** Create a well-structured, maintainable, and user-friendly application named "Sandy" (a tinder-like platform for pet owners and pet sitters).

## 1. Core Setup & Configuration

### 1.1. Dependencies
Install the following essential packages using `npx expo install` to ensure compatibility:
```bash
npx expo install @react-navigation/native @react-navigation/native-stack lucide-react-native react-native-screens react-native-safe-area-context
```

### 1.2. Design System & Theming
Implement a consistent design system. Create a theme file at `src/theme/theme.ts`. This file will export objects for colors, spacing, border radius, and typography, derived from the conceptual CSS variables below.

**Conceptual CSS Variables (translate to JS theme objects):**
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

**Example `src/theme/theme.ts` structure:**
```typescript
// src/theme/theme.ts
export const colors = {
  background: '#f6f6e9',
  primary: '#17724c',
  textLight: '#ffffff',
  textDark: '#000000',
  // Add other common colors: accent, error, success, grey tones
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
  // Define font families, sizes, weights if custom fonts are used
  // e.g., h1: { fontSize: 24, fontWeight: 'bold' },
};

export const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};
```
Use these theme values throughout the application for styling components.

### 1.3. Icon Usage
- Utilize icons exclusively from `lucide-react-native`.
- Adhere to consistent icon sizing using `theme.iconSizes`.
- Interactive icons (buttons, navigation elements) should use `theme.colors.primary` or an appropriate accent color.

## 2. Project Structure & Organization

Implement the following directory structure within the `src/` folder:

-   **`src/`**
    -   **`assets/`**: For static assets like images (e.g., `logo.png`) and custom fonts.
    -   **`components/`**: Reusable UI components.
        -   **`common/`**: Atomic components (e.g., `Button.tsx`, `Input.tsx`, `StyledText.tsx`, `Card.tsx`, `Icon.tsx`, `Logo.tsx`).
        -   **`layout/`**: Structural components (e.g., `ScreenContainer.tsx`, `HeaderComponent.tsx`, `FooterLayout.tsx`, `BottomNavigationBar.tsx`).
        -   **`features/`**: Components specific to a feature or screen (e.g., `PetCard.tsx`, `SitterProfileCard.tsx`, `BookingConfirmationBubble.tsx`).
    -   **`hooks/`**: Custom React hooks (e.g., `useAuth.ts`, `useForm.ts`).
    -   **`navigation/`**: Navigation setup.
        -   `AppNavigator.tsx`: Main navigation stack and routing logic.
        -   `navigation.types.ts`: TypeScript type definitions for navigation routes and parameters.
    -   **`screens/`**: Top-level screen components. Each file represents a distinct view.
    -   **`services/`**: API integration logic, data fetching functions.
    -   **`store/`**: Global state management (e.g., using Zustand, Redux Toolkit, or React Context).
    -   **`theme/`**: Design system files (e.g., `theme.ts` as defined above).
    -   **`types/`**: Global TypeScript interfaces and type definitions (excluding navigation types).
    -   **`utils/`**: Utility functions (e.g., `validators.ts`, `formatters.ts`).

### 2.1. File Naming Conventions
-   **Components & Screens:** `PascalCase.tsx` (e.g., `LoginScreen.tsx`, `UserProfileCard.tsx`)
-   **Hooks:** `useCamelCase.ts` (e.g., `useAuthentication.ts`)
-   **Other TS/JS files (utilities, services, types):** `camelCase.ts` or `kebab-case.ts` (e.g., `apiClient.ts`, `date-utils.ts`)
-   **Test files:** `*.test.tsx` or `*.spec.tsx`

## 3. Navigation Setup (`src/navigation/AppNavigator.tsx`)

1.  Wrap the entire application with `<NavigationContainer>` from `@react-navigation/native` in `App.tsx`.
2.  Utilize `createNativeStackNavigator` from `@react-navigation/native-stack` for primary screen management within `AppNavigator.tsx`.
3.  Define all navigation routes and stacks in `src/navigation/AppNavigator.tsx`.
4.  Use `src/navigation/navigation.types.ts` for strong typing of route names and parameters.

## 4. General Best Practices

-   **TypeScript Everywhere:** Implement strong typing for props, state, function signatures, and API responses.
-   **Atomic Design Principles:** Structure components from atoms (e.g., Button, Input) to molecules (e.g., SearchBar) to organisms (e.g., PetList) and templates/pages (Screens).
-   **Reusable Components:** Prioritize creating generic, reusable components for common UI elements (buttons, inputs, cards, etc.) and place them in `src/components/common/`.
-   **Semantic Component Naming:** Use clear, descriptive names for components that reflect their purpose.
-   **Error Handling:** Implement robust error handling for API calls, form submissions, and other critical operations (e.g., `try-catch`, error boundaries, user-friendly error messages).
-   **Loading States:** Provide clear visual feedback (spinners, skeletons, disabled states) for asynchronous operations.
-   **Accessibility (A11y):** Ensure components are accessible (e.g., proper `accessibilityLabel`, `accessibilityHint`).
-   **State Management:** Choose a suitable state management solution (Context API for simple cases, Zustand/Redux Toolkit for complex global state) and organize it in `src/store/`.
-   **Code Comments:** Add JSDoc comments for components, props, and complex functions.

## 5. Screen Specifications (`src/screens/`)

Create the following screens with the specified structure and components. Ensure all interactive elements are functional (even if just stubs initially) and styling is derived from `src/theme/theme.ts`.

**Note on common elements:**
*   **Logo:** A `Logo.tsx` component (in `src/components/common/`) should be created and used wherever "Logo (sandy logo)" is mentioned. Assume an SVG or a simple styled text placeholder.
*   **Headers/Subheaders:** Use `<StyledText>` components with appropriate typography from the theme.
*   **Forms:** Use `<Input>` components for text entry, and custom components for checkboxes, sliders, etc.
*   **Buttons:** Use a reusable `<Button>` component.
*   **Navigation Bar:** A `BottomNavigationBar.tsx` component (in `src/components/layout/`) should be created for screens that require it. It will handle navigation to Home, Search, Messages, Profile, and Options (for owners).

---

### 5.1. Authentication & Profile Creation Screens

#### 5.1.1. `LoginScreen.tsx`
*   **Purpose:** User login.
*   **Structure:**
    *   `<Logo />` (prominently displayed)
    *   Header Text: "Welcome Back to Sandy!"
    *   Subheader Text: "A platform for your pets and certified caretakers."
    *   Form:
        *   `<Input type="email" placeholder="Email" />`
        *   `<Input type="password" placeholder="Password" />`
        *   `<Checkbox label="Remember me" />`
    *   Footer (row, space-between):
        *   `<Button variant="outline" title="Register" onPress={() => navigate('Register')} />`
        *   `<Button variant="solid" title="Login" onPress={handleLogin} />`

#### 5.1.2. `RegisterScreen.tsx`
*   **Purpose:** New user registration.
*   **Structure:**
    *   `<Logo />`
    *   Header Text: "Welcome to Sandy!"
    *   Subheader Text: "A platform for your pets and certified caretakers."
    *   Form (ScrollView recommended):
        *   `<Input placeholder="Full Name" />`
        *   `<Input type="email" placeholder="Email" />`
        *   `<Input type="password" placeholder="Password" />`
        *   `<Input type="password" placeholder="Confirm Password" />`
        *   `<Input placeholder="Street Address" />`
        *   Input Group (row):
            *   `<Input placeholder="City" style={{flex: 1, marginRight: spacing.sm}} />`
            *   `<Input placeholder="Postcode" style={{flex: 1}} />`
        *   `<Checkbox label="I agree to the terms and conditions" />`
    *   Footer (row, space-between):
        *   `<Button variant="outline" title="Login" onPress={() => navigate('Login')} />`
        *   `<Button variant="solid" title="Register" onPress={handleRegister} />`

#### 5.1.3. `CreateProfileFlowScreen.tsx`
*   **Purpose:** Multi-step profile creation after registration. This screen manages internal state for steps.
*   **Internal State:** `currentStep` (e.g., 1, '2A', '2B', '3A', '3B'), `profileType` ('owner' or 'sitter'), form data.
*   **Common Footer for all steps (row, space-between, items-center):**
    *   `<Button variant="outline" title="Back" onPress={handleBackStep} />`
    *   `<Logo />` (smaller version)
    *   `<Button variant="solid" title="Next" onPress={handleNextStep} />` (or "Finish" on the last step)

*   **Step 1: Choose Profile Type**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Who are you?"
    *   Selection Group (Vertical):
        *   Selectable Option Card 1: "I am a pet owner", "I am looking for someone to take care of my pet." (onPress updates `profileType` and highlights)
        *   Selectable Option Card 2: "I am a pet sitter", "I am looking to take care of other people's pets." (onPress updates `profileType` and highlights)

*   **Step 2A: Pet Owner - Plan Selection (Conditional render if `profileType === 'owner'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Choose a plan which fits your needs"
    *   Selection Group (Vertical):
        *   Selectable Option Card 1: "Basic plan (0$ / month) - 1 pet, cats & dogs, 5 requests/day, basic service package, 5% booking fee, with ads"
        *   Selectable Option Card 2: "Standard plan (5$ / month) - all basic features, no ads"
        *   Selectable Option Card 3: "Premium plan (9$ / month) - unlimited pets, all pet species, unlimited requests, extended service package, 2% booking fee, no ads"

*   **Step 2B: Pet Sitter - Plan Selection (Conditional render if `profileType === 'sitter'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Choose a plan which fits your needs"
    *   Selection Group (Vertical):
        *   Selectable Option Card 1: "Basic plan (0$ / month) - cats & dogs, sit 2 pets/week, 5% booking fee, no insurance, no pet sitting training, with ads"
        *   Selectable Option Card 2: "Standard plan (5$ / month) - all basic features, no ads"
        *   Selectable Option Card 3: "Part-time job - all perks included, get paid to sit pets"

*   **Step 3A: Pet Owner - Add Pets (Conditional render if `profileType === 'owner'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Add your pets"
    *   Pets List (display existing pets added, initially empty):
        *   Each Item: Row with Pet Name, Species, and "Remove" Button. Click item to navigate to `AddEditPetScreen` for editing.
    *   `<Button title="Add Pet" onPress={() => navigate('AddEditPetScreen', { isNew: true })} />`

*   **Step 3B: Pet Sitter - Profile Details (Conditional render if `profileType === 'sitter'`)**
    *   Header Text: "Complete your profile"
    *   Subheader Text: "Add your profile details"
    *   Form (ScrollView recommended):
        *   `<Input placeholder="Years of Experience" keyboardType="numeric" />`
        *   Availability Section:
            *   For each day (Monday-Sunday): Row with `<Checkbox label="Day" />`, `<Input placeholder="Start Time" />`, `<Input placeholder="End Time" />`
        *   `<Input placeholder="Tell us about your personality & motivation (max 500 chars)" multiline={true} />`
        *   Pet Preference Selection (Multiple choice, e.g., styled checkboxes or toggles):
            *   Option: "Cats"
            *   Option: "Dogs"
            *   (Potentially more species)
        *   Image Upload Grid (for profile pictures):
            *   Layout: 1 large main image placeholder on left/top, 2 smaller placeholders on right/bottom.
            *   Each placeholder: "Click to upload", shows image once uploaded, "Remove" button.

#### 5.1.4. `AddEditPetScreen.tsx`
*   **Purpose:** Add a new pet or edit an existing one. Navigated to from `CreateProfileFlowScreen` (Step 3A) or `ProfileOwnerScreen`.
*   **Params:** `petId` (optional, for editing).
*   **Structure:**
    *   Header Text: "Add/Edit Pet Details"
    *   Subheader Text: "Provide your pet's information."
    *   Form (ScrollView recommended):
        *   `<Input placeholder="Pet Name" />`
        *   `<Input placeholder="Pet Species (e.g., Dog, Cat)" />`
        *   `<Input placeholder="Pet Breed" />`
        *   `<Input placeholder="Pet Age (years)" keyboardType="numeric" />`
        *   `<Input placeholder="Pet Personality (e.g., playful, shy)" multiline={true} />`
        *   `<Input placeholder="Pet Activities & Needs (e.g., daily walks, medication)" multiline={true} />`
        *   Slider: "Energy Level" (Labels: Passive - Active)
        *   Slider: "Comfort Level with Strangers" (Labels: Shy - Comfortable)
        *   Image Upload Grid (similar to Sitter Profile, for pet photos).
    *   Footer (row, space-between, items-center):
        *   `<Button variant="outline" title="Cancel" onPress={() => navigation.goBack()} />`
        *   `<Logo />`
        *   `<Button variant="solid" title={isEditing ? "Save Changes" : "Add Pet"} onPress={handleSavePet} />`

---

### 5.2. Main Application Screens (Post-Login & Profile Setup)

#### 5.2.1. `HomeOwnerScreen.tsx`
*   **Purpose:** Dashboard for pet owners.
*   **Structure:**
    *   Header Text: "Welcome back, [Owner Name]!"
    *   Section: "Pets Currently in Care"
        *   List of `<PetInCareCard>`: Pet Name, Species, Sitter Name, Pet BPM (simulated), "Message Sitter" Icon/Button.
    *   Section: "Your Pets" (Inactive/Available for booking)
        *   List of `<PetAvailableCard>`: Pet Name, Species, "Find Sitter" Icon/Button (navigates to `SearchOwnerFiltersScreen`).
    *   Section: "Pending Requests"
        *   List of `<PetRequestCard>`: Pet Name, Species, Sitter Applied, "Cancel Request" Icon/Button.
    *   `<BottomNavigationBar />`

#### 5.2.2. `HomeSitterScreen.tsx`
*   **Purpose:** Dashboard for pet sitters.
*   **Structure:**
    *   Header Text: "Welcome back, [Sitter Name]!"
    *   Section: "Pets Currently Under Your Care"
        *   List of `<PetInCareCard>`: Pet Name, Species, Owner Name, Pet BPM (simulated), "Message Owner" Icon/Button.
    *   Section: "Past Sittings"
        *   List of `<PastSittingCard>`: Pet Name, Species, Owner Name, Your Rating by Owner (e.g., 4.5 + Star Icon).
    *   Section: "New Sitting Requests"
        *   List of `<SittingRequestCard>`: Pet Name, Owner Name, Dates, "View Request" button (navigates to `SearchSitterScreen` filtered to this request or a detail screen).
    *   `<BottomNavigationBar />` (Home, Search (for requests), Messages, Profile)

#### 5.2.3. `SearchOwnerFiltersScreen.tsx`
*   **Purpose:** Pet owner specifies search criteria for sitters (Step 1).
*   **Structure:**
    *   Header Text: "Find a Sitter: Filters"
    *   Section: "Select Pet(s) for Sitting"
        *   List of owner's pets (checkbox/toggle next to each): Pet Name, Species.
    *   Section: "Dates"
        *   `<DatePicker label="Start Date" />`
        *   `<DatePicker label="End Date" />`
    *   Section: "Location"
        *   Row: `<Button title="My Home Address" />`, `<Button title="Current Location" />`
        *   `<Input placeholder="Or type address/postcode" />`
    *   Section: "Service Type" (Visible for premium users only)
        *   Selectable Options (Radio buttons/Toggles): "Basic Care", "Extended Care"
    *   `<Button title="Search Sitters" onPress={() => navigate('SearchOwnerResultsScreen', {filters})} />`
    *   `<BottomNavigationBar />`

#### 5.2.4. `SearchOwnerResultsScreen.tsx`
*   **Purpose:** Pet owner swipes through potential sitter matches (Step 2).
*   **Params:** `filters` from `SearchOwnerFiltersScreen`.
*   **Structure:**
    *   Tinder-like swipe interface (e.g., using a library like `react-native-deck-swiper`).
    *   Each Card (`SitterProfileSwipeCard.tsx`):
        *   **Background:** Full-bleed Sitter's images (e.g., main image top, two smaller below, or carousel).
        *   **Foreground Overlay (bottom ~1/4th of card, gradient black to transparent for text readability):**
            *   Row 1: Sitter Name, Distance (e.g., "2.5km away"), Avg. Rating (e.g., "4.7" + Star Icon).
            *   Row 2: Badges for pet species supported (e.g., "Cats", "Dogs").
            *   Row 3: Short bio/tagline from sitter's profile.
    *   Action: Swipe right to "like/match" (stores temporary match), swipe left to "reject".
    *   If no more profiles: "No more sitters matching your criteria. Try adjusting filters."
    *   `<BottomNavigationBar />`

#### 5.2.5. `SearchSitterScreen.tsx`
*   **Purpose:** Pet sitter views and accepts/rejects sitting requests from owners.
*   **Structure:**
    *   Tinder-like swipe interface for incoming requests.
    *   Each Card (`OwnerRequestSwipeCard.tsx`):
        *   **Background:** Full-bleed Pet's images (main image top, two smaller below, or carousel). Images update if different pet selected via badge.
        *   **Foreground Overlay (bottom ~1/4th of card, gradient for readability):**
            *   Row 1: Owner Name, Distance, Owner's Avg. Rating (by sitters).
            *   Interactive Pet Badges Row: Clickable badges for each pet in the request (e.g., "Fluffy (Dog)", "Whiskers (Cat)").
                *   Default: First pet selected.
                *   On click: Highlights selected pet badge, updates background images to that pet's photos, and potentially shows specific details for that pet (e.g., breed, age) in the overlay.
            *   Pet Details (updates based on selected pet badge): Short personality trait, any critical needs.
    *   Action: Swipe right to "accept" (initiates chat/confirmation), swipe left to "reject".
    *   `<BottomNavigationBar />`

#### 5.2.6. `ManageMatchesScreen.tsx` (Owner View)
*   **Purpose:** Owner views sitters they "liked" during swiping. (Formerly Options.tsx step 1)
*   **Structure:**
    *   Header Text: "Your Potential Sitters"
    *   List of `<MatchedSitterItem.tsx>`:
        *   Sitter Avatar
        *   Info Group:
            *   Row: Sitter Name, Distance, Sitter Rating + Star Icon.
            *   Row: Badges for pets this match was for (from search filters).
            *   Row: Dates requested (Start - End).
            *   (Optional) Row: "Relevancy Score: X.X"
            *   Button: "View Profile & Send Request" (navigates to `SitterRequestScreen.tsx`)
            *   Button (Icon-only, e.g., Trash Can): "Remove Match"
    *   `<BottomNavigationBar />`

#### 5.2.7. `SitterRequestScreen.tsx` (Owner View to Finalize Request)
*   **Purpose:** Owner reviews a matched sitter's full profile details and sends a formal booking request. (Formerly OptionDetails.tsx)
*   **Params:** `sitterId`, `searchCriteria` (pets, dates from original search).
*   **Structure:** (ScrollView recommended)
    *   Sitter Avatar.
    *   Row: Sitter Name (clickable, navigates to `ViewSitterProfileScreen.tsx`), Distance, Sitter Rating + Star Icon.
    *   Section: "Selected Pets for this Request"
        *   List of pets (from original search criteria). Allow minor adjustments if needed (e.g., unselect one pet).
    *   Section: "Dates & Times"
        *   Display selected Start Date, End Date (editable if necessary).
    *   Section: "Location"
        *   Display selected location (editable if necessary).
    *   Section: "Service Type" (if applicable)
        *   Display selected service type.
    *   Section: "Estimated Price"
        *   Text: "Base: $X.XX"
        *   Text: "Service Fee: $Y.YY"
        *   Text: "Total: $Z.ZZ"
    *   `<Input placeholder="Optional message to sitter" multiline={true} />`
    *   `<Button title="Send Booking Request" onPress={handleSendRequest} />`
    *   (No BottomNavigationBar on this detailed/modal-like screen; should have a back button in header)

#### 5.2.8. `ViewSitterProfileScreen.tsx` (Public View)
*   **Purpose:** Display a pet sitter's public profile. Navigated to from various points.
*   **Params:** `sitterId`.
*   **Structure:** (ScrollView recommended)
    *   Header: Sitter Name, Distance. Close button (top right) if opened as a modal.
    *   Badges Row: Profile Type (e.g., "Pet Sitter"), "Verified" (if applicable), "Years of Experience", "Key Certifications" (if any).
    *   Image Grid: Sitter's profile photos (e.g., 1 main, 2-3 smaller).
    *   Section: "About Me"
        *   Text: Sitter's personality and motivation.
    *   Section: "Services Offered"
        *   Text: e.g., Dog walking, Cat sitting, House visits, Overnight stays.
    *   Section: "Availability"
        *   Display sitter's general availability.
    *   Section: "Reviews from Pet Owners"
        *   List of `<ReviewItem.tsx>`: Owner Avatar, Owner Name, Rating + Stars, Review Text, Date.
    *   (Optional) Button: "Request Booking" (if viewing from a context where a request makes sense and isn't already initiated)

#### 5.2.9. `ViewPetProfileScreen.tsx` (Public View)
*   **Purpose:** Display a pet's public profile. Navigated to from sitter's request list or chat.
*   **Params:** `petId`.
*   **Structure:** (ScrollView recommended)
    *   Header: Pet Name, Owner Name (optional). Close button (top right) if opened as a modal.
    *   Badges Row: Pet Species, Breed, Age, Energy Level (e.g., "High Energy"), Comfort Level (e.g., "Shy with strangers").
    *   Image Grid: Pet's photos.
    *   Section: "Personality"
        *   Text: Pet's personality description.
    *   Section: "Activities & Needs"
        *   Text: Pet's activities and special needs.
    *   Section: "Reviews from Sitters" (if applicable)
        *   List of `<ReviewItem.tsx>`: Sitter Avatar, Sitter Name, Rating + Stars, Review Text, Date.

---

### 5.3. Messaging & Booking Screens

#### 5.3.1. `MessageListScreen.tsx`
*   **Purpose:** Display list of ongoing chats.
*   **Structure:**
    *   Header Text: "Messages"
    *   List of `<ChatListItem.tsx>`:
        *   Avatar (other user's profile picture).
        *   Row: Recipient Name (Owner/Sitter).
        *   Row: Last message preview. Unread messages indicated (e.g., bold text, blue dot/border).
        *   Badge (optional): Pets involved in this booking/chat (e.g., "Fluffy", or "Multiple Pets").
        *   Timestamp of last message.
        *   OnPress: Navigates to `ChatScreen.tsx` with `chatId` or user IDs.
    *   `<BottomNavigationBar />`

#### 5.3.2. `ChatScreen.tsx`
*   **Purpose:** Display messages between two users for a specific booking/context.
*   **Params:** `chatId` or `userIds` (ownerId, sitterId), `bookingId` (optional).
*   **Structure:**
    *   Custom Header:
        *   Back Button.
        *   Recipient Avatar & Name (clickable to view their profile: `ViewSitterProfileScreen` or `ViewOwnerProfileScreen`).
        *   Pet Name Badge(s) related to this chat/booking (clickable to view `ViewPetProfileScreen`).
    *   Message Area (ScrollView, inverted for chat):
        *   List of `<MessageBubble.tsx>`:
            *   Sender Avatar (optional, if not clear from alignment).
            *   Message Text.
            *   Timestamp.
            *   (If message is a `BookingConfirmationComponent`, render that instead of text).
    *   Input Area (Footer):
        *   Row:
            *   `<IconButton icon="book" onPress={() => navigate('BookingDetailsScreen', { bookingId })} />` (View/Edit Booking)
            *   `<IconButton icon="paperclip" onPress={handleAttachment} />` (Opens modal/menu: Attach Image, Take Picture)
            *   `<Input placeholder="Type a message..." style={{flex: 1}} />`
            *   `<IconButton icon="send" onPress={handleSendMessage} />`
    *   (No BottomNavigationBar, as it's a focused task screen)

#### 5.3.3. `BookingDetailsScreen.tsx`
*   **Purpose:** View or modify details of an existing or proposed booking. Opened from chat or notifications.
*   **Params:** `bookingId` or `sitterId`/`ownerId` and `petIds` if creating new from profile.
*   **Structure:** (ScrollView recommended)
    *   Custom Header: "Booking Details", Back button, Sitter/Owner Name, Pet Name(s) Badge.
    *   Section: "Status": (e.g., "Pending Confirmation", "Confirmed", "In Progress", "Completed", "Cancelled")
    *   Section: "Pets Involved": List of `<PetSummaryCard.tsx>` (Name, Species, Photo). Allow selection/deselection if status is "Pending".
    *   Section: "Dates & Times": Start Date/Time, End Date/Time (editable if "Pending").
    *   Section: "Location": Display location (editable if "Pending").
    *   Section: "Service Type": Display service (editable if "Pending" and premium owner).
    *   Section: "Price Breakdown": Base, Service Fee, Tax (if applicable), Total.
    *   Conditional Actions (Buttons based on user role and booking status):
        *   If Sitter & Pending: `<Button title="Accept Booking" />`, `<Button title="Decline Booking" />`
        *   If Owner & Pending Sitter Confirmation: Text "Awaiting Sitter Confirmation"
        *   If Owner & Sitter Declined: Text "Sitter Declined Request"
        *   If Confirmed: `<Button title="Cancel Booking" />` (with confirmation modal)
        *   If In Progress (Sitter): `<Button title="Mark as Complete" />`
        *   If In Progress (Owner): View Pet Vitals (if applicable, link to a separate screen)
        *   If Completed: `<Button title="Leave a Review" />`
    *   (No BottomNavigationBar)

#### 5.3.4. `BookingConfirmationComponent.tsx` (Rendered within Chat)
*   **Purpose:** A special message bubble component within `ChatScreen.tsx` after a booking is proposed or modified.
*   **Props:** `bookingDetails`, `currentUserRole`.
*   **Structure (as a chat bubble):**
    *   Header Text: "Booking Proposal - Total: $Z.ZZ"
    *   Pets: Row of small pet name badges.
    *   Dates: "Start: [DD/MM/YYYY, HH:MM] - End: [DD/MM/YYYY, HH:MM]"
    *   Conditional Action Buttons (if current user needs to act):
        *   If Sitter viewing Owner's proposal: `<Button size="sm" title="Accept" />`, `<Button size="sm" variant="outline" title="Decline" />`
        *   If Owner viewing Sitter's acceptance: Text "Booking Confirmed by Sitter!"
        *   If Owner viewing Sitter's counter-proposal: `<Button size="sm" title="Accept Changes" />`, `<Button size="sm" variant="outline" title="Decline Changes" />`

---

### 5.4. User Profile Management Screens

#### 5.4.1. `ProfileOwnerScreen.tsx`
*   **Purpose:** Pet owner views and edits their own profile information.
*   **Structure:** (ScrollView recommended)
    *   Header Text: "[Owner Name] - [Subscription Plan (e.g., Premium)]"
    *   Section: "Account Details"
        *   `<Input label="Full Name" value={userData.name} onSave={updateName} />` (editable field)
        *   `<Input label="Email" value={userData.email} editable={false} />` (display only or link to change email flow)
        *   `<Input label="Street Address" value={userData.address} onSave={updateAddress} />`
        *   Row: `<Input label="City" value={userData.city} />`, `<Input label="Postcode" value={userData.postcode} />`
        *   `<Button title="Change Password" />`
    *   Section: "My Pets"
        *   List of pets: Each item shows Pet Name, Species. Click to navigate to `AddEditPetScreen({ petId })`. "Remove Pet" button.
        *   `<Button title="Add New Pet" onPress={() => navigate('AddEditPetScreen', { isNew: true })} />`
    *   Section: "Subscription" (if applicable)
        *   Text: "Current Plan: [Plan Name]"
        *   `<Button title="Manage Subscription" />`
    *   `<Button title="Logout" onPress={handleLogout} variant="destructive" />`
    *   `<BottomNavigationBar />`

#### 5.4.2. `ProfileSitterScreen.tsx`
*   **Purpose:** Pet sitter views and edits their own profile information.
*   **Structure:** (ScrollView recommended)
    *   Header Text: "[Sitter Name] - [Subscription Plan (e.g., Basic)]"
    *   Section: "Account Details" (similar to Owner: Name, Email, Address, Change Password)
    *   Section: "Sitter Profile Details"
        *   `<Input label="Years of Experience" value={sitterData.experience} keyboardType="numeric" />`
        *   Availability Section (editable version of what's in `CreateProfileFlowScreen` Step 3B).
        *   `<Input label="Personality & Motivation" value={sitterData.bio} multiline={true} />`
        *   Pet Preference Selection (editable: Cats, Dogs, etc.).
        *   Image Upload Grid (for profile pictures, editable).
        *   (Optional) `<Input label="Bank Details for Payouts" />` (if applicable for plan)
    *   Section: "Subscription" (if applicable)
    *   `<Button title="Logout" onPress={handleLogout} variant="destructive" />`
    *   `<BottomNavigationBar />`

**Final Instruction:** Begin by setting up the project structure, theme, and core navigation. Then, implement screens starting with the authentication flow, followed by profile creation, and then the main app features. Create reusable components in `src/components/common/` and `src/components/layout/` as you identify repeating patterns. Prioritize functionality and structure; detailed styling can be refined later but should use the theme.