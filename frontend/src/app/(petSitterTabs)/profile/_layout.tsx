import { Stack } from 'expo-router';
import React from 'react';

/**
 * PetSitterProfileLayout defines the layout for the profile stack navigator for pet sitters.
 */
const PetSitterProfileLayout: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* Define other screens in the profile stack if needed */}
        </Stack>
    );
};

export default PetSitterProfileLayout; 