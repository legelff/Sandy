import { create } from 'zustand';

interface RegistrationData {
    name?: string;
    email?: string;
    password?: string;
    street?: string;
    city?: string;
    postcode?: string;
    role?: 'petOwner' | 'petSitter' | null;
}

export interface Pet {
    id: string; // Mandatory ID
    name: string;
    species: string;
    breed: string;
    age: string; // Keeping as string to match PetFormData
    personality: string;
    activitiesAndNeeds: string;
    energyLevel: number;
    comfortLevel: number;
    vaccinations: boolean;
    sterilized: boolean;
    photo1Url?: string;
    photo2Url?: string;
    photo3Url?: string;
}

interface PetOwnerOnboardingData {
    pets?: Pet[];
    // Add other pet owner specific onboarding fields from PetFormScreen, AddPetsScreen
}

interface PetSitterOnboardingData {
    bio?: string; // Was example, could be personality or motivation
    motivation?: string; // Added
    photos?: string[]; // Added
    supportedPets?: { cats: boolean; dogs: boolean }; // Added
    services?: string[];
    serviceArea?: string;
    experienceLevel?: string; // Can be used for yearsExperience
    availability?: AvailabilityData; // Added
    alwaysAcceptRequests?: boolean; // Added
}

// Define AvailabilityData if it's not already globally available or imported
// Assuming AvailabilityData and DayOfWeek are defined in PetSitterExperienceScreen.tsx or a shared types file
// For the store, it might be better to define them here or import if they are in a shared types location.
// For now, I'll add a placeholder. You might need to move/share the actual types.
interface AvailabilityDetail {
    isAvailable: boolean;
    fromTime: string;
    toTime: string;
}

interface AvailabilityData {
    Monday: AvailabilityDetail;
    Tuesday: AvailabilityDetail;
    Wednesday: AvailabilityDetail;
    Thursday: AvailabilityDetail;
    Friday: AvailabilityDetail;
    Saturday: AvailabilityDetail;
    Sunday: AvailabilityDetail;
}

interface SubscriptionData {
    // Define subscription related fields from PetOwnerSubscriptionScreen
    // Example:
    plan?: string;
    hasSubscribed?: boolean;
}

interface OnboardingState extends RegistrationData, PetOwnerOnboardingData, PetSitterOnboardingData, SubscriptionData {
    setRegistrationData: (data: RegistrationData) => void;
    // setPetOwnerOnboardingData: (data: PetOwnerOnboardingData) => void; // Commenting out as we manage pets directly
    addPet: (pet: Pet) => void;
    updatePet: (pet: Pet) => void;
    removePet: (petId: string) => void;
    setPetSitterOnboardingData: (data: PetSitterOnboardingData) => void;
    setSubscriptionData: (data: SubscriptionData) => void;
    resetOnboardingState: () => void; // To clear data after successful registration or logout
    getAllData: () => Omit<OnboardingState, 'getAllData' | 'setRegistrationData' | 'addPet' | 'updatePet' | 'removePet' | 'setPetSitterOnboardingData' | 'setSubscriptionData' | 'resetOnboardingState'>;
}

const initialState = {
    name: undefined,
    email: undefined,
    password: undefined,
    street: undefined,
    city: undefined,
    postcode: undefined,
    role: null,
    pets: [],
    bio: undefined,
    services: [],
    serviceArea: undefined,
    experienceLevel: undefined,
    plan: undefined,
    hasSubscribed: false,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
    ...initialState,
    setRegistrationData: (data) => set((state) => ({ ...state, ...data })),
    // setPetOwnerOnboardingData: (data) => set((state) => ({ ...state, ...data })), // Already commented out
    addPet: (pet) => set((state) => ({ pets: [...(state.pets || []), pet] })),
    updatePet: (updatedPet) => set((state) => ({
        pets: (state.pets || []).map(p => p.id === updatedPet.id ? { ...p, ...updatedPet } : p),
    })),
    removePet: (petId) => set((state) => ({
        pets: (state.pets || []).filter(p => p.id !== petId),
    })),
    setPetSitterOnboardingData: (data) => set((state) => ({ ...state, ...data })),
    setSubscriptionData: (data) => set((state) => ({ ...state, ...data })),
    resetOnboardingState: () => set(initialState),
    getAllData: () => {
        const {
            setRegistrationData,
            // setPetOwnerOnboardingData, 
            addPet,
            updatePet,
            removePet,
            setPetSitterOnboardingData,
            setSubscriptionData,
            resetOnboardingState,
            getAllData,
            ...rest
        } = get();
        return rest;
    }
})); 