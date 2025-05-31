import { Stack } from 'expo-router';
import React from 'react';

export default function ChatsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ title: 'Conversation' }} />
        </Stack>
    );
} 