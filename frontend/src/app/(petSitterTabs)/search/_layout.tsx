import { Stack } from 'expo-router';
import React from 'react';

/**
 * PetSitterSearchLayout defines the layout for the search stack navigator for pet sitters.
 */
const PetSitterSearchLayout: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* Define other screens in the search stack if needed */}
            {/* e.g., <Stack.Screen name="results" component={SearchResultsScreen} /> */}
        </Stack>
    );
};

export default PetSitterSearchLayout; 