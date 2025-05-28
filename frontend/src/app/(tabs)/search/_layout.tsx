import { Stack } from 'expo-router';
import React from 'react';

/**
 * SearchStackLayout defines the stack navigator for the search section.
 * This allows for nested navigation within the "Search" tab.
 */
const SearchStackLayout: React.FC = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index" // This is frontend/src/app/(tabs)/search/index.tsx
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="results" // This is frontend/src/app/(tabs)/search/results.tsx
                options={{
                    headerShown: false,
                    // The tab bar is controlled by the parent navigator (TabsLayout in app/(tabs)/_layout.tsx)
                    // To hide the tab bar for only this screen, we set tabBarVisible: false in parent if possible
                    // or rely on headerShown: false and full screen presentation. 
                    // For Expo Router v5+, to hide parent navigator's UI (like tabs), you might need to push it as a different presentation style
                    // or more directly: use `tabBarStyle: { display: 'none' }` in the screen options if supported by the parent Tab navigator screen options
                    // For now, simply not showing a header. Hiding tab bar requires specific handling in parent Tabs navigator for this screen.
                }}
            />
        </Stack>
    );
};

export default SearchStackLayout; 