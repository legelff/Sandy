import { create } from 'zustand';

// Define more specific types based on your API response
interface Pet {
    // Define pet properties based on your API (e.g., id, name, species, etc.)
    id: number;
    name: string;
    species_name?: string; // Assuming species name comes from API
    // Add other relevant pet fields
}

interface OwnerDetails {
    // Define owner-specific details
    subscription_id?: number;
    subscription_name?: string;
    // Add other owner details
}

interface SitterDetails {
    // Define sitter-specific details
    subscription_id?: number;
    subscription_name?: string;
    experience_years?: number;
    // Add other sitter details
}

interface User {
    id: number;
    name?: string; // Name might not always be present initially depending on your flow
    email: string;
    role: 'owner' | 'sitter' | string; // string for flexibility if other roles exist
    pets?: Pet[];
    owner_details?: OwnerDetails;
    sitter_details?: SitterDetails;
    // Add other common user fields from your API response
}

interface AuthState {
    user: User | null;
    token: string | null; // Added token
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuthData: (user: User, token: string) => void; // New action to set user and token
    setUser: (user: User | null) => void; // Kept for direct user updates if needed, but setAuthData is preferred for login
    setLoading: (loading: boolean) => void;
    login: (credentials: any) => Promise<void>; // Placeholder, API call is in LoginScreen
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null, // Initialize token
    isLoading: true,
    isAuthenticated: false,
    setAuthData: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
    }),
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }), // isAuthenticated updates based on user presence
    setLoading: (loading) => set({ isLoading: loading }),
    login: async (credentials) => {
        set({ isLoading: true });
        // TODO: Implement actual login logic here if you want to move it from LoginScreen
        console.warn("Login function in useAuthStore is a placeholder. API call is in LoginScreen.");
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // On successful login (example - replace with actual logic or remove if API call stays in LoginScreen):
        // const user: User = { id: 1, name: 'Test User', email: 'test@example.com', role: 'owner' };
        // const token = "some_jwt_token";
        // set({ user, token, isAuthenticated: true, isLoading: false });
        set({ isLoading: false });
    },
    logout: () => {
        // TODO: Implement actual logout logic here (e.g., call a backend /logout endpoint, clear AsyncStorage)
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
}));

// Initialize auth state (e.g., by checking async storage for a token)
(async () => {
    const store = useAuthStore.getState();
    store.setLoading(true);
    // TODO: Check for token in AsyncStorage, validate it, and fetch user data
    // Example:
    // try {
    //   const token = await AsyncStorage.getItem('userToken');
    //   if (token) {
    //     // Here you might want to call an API endpoint like /user/profile to get user data with the token
    //     // For now, just an example. Replace with your actual token validation and user fetching.
    //     // const userData = await fetchUserProfile(token);
    //     // if (userData) {
    //     //   store.setAuthData(userData, token);
    //     // } else {
    //     //   store.logout(); // Token invalid or user not found
    //     // }
    //   } else {
    //      store.setLoading(false); // No token found, not an error, just not logged in.
    //   }
    // } catch (error) {
    //   console.error("Error initializing auth state from AsyncStorage:", error);
    //   store.logout(); // Ensure clean state on error
    // } finally {
    //    store.setLoading(false); // Ensure loading is false after check
    // }

    // For now, simulate async check and ensure isLoading becomes false.
    await new Promise(resolve => setTimeout(resolve, 50));
    store.setLoading(false);
})(); 