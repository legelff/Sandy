import "../global.css";
import { Stack, Slot, SplashScreen } from "expo-router";
import { View } from "react-native";
import { colors } from "../theme"; // Assuming theme is here
import { useAuthStore } from "../store/useAuthStore"; // Assuming this is your Zustand store
import { shallow } from 'zustand/shallow'; // Import shallow
import React, { useEffect } from 'react';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  console.log('RootLayout rendering. isLoading:', isLoading, 'User:', user);

  // Prevent rendering until auth state is loaded
  // SplashScreen.preventAutoHideAsync(); // Call this at the very start of your app

  // useEffect(() => {
  //   if (!isLoading) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [isLoading]);


  if (isLoading) {
    console.log('RootLayout: isLoading is true, returning null.');
    return null; // Or a loading spinner
  }

  console.log('RootLayout: isLoading is false. User subscriptionType:', user?.subscriptionType);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background, // Example: Use theme color
        },
        headerTintColor: colors.primary, // Example: Use theme color
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false, // Default to no header, can be overridden per screen
      }}
    >
      {/* Define a group for screens that should NOT have the tab bar */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ title: 'Select Role', headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      {/* Add other auth/onboarding screens here if needed */}

      {/* Conditionally render tab layouts */}
      {user?.subscriptionType === 'petSitter' ? (
        <Stack.Screen name="(petSitterTabs)" options={{ headerShown: false }} />
      ) : user?.subscriptionType === 'petOwner' ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : // No need for a fallback Stack.Screen here. Expo Router will try to render
        // one of the screens defined above (like "index") if no user or subscription type is found.
        null}
    </Stack>
  );
}
