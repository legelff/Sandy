import { Stack } from 'expo-router';
import React from 'react';

/**
 * PetSitterChatsLayout defines the layout for the chats stack navigator for pet sitters.
 */
export default function PetSitterChatsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* Ensure this title is appropriate or can be dynamically set */}
            <Stack.Screen name="chat" options={{ title: 'Conversation' }} />
            {/* Define other screens in the chats stack if needed */}
        </Stack>
    );
} 