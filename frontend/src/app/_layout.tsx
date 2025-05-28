import "../global.css";
import { Stack } from "expo-router";
import { View } from "react-native";
import { colors } from "../theme"; // Assuming theme is here

export default function RootLayout() {
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

      {/* Define the entry point for the tab navigator */}
      {/* All screens within "(tabs)" will use the Tabs layout */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

    </Stack>
  );
}
