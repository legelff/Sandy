import { create } from 'zustand';

interface User {
    // Define your user properties here
    id: string;
    name: string;
    email: string;
    subscriptionType: 'petOwner' | 'petSitter' | null; // Or other roles you might have
    // Add other user-specific fields
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    // Define other auth actions here, e.g., login, logout
    // Example login action (you'll need to implement the actual logic)
    login: (credentials: any) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null, // Initial state: no user
    isLoading: true, // Initial state: loading auth status
    isAuthenticated: false, // Initial state: not authenticated
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
    setLoading: (loading) => set({ isLoading: loading }),
    login: async (credentials) => {
        set({ isLoading: true });
        // TODO: Implement actual login logic here
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // On successful login:
        // const user: User = { id: '1', name: 'Test User', email: 'test@example.com', subscriptionType: 'petOwner' }; // Replace with actual user data
        // set({ user, isAuthenticated: true, isLoading: false });
        // On failure:
        // set({ isLoading: false });
        // For now, let's assume a petOwner for testing purposes if you call login directly
        // You should replace this with your actual onboarding/login flow
        console.warn("Login function in useAuthStore is a placeholder. Implement actual logic.");
        // set({ user: { id: 'temp', name: 'Temp User', email: '', subscriptionType: 'petOwner'}, isAuthenticated: true, isLoading: false });
        set({ isLoading: false }); // Ensure loading is set to false after placeholder logic
    },
    logout: () => {
        // TODO: Implement actual logout logic here
        set({ user: null, isAuthenticated: false, isLoading: false });
    },
}));

// You might want to initialize the auth state here, e.g., by checking async storage for a token
(async () => {
    // Ensure setLoading is always available from the store instance
    const store = useAuthStore.getState();
    store.setLoading(true); // Good practice to explicitly set loading at the start of this async IIFE
    // TODO: Check for token, validate it, and set user
    // const token = await AsyncStorage.getItem('userToken');
    // if (token) { /* Validate token and fetch user, then call store.setUser(userData) */ }
    // For now, we'll just ensure isLoading becomes false after a brief moment
    // to simulate an async check, even if no user is found.
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to simulate async work
    store.setLoading(false);
})(); 