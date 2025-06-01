import { Stack } from 'expo-router';
import React from 'react';

export default function OptionsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="details" options={{ title: 'Edit Request' }} />
        </Stack>
    );
} 