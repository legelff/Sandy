import { Stack } from 'expo-router';
import React from 'react';

/**
 * PetSitterChatsLayout defines the layout for the chats stack navigator for pet sitters.
 */
const PetSitterChatsLayout: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* Define other screens in the chats stack if needed */}
        </Stack>
    );
};

export default PetSitterChatsLayout; 